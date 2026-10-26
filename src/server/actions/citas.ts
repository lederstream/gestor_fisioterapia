"use server";

import { revalidatePath } from "next/cache";
import { agendarCitaSchema, type AgendarCitaInput } from "@/lib/validations";
import { dbStore } from "@/lib/store";
import { obtenerIpCliente } from "./auditoria";

import { prisma } from "@/lib/prisma";

export interface ServerActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: agendarCita()
 * Control de Concurrencia y Transaccionalidad Atómica:
 * 1. Valida sala física disponible y sin solapamiento horario (inicio < finExistente AND fin > inicioExistente).
 * 2. Valida terapeuta disponible sin solapamiento horario.
 * 3. Valida saldo de sesiones disponibles del paquete del paciente.
 * 4. Aplica regla clínica: Si la sesión es múltiplo de 5, activa la bandera 'esReevaluacion'.
 * 5. Soporte transaccional atómico ACID con prisma.$transaction cuando hay base de datos conectada.
 */
export async function agendarCita(
  input: AgendarCitaInput,
  usuarioAuditoria?: { id?: string; nombre: string; rol: any }
): Promise<ServerActionResult> {
  try {
    const validated = agendarCitaSchema.parse(input);
    const clientIp = await obtenerIpCliente();
    const duracionMinutos = validated.duracionMinutos || 45;
    const inicio = new Date(validated.fechaHoraInicio);
    const fin = new Date(inicio.getTime() + duracionMinutos * 60000);

    // Si existe conexión real configurada a PostgreSQL en la nube (Supabase / Neon), ejecutar en transacción atómica
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const resultadoTx = await prisma.$transaction(async (tx: any) => {
          const sala = await tx.sala.findUnique({ where: { id: validated.salaId } });
          if (!sala) throw new Error("La sala física seleccionada no existe.");
          if (sala.estado === "MANTENIMIENTO") {
            throw new Error(`La ${sala.nombre} se encuentra temporalmente en MANTENIMIENTO.`);
          }

          // Validar solapamiento de sala en DB
          const solapamientoSala = await tx.cita.findFirst({
            where: {
              salaId: validated.salaId,
              estado: { not: "CANCELADA" },
              AND: [
                { fechaHoraInicio: { lt: fin } },
                { fechaHoraFin: { gt: inicio } },
              ],
            },
          });
          if (solapamientoSala) {
            throw new Error(`Conflicto de Horario en Sala: La ${sala.nombre} ya tiene una cita reservada en ese bloque horario.`);
          }

          // Validar solapamiento de terapeuta en DB
          const solapamientoTerapeuta = await tx.cita.findFirst({
            where: {
              terapeutaId: validated.terapeutaId,
              estado: { not: "CANCELADA" },
              AND: [
                { fechaHoraInicio: { lt: fin } },
                { fechaHoraFin: { gt: inicio } },
              ],
            },
          });
          if (solapamientoTerapeuta) {
            throw new Error("Conflicto de Terapeuta: El profesional ya cuenta con otra atención asignada en ese bloque horario.");
          }

          // Validar saldo de paquete
          let esReevaluacion = validated.esReevaluacion || false;
          if (validated.paqueteId) {
            const paquete = await tx.tratamientoPaquete.findUnique({
              where: { id: validated.paqueteId },
              include: { citas: true },
            });
            if (!paquete) throw new Error("El paquete de sesiones especificado no existe.");
            const citasActivas = paquete.citas.filter((c: any) => c.estado !== "CANCELADA");
            if (citasActivas.length >= paquete.totalSesiones) {
              throw new Error(`Saldo de sesiones agotado: El paquete cuenta con ${paquete.totalSesiones} sesiones y ya están cubiertas.`);
            }
            if ((citasActivas.length + 1) % 5 === 0) {
              esReevaluacion = true;
            }
          }

          // Inserción atómica
          const nuevaCitaDb = await tx.cita.create({
            data: {
              pacienteId: validated.pacienteId,
              paqueteId: validated.paqueteId || null,
              terapeutaId: validated.terapeutaId,
              salaId: validated.salaId,
              fechaHoraInicio: inicio,
              fechaHoraFin: fin,
              estado: "PROGRAMADA",
              esReevaluacion,
              notasCita: validated.notasCita || null,
              creadoPorNombre: usuarioAuditoria?.nombre || "Recepción AJ Fisioterapia",
            },
          });

          // Trazabilidad y auditoría
          await tx.auditLog.create({
            data: {
              usuarioId: usuarioAuditoria?.id,
              usuarioNombre: usuarioAuditoria?.nombre || "Recepción AJ Fisioterapia",
              usuarioRol: usuarioAuditoria?.rol || "RECEPCION",
              accion: "CITA_CREADA",
              modulo: "AGENDA",
              entidadId: nuevaCitaDb.id,
              detalles: `Cita agendada para el paciente ${validated.pacienteId} en ${sala.nombre}. ${esReevaluacion ? "[HITO REEVALUACIÓN OBLIGATORIA]" : ""}${validated.notasCita ? ` [Notas: ${validated.notasCita}]` : ""}`,
              ipAddress: clientIp,
            },
          });

          return nuevaCitaDb;
        });

        // Sincronizar en el motor de memoria
        dbStore.agendarCita({
          pacienteId: validated.pacienteId,
          paqueteId: validated.paqueteId,
          terapeutaId: validated.terapeutaId,
          salaId: validated.salaId,
          fechaHoraInicio: validated.fechaHoraInicio,
          duracionMinutos: validated.duracionMinutos,
          esReevaluacion: validated.esReevaluacion,
          notasCita: validated.notasCita,
          usuarioAuditoria,
          ipAddress: clientIp,
        });

        revalidatePath("/dashboard/agenda");
        revalidatePath(`/dashboard/pacientes/${validated.pacienteId}`);
        revalidatePath("/dashboard/auditoria");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/mis-citas");
        revalidatePath("/dashboard/tratamiento");
        revalidatePath("/dashboard/mis-pagos");

        return { success: true, data: resultadoTx };
      } catch (dbErr: any) {
        // Si la base de datos arrojó un error de validación de negocio, propagarlo
        if (dbErr.message && !dbErr.message.includes("connect") && !dbErr.message.includes("Can't reach database")) {
          return { success: false, error: dbErr.message };
        }
      }
    }

    // Ejecución en el motor de negocio en memoria con control estricto de concurrencia y auditoría
    const nuevaCita = dbStore.agendarCita({
      pacienteId: validated.pacienteId,
      paqueteId: validated.paqueteId,
      terapeutaId: validated.terapeutaId,
      salaId: validated.salaId,
      fechaHoraInicio: validated.fechaHoraInicio,
      duracionMinutos: validated.duracionMinutos,
      esReevaluacion: validated.esReevaluacion,
      usuarioAuditoria,
      ipAddress: clientIp,
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath(`/dashboard/pacientes/${validated.pacienteId}`);
    revalidatePath("/dashboard/auditoria");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/mis-citas");
    revalidatePath("/dashboard/tratamiento");
    revalidatePath("/dashboard/mis-pagos");

    return {
      success: true,
      data: nuevaCita,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al agendar la cita.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Obtener citas de la agenda para una fecha dada (con datos de sala, terapeuta y paciente)
 */
export async function obtenerCitasAgenda(fechaIso?: string) {
  const targetDate = fechaIso ? new Date(fechaIso) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      const [citasDb, salasDb, terapeutasDb, serviciosDb, paquetesDb, pacientesDb] = await Promise.all([
        prisma.cita.findMany({
          where: {
            fechaHoraInicio: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            paciente: true,
            sala: true,
            terapeuta: true,
            paquete: {
              include: {
                servicio: true,
              },
            },
          },
          orderBy: {
            fechaHoraInicio: "asc",
          },
        }),
        prisma.sala.findMany({ orderBy: { nombre: "asc" } }),
        prisma.user.findMany({
          where: { rol: { in: ["TERAPEUTA", "ASISTENTE"] } },
          orderBy: { nombre: "asc" },
        }),
        prisma.servicio.findMany({ orderBy: { orden: "asc" } }),
        prisma.tratamientoPaquete.findMany(),
        prisma.paciente.findMany(),
      ]);

      const citasFormateadas = citasDb.map((c) => ({
        id: c.id,
        paqueteId: c.paqueteId,
        terapeutaId: c.terapeutaId,
        salaId: c.salaId,
        pacienteId: c.pacienteId,
        fechaHoraInicio: c.fechaHoraInicio.toISOString(),
        fechaHoraFin: c.fechaHoraFin.toISOString(),
        estado: c.estado as any,
        esReevaluacion: c.esReevaluacion,
        creadoPorNombre: c.creadoPorNombre || undefined,
        confirmadoPorNombre: c.confirmadoPorNombre || undefined,
        createdAt: c.createdAt.toISOString(),
        paciente: c.paciente ? {
          ...c.paciente,
          fechaNacimiento: c.paciente.fechaNacimiento.toISOString().split("T")[0],
          createdAt: c.paciente.createdAt.toISOString(),
        } : undefined,
        sala: c.sala,
        terapeuta: c.terapeuta,
        paquete: c.paquete ? {
          ...c.paquete,
          montoTotal: Number(c.paquete.montoTotal),
          montoPagado: Number(c.paquete.montoPagado),
          createdAt: c.paquete.createdAt.toISOString(),
        } : undefined,
        servicio: c.paquete?.servicio ? {
          ...c.paquete.servicio,
          precioBase: Number(c.paquete.servicio.precioBase),
          precioPromocional: c.paquete.servicio.precioPromocional ? Number(c.paquete.servicio.precioPromocional) : undefined,
        } : (serviciosDb[0] ? {
          ...serviciosDb[0],
          precioBase: Number(serviciosDb[0].precioBase),
          precioPromocional: serviciosDb[0].precioPromocional ? Number(serviciosDb[0].precioPromocional) : undefined,
        } : undefined),
      }));

      return {
        fecha: startOfDay.toISOString(),
        citas: citasFormateadas,
        salas: salasDb.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          estado: s.estado as any,
          capacidadSimultanea: 1,
        })),
        terapeutas: terapeutasDb.map((t) => ({
          id: t.id,
          nombre: t.nombre,
          email: t.email,
          rol: t.rol as any,
          especialidad: t.especialidad || undefined,
          estado: t.estado as any,
        })),
        servicios: serviciosDb.map((s) => ({
          ...s,
          precioBase: Number(s.precioBase),
          precioPromocional: s.precioPromocional ? Number(s.precioPromocional) : undefined,
        })),
      };
    } catch (err) {
      console.warn("obtenerCitasAgenda: Error al consultar Supabase, usando dbStore:", err);
    }
  }

  const citas = dbStore.getCitas();
  const pacientes = dbStore.getPacientes();
  const salas = dbStore.getSalas();
  const terapeutas = dbStore.getTerapeutas();
  const servicios = dbStore.getServicios();
  const paquetes = dbStore.getPaquetes();

  const citasFiltradas = citas
    .filter((c) => {
      const cDate = new Date(c.fechaHoraInicio);
      return cDate >= startOfDay && cDate <= endOfDay;
    })
    .map((c) => {
      const paciente = pacientes.find((p) => p.id === c.pacienteId);
      const sala = salas.find((s) => s.id === c.salaId);
      const terapeuta = terapeutas.find((t) => t.id === c.terapeutaId);
      const paquete = paquetes.find((pa) => pa.id === c.paqueteId);
      const servicio = paquete ? servicios.find((s) => s.id === paquete.servicioId) : servicios[0];

      return {
        ...c,
        paciente,
        sala,
        terapeuta,
        paquete,
        servicio,
      };
    });

  return {
    fecha: startOfDay.toISOString(),
    citas: citasFiltradas,
    salas,
    terapeutas,
    servicios,
  };
}

/**
 * Cambiar estado de una cita (CONFIRMAR, CANCELAR, NO_ASISTIO) con trazabilidad de recepcionista
 */
export async function actualizarEstadoCita(
  citaId: string,
  nuevoEstado: "PROGRAMADA" | "CONFIRMADA" | "ATENDIDA" | "CANCELADA" | "NO_ASISTIO",
  usuarioInfo?: { id?: string; nombre: string; rol: any }
): Promise<ServerActionResult> {
  try {
    const clientIp = await obtenerIpCliente();
    const infoConIp = {
      ...(usuarioInfo || { id: "usr-rec-1", nombre: "Recepción AJ Fisioterapia", rol: "RECEPCION" }),
      ipAddress: clientIp,
    };
    const actualizada = dbStore.actualizarEstadoCita(citaId, nuevoEstado, infoConIp);

    // Sincronización en Supabase PostgreSQL
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const citaDb = await prisma.cita.findUnique({ where: { id: citaId } });
        if (citaDb) {
          await prisma.cita.update({
            where: { id: citaId },
            data: {
              estado: nuevoEstado as any,
              confirmadoPorNombre: nuevoEstado === "CONFIRMADA" ? (usuarioInfo?.nombre || "Recepción") : undefined,
            },
          });
          if (nuevoEstado === "ATENDIDA" && citaDb.paqueteId) {
            await prisma.tratamientoPaquete.update({
              where: { id: citaDb.paqueteId },
              data: {
                sesionesConsumidas: { increment: 1 },
              },
            });
          }
        }
      } catch (dbErr) {
        console.warn("DB sync warning (actualizarEstadoCita):", dbErr);
      }
    }

    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/auditoria");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/mis-citas");
    revalidatePath("/dashboard/tratamiento");
    revalidatePath("/dashboard/mis-pagos");
    return { success: true, data: actualizada };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar estado.";
    return { success: false, error: message };
  }
}

/**
 * Reprogramar una cita (cambio de fecha, hora, sala o terapeuta) con control de concurrencia
 */
export async function reprogramarCita(params: {
  citaId: string;
  nuevaFechaHoraInicio: string | Date;
  nuevaSalaId: string;
  nuevoTerapeutaId: string;
  duracionMinutos?: number;
  usuarioInfo?: { id?: string; nombre: string; rol: any };
}): Promise<ServerActionResult> {
  try {
    const clientIp = await obtenerIpCliente();
    const fechaDate = new Date(params.nuevaFechaHoraInicio);
    const duracion = params.duracionMinutos || 45;
    const fechaFin = new Date(fechaDate.getTime() + duracion * 60000);

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        // Validar solapamiento en DB
        const solapamiento = await prisma.cita.findFirst({
          where: {
            id: { not: params.citaId },
            estado: { not: "CANCELADA" },
            OR: [
              { salaId: params.nuevaSalaId },
              { terapeutaId: params.nuevoTerapeutaId },
            ],
            AND: [
              { fechaHoraInicio: { lt: fechaFin } },
              { fechaHoraFin: { gt: fechaDate } },
            ],
          },
        });

        if (solapamiento) {
          return { success: false, error: "Conflicto de horario: La sala o el terapeuta ya tienen una cita asignada en ese bloque horario." };
        }

        const actualizadaDb = await prisma.cita.update({
          where: { id: params.citaId },
          data: {
            salaId: params.nuevaSalaId,
            terapeutaId: params.nuevoTerapeutaId,
            fechaHoraInicio: fechaDate,
            fechaHoraFin: fechaFin,
          },
        });

        revalidatePath("/dashboard/agenda");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/mis-citas");
        revalidatePath("/dashboard/tratamiento");
        revalidatePath("/dashboard/mis-pagos");
        return { success: true, data: actualizadaDb };
      } catch (errDb: any) {
        console.warn("reprogramarCita db error:", errDb);
      }
    }

    const reprogramada = dbStore.reprogramarCita({
      citaId: params.citaId,
      nuevaFechaHoraInicio: fechaDate,
      nuevaSalaId: params.nuevaSalaId,
      nuevoTerapeutaId: params.nuevoTerapeutaId,
      duracionMinutos: params.duracionMinutos,
      usuarioAuditoria: params.usuarioInfo || { id: "usr-rec-1", nombre: "Recepción AJ Fisioterapia", rol: "RECEPCION" },
      ipAddress: clientIp,
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/auditoria");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/mis-citas");
    revalidatePath("/dashboard/tratamiento");
    revalidatePath("/dashboard/mis-pagos");
    return { success: true, data: reprogramada };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al reprogramar la cita.";
    return { success: false, error: message };
  }
}


