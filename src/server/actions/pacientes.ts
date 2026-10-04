"use server";

import { revalidatePath } from "next/cache";
import { crearPacienteSchema, type CrearPacienteInput } from "@/lib/validations";
import { dbStore } from "@/lib/store";
import { ServerActionResult } from "./citas";

export async function obtenerFichaPaciente(id: string) {
  return dbStore.getPacienteById(id);
}

export async function listarPacientes() {
  const pacientes = dbStore.getPacientes();
  const paquetes = dbStore.getPaquetes();
  const citas = dbStore.getCitas();

  return pacientes.map((pac) => {
    const misPaquetes = paquetes.filter((p) => p.pacienteId === pac.id);
    const misCitas = citas.filter((c) => c.pacienteId === pac.id);
    const tieneReevaluacionPendiente = misCitas.some((c) => c.esReevaluacion && c.estado === "PROGRAMADA");

    return {
      ...pac,
      paquetesCount: misPaquetes.length,
      citasCount: misCitas.length,
      tieneReevaluacionPendiente,
    };
  });
}

export async function crearPaciente(input: CrearPacienteInput): Promise<ServerActionResult> {
  try {
    const validated = crearPacienteSchema.parse(input);

    const nuevo = dbStore.crearPaciente({
      dni: validated.dni,
      nombres: validated.nombres,
      apellidos: validated.apellidos,
      telefono: validated.telefono,
      email: validated.email || undefined,
      fechaNacimiento: validated.fechaNacimiento.toISOString().split("T")[0],
      contactoEmergencia: validated.contactoEmergencia || undefined,
    });

    revalidatePath("/dashboard/pacientes");
    return { success: true, data: nuevo };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar paciente.";
    return { success: false, error: message };
  }
}

export async function asignarPaqueteTratamiento(params: {
  pacienteId: string;
  servicioId: string;
  totalSesiones: number;
  montoTotal: number;
}): Promise<ServerActionResult> {
  try {
    const nuevoPaq = dbStore.crearPaquete({
      pacienteId: params.pacienteId,
      servicioId: params.servicioId,
      totalSesiones: params.totalSesiones,
      montoTotal: params.montoTotal,
    });

    revalidatePath(`/dashboard/pacientes/${params.pacienteId}`);
    revalidatePath("/dashboard/caja");
    revalidatePath("/dashboard");

    return { success: true, data: nuevoPaq };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al asignar paquete.";
    return { success: false, error: message };
  }
}
