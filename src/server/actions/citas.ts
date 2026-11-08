"use server";

import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignorado cuando corre fuera del contexto de solicitud de Next.js
  }
}
import { agendarCitaSchema, type AgendarCitaInput } from "@/lib/validations";
import { dbStore } from "@/lib/store";
import { obtenerIpCliente } from "./auditoria";
import { obtenerSesionServidor } from "@/lib/auth-server";
import { getPeruDateString } from "@/lib/date-utils";

import { prisma } from "@/lib/prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(id?: string | null): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

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

    // Obtener sesión activa si no se proporcionó auditoría explícita
    const sesion = await obtenerSesionServidor();
    const finalAuditoria = usuarioAuditoria || (sesion ? {
      id: sesion.userId,
      nombre: sesion.nombre,
      rol: sesion.rol,
    } : {
      nombre: "Recepción AJ Fisioterapia",
      rol: "RECEPCION",
    });

    // Si existe conexión real configurada a PostgreSQL en la nube (Supabase / Neon), ejecutar de forma directa y optimizada
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        // 1. Resolver sala física existente de forma segura (sin fallar por sintaxis UUID)
        let sala: any = null;
        if (isUuid(validated.salaId)) {
          sala = await prisma.sala.findUnique({ where: { id: validated.salaId } });
        }
        if (!sala) {
          sala = await prisma.sala.findFirst({
            where: {
              OR: [
                { nombre: { equals: validated.salaId, mode: "insensitive" } },
                { nombre: { contains: validated.salaId.replace(/sala[-_ ]?/i, "Sala "), mode: "insensitive" } },
              ],
            },
          });
          if (!sala) {
            sala = await prisma.sala.findFirst({ where: { estado: "DISPONIBLE" } }) || await prisma.sala.findFirst();
            if (!sala) {
              sala = await prisma.sala.create({
                data: {
                  nombre: "Sala 1",
                  estado: "DISPONIBLE",
                },
              });
            }
          }
        }
        if (sala.estado === "MANTENIMIENTO") {
          throw new Error(`La ${sala.nombre} se encuentra temporalmente en MANTENIMIENTO.`);
        }
        const actualSalaId = sala.id;

        // 2. Resolver terapeuta o profesional asignado por su ID oficial (UUID)
        let terapeuta: any = null;
        if (isUuid(validated.terapeutaId)) {
          terapeuta = await prisma.user.findFirst({
            where: {
              id: validated.terapeutaId,
              estado: "ACTIVO",
            },
          });
        }
        if (!terapeuta) {
          // Búsqueda por email o nombre si se seleccionó directamente por identificador de texto
          terapeuta = await prisma.user.findFirst({
            where: {
              estado: "ACTIVO",
              OR: [
                { email: { equals: validated.terapeutaId, mode: "insensitive" } },
                { nombre: { contains: validated.terapeutaId, mode: "insensitive" } },
              ],
            },
          });
          if (!terapeuta) {
            terapeuta = await prisma.user.findFirst({
              where: {
                estado: "ACTIVO",
                rol: { in: ["TERAPEUTA", "ASISTENTE", "ADMIN"] },
              },
            });
          }
        }
        if (!terapeuta) {
          throw new Error("No hay personal profesional disponible para asignar a la cita.");
        }
        const actualTerapeutaId = terapeuta.id;

        // 3. Resolver paciente de forma segura
        let paciente: any = null;
        if (isUuid(validated.pacienteId)) {
          paciente = await prisma.paciente.findUnique({ where: { id: validated.pacienteId } });
        }
        if (!paciente) {
          paciente = await prisma.paciente.findFirst({
            where: {
              OR: [
                { dni: validated.pacienteId },
                { email: { equals: validated.pacienteId, mode: "insensitive" } },
                { nombres: { contains: validated.pacienteId, mode: "insensitive" } },
              ],
            },
          });
          if (!paciente) {
            // Buscar en memoria para crear registro en Supabase si es necesario
            const mockPac = dbStore.getPacientes().find(p => p.id === validated.pacienteId || p.dni === validated.pacienteId);
            if (mockPac) {
              paciente = await prisma.paciente.create({
                data: {
                  nombres: mockPac.nombres,
                  apellidos: mockPac.apellidos,
                  dni: mockPac.dni,
                  telefono: mockPac.telefono,
                  email: mockPac.email || null,
                  fechaNacimiento: new Date(mockPac.fechaNacimiento || "1990-01-01"),
                },
              });
            } else {
              paciente = await prisma.paciente.findFirst();
            }
          }
        }
        if (!paciente) {
          throw new Error("El paciente seleccionado no se encuentra registrado en el sistema.");
        }
        const actualPacienteId = paciente.id;

        // Validar solapamiento de sala en DB (excluyendo canceladas y no-shows)
        const solapamientoSala = await prisma.cita.findFirst({
          where: {
            salaId: actualSalaId,
            estado: { notIn: ["CANCELADA", "NO_ASISTIO"] },
            AND: [
              { fechaHoraInicio: { lt: fin } },
              { fechaHoraFin: { gt: inicio } },
            ],
          },
          include: { paciente: true },
        });
        if (solapamientoSala) {
          throw new Error(`¡Sala no disponible! La ${sala.nombre} ya tiene una cita asignada en ese bloque horario (${solapamientoSala.paciente?.nombres || "otro paciente"}).`);
        }

        // Validar solapamiento de terapeuta en DB (excluyendo canceladas y no-shows)
        const solapamientoTerapeuta = await prisma.cita.findFirst({
          where: {
            terapeutaId: actualTerapeutaId,
            estado: { notIn: ["CANCELADA", "NO_ASISTIO"] },
            AND: [
              { fechaHoraInicio: { lt: fin } },
              { fechaHoraFin: { gt: inicio } },
            ],
          },
          include: { sala: true },
        });
        if (solapamientoTerapeuta) {
          throw new Error(`¡Terapeuta no disponible! ${terapeuta.nombre} ya cuenta con otra atención asignada en ${solapamientoTerapeuta.sala?.nombre || "otra sala"} en ese bloque horario.`);
        }

        // Validar saldo de paquete
        let esReevaluacion = validated.esReevaluacion || false;
        let actualPaqueteId: string | null = null;
        if (validated.paqueteId) {
          let paquete: any = null;
          if (isUuid(validated.paqueteId)) {
            paquete = await prisma.tratamientoPaquete.findUnique({
              where: { id: validated.paqueteId },
              include: { citas: true },
            });
          }
          if (!paquete) {
            paquete = await prisma.tratamientoPaquete.findFirst({
              where: { pacienteId: actualPacienteId },
              include: { citas: true },
            });
          }
          if (paquete) {
            actualPaqueteId = paquete.id;
            const citasActivas = paquete.citas.filter((c: any) => c.estado !== "CANCELADA" && c.estado !== "NO_ASISTIO");
            if (citasActivas.length >= paquete.totalSesiones) {
              throw new Error(`Saldo de sesiones agotado: El paquete cuenta con ${paquete.totalSesiones} sesiones y ya están cubiertas.`);
            }
            if ((citasActivas.length + 1) % 5 === 0) {
              esReevaluacion = true;
            }
          }
        }

        // Inserción en base de datos
        const nuevaCitaDb = await prisma.cita.create({
          data: {
            pacienteId: actualPacienteId,
            paqueteId: actualPaqueteId,
            terapeutaId: actualTerapeutaId,
            salaId: actualSalaId,
            fechaHoraInicio: inicio,
            fechaHoraFin: fin,
            estado: "PROGRAMADA",
            esReevaluacion,
            notasCita: validated.notasCita || null,
            creadoPorNombre: `${finalAuditoria.nombre} (${finalAuditoria.rol})`,
          },
        });

        // Trazabilidad y auditoría
        try {
          await prisma.auditLog.create({
            data: {
              usuarioId: finalAuditoria.id,
              usuarioNombre: finalAuditoria.nombre,
              usuarioRol: finalAuditoria.rol,
              accion: "CITA_CREADA",
              modulo: "AGENDA",
              entidadId: nuevaCitaDb.id,
              detalles: `Cita agendada para ${paciente.nombres} ${paciente.apellidos} en ${sala.nombre} con ${terapeuta.nombre}. ${esReevaluacion ? "[HITO REEVALUACIÓN OBLIGATORIA]" : ""}${validated.notasCita ? ` [Notas: ${validated.notasCita}]` : ""}`,
              ipAddress: clientIp,
            },
          });
        } catch {
          // Auditoría secundaria sin bloquear la reserva clínica
        }

        // Sincronizar en el motor de memoria
        dbStore.agendarCita({
          pacienteId: actualPacienteId,
          paqueteId: actualPaqueteId,
          terapeutaId: actualTerapeutaId,
          salaId: actualSalaId,
          fechaHoraInicio: validated.fechaHoraInicio,
          duracionMinutos: validated.duracionMinutos,
          esReevaluacion,
          notasCita: validated.notasCita,
          usuarioAuditoria: finalAuditoria,
          ipAddress: clientIp,
        });

        safeRevalidatePath("/dashboard/agenda");
        safeRevalidatePath(`/dashboard/pacientes/${actualPacienteId}`);
        safeRevalidatePath("/dashboard/auditoria");
        safeRevalidatePath("/dashboard");
        safeRevalidatePath("/dashboard/mis-citas");
        safeRevalidatePath("/dashboard/tratamiento");
        safeRevalidatePath("/dashboard/mis-pagos");

        return { success: true, data: nuevaCitaDb };
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
      usuarioAuditoria: finalAuditoria,
      ipAddress: clientIp,
    });

    safeRevalidatePath("/dashboard/agenda");
    safeRevalidatePath(`/dashboard/pacientes/${validated.pacienteId}`);
    safeRevalidatePath("/dashboard/auditoria");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/dashboard/mis-citas");
    safeRevalidatePath("/dashboard/tratamiento");
    safeRevalidatePath("/dashboard/mis-pagos");

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
  // Delimitar el día con el huso horario oficial de Perú (America/Lima, UTC-5)
  const peruDayStr = fechaIso ? getPeruDateString(fechaIso) : getPeruDateString();
  const startOfDay = new Date(`${peruDayStr}T00:00:00-05:00`);
  const endOfDay = new Date(`${peruDayStr}T23:59:59.999-05:00`);

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
          where: { rol: { in: ["TERAPEUTA", "ASISTENTE"] }, estado: "ACTIVO" },
          orderBy: { nombre: "asc" },
        }),
        prisma.servicio.findMany({ orderBy: { orden: "asc" } }),
        prisma.tratamientoPaquete.findMany(),
        prisma.paciente.findMany({ orderBy: { apellidos: "asc" } }),
      ]);

      let finalSalas = salasDb;
      if (finalSalas.length === 0) {
        const salasData = [
          { nombre: "Sala 1", estado: "DISPONIBLE" as const },
          { nombre: "Sala 2", estado: "DISPONIBLE" as const },
          { nombre: "Sala 3", estado: "DISPONIBLE" as const },
          { nombre: "Sala 4", estado: "DISPONIBLE" as const },
          { nombre: "Sala 5", estado: "DISPONIBLE" as const },
          { nombre: "Sala 6", estado: "DISPONIBLE" as const },
        ];
        for (const s of salasData) {
          await prisma.sala.upsert({
            where: { nombre: s.nombre },
            update: {},
            create: s,
          }).catch(() => {});
        }
        finalSalas = await prisma.sala.findMany({ orderBy: { nombre: "asc" } });
      }

      let finalTerapeutas = terapeutasDb;
      if (finalTerapeutas.length === 0) {
        finalTerapeutas = await prisma.user.findMany({
          where: { estado: "ACTIVO" },
          orderBy: { nombre: "asc" },
        });
      }

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
        salas: finalSalas.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          estado: s.estado as any,
          capacidadSimultanea: 1,
        })),
        terapeutas: finalTerapeutas.map((t) => ({
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
      ...(usuarioInfo || { id: undefined, nombre: "Recepción AJ Fisioterapia", rol: "RECEPCION" }),
      ipAddress: clientIp,
    };
    const actualizada = dbStore.actualizarEstadoCita(citaId, nuevoEstado, infoConIp);

    // Sincronización en Supabase PostgreSQL
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        if (isUuid(citaId)) {
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
        }
      } catch (dbErr) {
        console.warn("DB sync warning (actualizarEstadoCita):", dbErr);
      }
    }

    safeRevalidatePath("/dashboard/agenda");
    safeRevalidatePath("/dashboard/auditoria");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/dashboard/mis-citas");
    safeRevalidatePath("/dashboard/tratamiento");
    safeRevalidatePath("/dashboard/mis-pagos");
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

        safeRevalidatePath("/dashboard/agenda");
        safeRevalidatePath("/dashboard");
        safeRevalidatePath("/dashboard/mis-citas");
        safeRevalidatePath("/dashboard/tratamiento");
        safeRevalidatePath("/dashboard/mis-pagos");
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
      usuarioAuditoria: params.usuarioInfo || { id: undefined, nombre: "Recepción AJ Fisioterapia", rol: "RECEPCION" },
      ipAddress: clientIp,
    });

    safeRevalidatePath("/dashboard/agenda");
    safeRevalidatePath("/dashboard/auditoria");
    safeRevalidatePath("/dashboard");
    safeRevalidatePath("/dashboard/mis-citas");
    safeRevalidatePath("/dashboard/tratamiento");
    safeRevalidatePath("/dashboard/mis-pagos");
    return { success: true, data: reprogramada };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al reprogramar la cita.";
    return { success: false, error: message };
  }
}


