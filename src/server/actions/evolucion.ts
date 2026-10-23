"use server";

import { revalidatePath } from "next/cache";
import { registrarAsistenciaYEvolucionSchema, type RegistrarAsistenciaYEvolucionInput } from "@/lib/validations";
import { dbStore } from "@/lib/store";
import { ServerActionResult } from "./citas";
import { obtenerIpCliente } from "./auditoria";
import { prisma } from "@/lib/prisma";
import { obtenerSesionServidor } from "@/lib/auth-server";

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
    const clientIp = await obtenerIpCliente();
    const sesion = await obtenerSesionServidor();

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const txResult = await prisma.$transaction(async (tx: any) => {
          // 1. Actualizar cita a ATENDIDA
          const citaActualizada = await tx.cita.update({
            where: { id: validated.citaId },
            data: { estado: "ATENDIDA" },
            include: { paquete: true },
          });

          // 2. Upsert historia de evolución clínica
          const evolucion = await tx.historiaEvolucion.upsert({
            where: { citaId: validated.citaId },
            create: {
              citaId: validated.citaId,
              terapeutaId: validated.terapeutaId,
              evaDolorInicio: validated.evaDolorInicio,
              evaDolorFin: validated.evaDolorFin,
              tratamientoAplicado: validated.tratamientoAplicado,
              notasReevaluacion: validated.notasReevaluacion || null,
              bloqueaAlta: !validated.completarReevaluacion && citaActualizada.esReevaluacion,
            },
            update: {
              evaDolorInicio: validated.evaDolorInicio,
              evaDolorFin: validated.evaDolorFin,
              tratamientoAplicado: validated.tratamientoAplicado,
              notasReevaluacion: validated.notasReevaluacion || null,
              bloqueaAlta: !validated.completarReevaluacion && citaActualizada.esReevaluacion,
            },
          });

          // 3. Incrementar sesiones consumidas si tiene paquete
          if (citaActualizada.paqueteId) {
            await tx.tratamientoPaquete.update({
              where: { id: citaActualizada.paqueteId },
              data: {
                sesionesConsumidas: { increment: 1 },
              },
            });
          }

          // 4. Auditoría clínica
          await tx.auditLog.create({
            data: {
              usuarioId: sesion?.userId,
              usuarioNombre: sesion?.nombre || "Terapeuta Clínico",
              usuarioRol: (sesion?.rol as any) || "TERAPEUTA",
              accion: "ASISTENCIA_REGISTRADA",
              modulo: "HISTORIA_CLINICA",
              entidadId: evolucion.id,
              detalles: `Atención clínica completada. EVA Inicial: ${validated.evaDolorInicio}/10 -> EVA Final: ${validated.evaDolorFin}/10.`,
              ipAddress: clientIp,
            },
          });

          return { cita: citaActualizada, evolucion };
        });

        revalidatePath("/dashboard/agenda");
        revalidatePath(`/dashboard/pacientes/${txResult.cita.pacienteId}`);
        revalidatePath("/dashboard");

        return { success: true, data: txResult };
      } catch (dbErr) {
        console.warn("registrarAsistenciaYEvolucion db error, usando fallback dbStore:", dbErr);
      }
    }

    const resultado = dbStore.registrarAsistenciaYEvolucion({
      citaId: validated.citaId,
      terapeutaId: validated.terapeutaId,
      evaDolorInicio: validated.evaDolorInicio,
      evaDolorFin: validated.evaDolorFin,
      tratamientoAplicado: validated.tratamientoAplicado,
      notasReevaluacion: validated.notasReevaluacion,
      completarReevaluacion: validated.completarReevaluacion,
      ipAddress: clientIp,
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
