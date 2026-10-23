"use server";

import { revalidatePath } from "next/cache";
import { dbStore } from "@/lib/store";
import { agendarCita, ServerActionResult } from "./citas";
import { prisma } from "@/lib/prisma";

export interface SolicitarReservaPublicaInput {
  dni: string;
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono: string;
  email?: string;
  servicioId: string;
  fecha: string;      // YYYY-MM-DD
  horario: string;    // "09:00 - 10:00"
  motivoConsulta?: string;
}

/**
 * Server Action: solicitarReservaPublica()
 * Permite a un paciente solicitar cita directamente desde la web pública reduciendo
 * los 20-30 minutos de espera en recepción de la clínica.
 * 1. Valida los datos del paciente y verifica si ya existe por DNI (o lo crea en Supabase).
 * 2. Asigna la primera sala disponible del centro clínico.
 * 3. Asigna un terapeuta colegiado activo.
 * 4. Agrega la cita con estado PROGRAMADA en la agenda central con trazabilidad.
 */
export async function solicitarReservaPublica(
  input: SolicitarReservaPublicaInput
): Promise<ServerActionResult<{ cita: any; paciente: any }>> {
  try {
    const dniLimpio = input.dni.trim();
    if (!dniLimpio || dniLimpio.length < 8) {
      return { success: false, error: "El DNI ingresado debe contener al menos 8 dígitos." };
    }

    if (!input.primerNombre.trim() || !input.apellidoPaterno.trim()) {
      return { success: false, error: "Primer nombre y apellido paterno son requeridos." };
    }

    if (!input.telefono.trim()) {
      return { success: false, error: "El teléfono o celular de contacto es obligatorio." };
    }

    const nombres = [input.primerNombre.trim(), input.segundoNombre?.trim()].filter(Boolean).join(" ");
    const apellidos = [input.apellidoPaterno.trim(), input.apellidoMaterno?.trim()].filter(Boolean).join(" ");

    let pacienteId: string;
    let pacienteData: any;

    // 1. Obtener o crear paciente en Supabase DB
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        let pacDb = await prisma.paciente.findUnique({
          where: { dni: dniLimpio },
        });

        if (!pacDb) {
          pacDb = await prisma.paciente.create({
            data: {
              tipoDocumento: "DNI",
              dni: dniLimpio,
              primerNombre: input.primerNombre.trim(),
              segundoNombre: input.segundoNombre?.trim() || null,
              apellidoPaterno: input.apellidoPaterno.trim(),
              apellidoMaterno: input.apellidoMaterno?.trim() || null,
              nombres,
              apellidos,
              telefono: input.telefono.trim(),
              email: input.email?.trim() || null,
              fechaNacimiento: new Date("1995-01-01"),
              contactoEmergencia: "Registro vía portal público web",
            },
          });
        }
        pacienteId = pacDb.id;
        pacienteData = pacDb;
      } catch (errDb) {
        console.warn("solicitarReservaPublica: Error DB paciente, usando dbStore:", errDb);
        let pac = dbStore.getPacientes().find((p) => p.dni === dniLimpio);
        if (!pac) {
          pac = dbStore.crearPaciente({
            tipoDocumento: "DNI",
            dni: dniLimpio,
            primerNombre: input.primerNombre.trim(),
            segundoNombre: input.segundoNombre?.trim() || undefined,
            apellidoPaterno: input.apellidoPaterno.trim(),
            apellidoMaterno: input.apellidoMaterno?.trim() || undefined,
            nombres,
            apellidos,
            telefono: input.telefono.trim(),
            email: input.email?.trim() || undefined,
            fechaNacimiento: "1995-01-01",
            contactoEmergencia: "Registro vía portal público web",
          });
        }
        pacienteId = pac.id;
        pacienteData = pac;
      }
    } else {
      let pac = dbStore.getPacientes().find((p) => p.dni === dniLimpio);
      if (!pac) {
        pac = dbStore.crearPaciente({
          tipoDocumento: "DNI",
          dni: dniLimpio,
          primerNombre: input.primerNombre.trim(),
          segundoNombre: input.segundoNombre?.trim() || undefined,
          apellidoPaterno: input.apellidoPaterno.trim(),
          apellidoMaterno: input.apellidoMaterno?.trim() || undefined,
          nombres,
          apellidos,
          telefono: input.telefono.trim(),
          email: input.email?.trim() || undefined,
          fechaNacimiento: "1995-01-01",
          contactoEmergencia: "Registro vía portal público web",
        });
      }
      pacienteId = pac.id;
      pacienteData = pac;
    }

    // 2. Determinar horario y fecha de inicio
    const horaInicioStr = input.horario.split(" - ")[0] || "09:00";
    const fechaHoraInicio = new Date(`${input.fecha}T${horaInicioStr}:00`);

    if (isNaN(fechaHoraInicio.getTime())) {
      return { success: false, error: "Fecha u horario seleccionado inválido." };
    }

    // 3. Buscar salas y terapeutas activos
    let salas: any[] = [];
    let terapeutas: any[] = [];

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const [salasDb, terDb] = await Promise.all([
          prisma.sala.findMany({ where: { estado: "DISPONIBLE" } }),
          prisma.user.findMany({ where: { rol: "TERAPEUTA", estado: "ACTIVO" } }),
        ]);
        salas = salasDb;
        terapeutas = terDb;
      } catch {
        salas = dbStore.getSalas().filter((s) => s.estado === "DISPONIBLE");
        terapeutas = dbStore.getTerapeutas().filter((t) => t.estado === "ACTIVO");
      }
    } else {
      salas = dbStore.getSalas().filter((s) => s.estado === "DISPONIBLE");
      terapeutas = dbStore.getTerapeutas().filter((t) => t.estado === "ACTIVO");
    }

    if (salas.length === 0) {
      return { success: false, error: "No hay salas físicas disponibles para este horario." };
    }
    if (terapeutas.length === 0) {
      return { success: false, error: "No hay profesionales disponibles en el turno seleccionado." };
    }

    // Buscar una sala y terapeuta que no tengan conflicto en ese horario
    let salaAsignada = salas[0];
    let terapeutaAsignado = terapeutas[0];
    let reservaExitosa: any = null;
    let ultimoError = "";

    for (const sala of salas) {
      for (const terapeuta of terapeutas) {
        const intento = await agendarCita(
          {
            pacienteId,
            salaId: sala.id,
            terapeutaId: terapeuta.id,
            fechaHoraInicio,
            duracionMinutos: 45,
            esReevaluacion: false,
          },
          {
            id: "usr-portal-publico",
            nombre: "Portal Web de Pacientes",
            rol: "PACIENTE",
          }
        );

        if (intento.success) {
          reservaExitosa = intento.data;
          salaAsignada = sala;
          terapeutaAsignado = terapeuta;
          break;
        } else {
          ultimoError = intento.error || "";
        }
      }
      if (reservaExitosa) break;
    }

    if (!reservaExitosa) {
      return {
        success: false,
        error: ultimoError || "No hay disponibilidad en las salas físicas para ese bloque horario. Por favor elija otro turno.",
      };
    }

    revalidatePath("/dashboard/agenda");
    revalidatePath("/reservas");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        cita: {
          ...reservaExitosa,
          salaNombre: salaAsignada.nombre,
          terapeutaNombre: terapeutaAsignado.nombre,
        },
        paciente: pacienteData,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error inesperado al registrar su cita en línea.";
    return {
      success: false,
      error: msg,
    };
  }
}
