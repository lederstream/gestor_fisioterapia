"use server";

import { revalidatePath } from "next/cache";
import { dbStore } from "@/lib/store";
import { agendarCita, ServerActionResult } from "./citas";

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
 * los 20-30 minutos de espera en recepción de AJ Fisioterapia.
 * 1. Valida los datos del paciente y verifica si ya existe por DNI (o lo crea).
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

    // 1. Obtener o crear paciente
    let paciente = dbStore.getPacientes().find((p) => p.dni === dniLimpio);

    if (!paciente) {
      paciente = dbStore.crearPaciente({
        tipoDocumento: "DNI",
        dni: dniLimpio,
        primerNombre: input.primerNombre.trim(),
        segundoNombre: input.segundoNombre?.trim() || undefined,
        apellidoPaterno: input.apellidoPaterno.trim(),
        apellidoMaterno: input.apellidoMaterno?.trim() || undefined,
        nombres: [input.primerNombre.trim(), input.segundoNombre?.trim()].filter(Boolean).join(" "),
        apellidos: [input.apellidoPaterno.trim(), input.apellidoMaterno?.trim()].filter(Boolean).join(" "),
        telefono: input.telefono.trim(),
        email: input.email?.trim() || undefined,
        fechaNacimiento: "1995-01-01",
        contactoEmergencia: "Registro vía portal público web",
      });
    }

    // 2. Determinar horario y fecha de inicio
    const horaInicioStr = input.horario.split(" - ")[0] || "09:00";
    const fechaHoraInicio = new Date(`${input.fecha}T${horaInicioStr}:00`);

    if (isNaN(fechaHoraInicio.getTime())) {
      return { success: false, error: "Fecha u horario seleccionado inválido." };
    }

    // 3. Buscar salas y terapeutas activos
    const salas = dbStore.getSalas().filter((s) => s.estado === "DISPONIBLE");
    const terapeutas = dbStore.getTerapeutas().filter((t) => t.estado === "ACTIVO");

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
            pacienteId: paciente.id,
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
        paciente,
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
