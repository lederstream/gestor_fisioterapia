"use server";

import { revalidatePath } from "next/cache";
import { dbStore, ConfiguracionClinicaItem } from "@/lib/store";
import { ServerActionResult } from "./citas";

export async function obtenerConfiguracionCompleta() {
  const configuracion = dbStore.getConfiguracion();
  const salas = dbStore.getSalas();
  const servicios = dbStore.getServicios();
  const personal = dbStore.getUsers();

  return {
    configuracion,
    salas,
    servicios,
    personal,
  };
}

export async function guardarConfiguracionClinica(
  data: Partial<ConfiguracionClinicaItem>
): Promise<ServerActionResult<ConfiguracionClinicaItem>> {
  try {
    const actualizada = dbStore.actualizarConfiguracion(data, {
      id: "usr-admin-1",
      nombre: "Marco Antonio (Administrador)",
      rol: "ADMIN",
    });

    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");

    return { success: true, data: actualizada };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al guardar configuración.";
    return { success: false, error: message };
  }
}

export async function cambiarEstadoSala(
  salaId: string,
  nuevoEstado: "DISPONIBLE" | "MANTENIMIENTO",
  motivo?: string
): Promise<ServerActionResult> {
  try {
    const sala = dbStore.actualizarEstadoSala(salaId, nuevoEstado, motivo);
    revalidatePath("/dashboard/agenda");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard");
    return { success: true, data: sala };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al cambiar estado de sala.";
    return { success: false, error: message };
  }
}

export async function modificarServicio(
  servicioId: string,
  precioBase: number,
  duracionMinutos: number
): Promise<ServerActionResult> {
  try {
    const servicio = dbStore.actualizarServicio(servicioId, precioBase, duracionMinutos);
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/reservas");
    return { success: true, data: servicio };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar servicio.";
    return { success: false, error: message };
  }
}

export async function cambiarEstadoPersonal(
  usuarioId: string,
  estado: "ACTIVO" | "INACTIVO",
  especialidad?: string
): Promise<ServerActionResult> {
  try {
    const usuario = dbStore.actualizarUsuario(usuarioId, estado, especialidad);
    revalidatePath("/dashboard/configuracion");
    return { success: true, data: usuario };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar personal.";
    return { success: false, error: message };
  }
}
