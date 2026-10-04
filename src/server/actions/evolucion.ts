"use server";

import { revalidatePath } from "next/cache";
import { registrarAsistenciaYEvolucionSchema, type RegistrarAsistenciaYEvolucionInput } from "@/lib/validations";
import { dbStore } from "@/lib/store";
import { ServerActionResult } from "./citas";

/**
 * Server Action: registrarAsistenciaYEvolucion()
 * Regla Clínica Estricta:
 * 1. Marca la cita como 'ATENDIDA'.
 * 2. Registra la evolución clínica (Escala EVA inicio/fin y tratamiento aplicado).
 * 3. Incrementa 'sesiones_consumidas'.
 * 4. Si el nuevo total es múltiplo de 5 (5, 10, 15, 20), marca la siguiente cita como 'es_reevaluacion = true'.
 * 5. Bloquea la emisión de alta médica hasta completar formalmente la ficha de reevaluación.
 */
export async function registrarAsistenciaYEvolucion(
  input: RegistrarAsistenciaYEvolucionInput
): Promise<ServerActionResult> {
  try {
    const validated = registrarAsistenciaYEvolucionSchema.parse(input);

    const resultado = dbStore.registrarAsistenciaYEvolucion({
      citaId: validated.citaId,
      terapeutaId: validated.terapeutaId,
      evaDolorInicio: validated.evaDolorInicio,
      evaDolorFin: validated.evaDolorFin,
      tratamientoAplicado: validated.tratamientoAplicado,
      notasReevaluacion: validated.notasReevaluacion,
      completarReevaluacion: validated.completarReevaluacion,
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath(`/dashboard/pacientes/${resultado.cita.pacienteId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: resultado,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar la asistencia y evolución.";
    return {
      success: false,
      error: message,
    };
  }
}
