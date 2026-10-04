"use server";

import { revalidatePath } from "next/cache";
import { agendarCitaSchema, type AgendarCitaInput } from "@/lib/validations";
import { dbStore } from "@/lib/store";

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
export async function agendarCita(input: AgendarCitaInput): Promise<ServerActionResult> {
  try {
    const validated = agendarCitaSchema.parse(input);

    // Ejecución de la transacción en el motor de negocio
    const nuevaCita = dbStore.agendarCita({
      pacienteId: validated.pacienteId,
      paqueteId: validated.paqueteId,
      terapeutaId: validated.terapeutaId,
      salaId: validated.salaId,
      fechaHoraInicio: validated.fechaHoraInicio,
      duracionMinutos: validated.duracionMinutos,
      esReevaluacion: validated.esReevaluacion,
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath(`/dashboard/pacientes/${validated.pacienteId}`);
    revalidatePath("/dashboard");

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
  };
}

/**
 * Cambiar estado de una cita (CONFIRMAR, CANCELAR, NO_ASISTIO)
 */
export async function actualizarEstadoCita(
  citaId: string,
  nuevoEstado: "PROGRAMADA" | "CONFIRMADA" | "ATENDIDA" | "CANCELADA" | "NO_ASISTIO"
): Promise<ServerActionResult> {
  try {
    const citas = dbStore.getCitas();
    const index = citas.findIndex((c) => c.id === citaId);
    if (index === -1) throw new Error("Cita no encontrada.");

    citas[index].estado = nuevoEstado;
    revalidatePath("/dashboard/agenda");
    return { success: true, data: citas[index] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar estado.";
    return { success: false, error: message };
  }
}
