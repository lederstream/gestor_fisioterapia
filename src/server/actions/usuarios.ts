"use server";

import { revalidatePath } from "next/cache";
import { dbStore, UserItem } from "@/lib/store";
import { UserRole } from "@/lib/permissions";
import { ServerActionResult } from "./citas";

export async function obtenerUsuarios(): Promise<UserItem[]> {
  return dbStore.getUsers();
}

export async function crearNuevoUsuario(data: {
  nombre: string;
  email: string;
  rol: UserRole;
  especialidad?: string;
  estado?: "ACTIVO" | "INACTIVO";
}): Promise<ServerActionResult<UserItem>> {
  try {
    const usuario = dbStore.crearUsuario(data, {
      id: "usr-admin-1",
      nombre: "Marco Antonio (Administrador)",
      rol: "ADMIN",
    });

    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard/auditoria");
    revalidatePath("/dashboard");

    return { success: true, data: usuario };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al crear usuario.";
    return { success: false, error: message };
  }
}

export async function modificarRolUsuario(
  usuarioId: string,
  nuevoRol: UserRole
): Promise<ServerActionResult<UserItem>> {
  try {
    const usuario = dbStore.actualizarRolUsuario(usuarioId, nuevoRol, {
      id: "usr-admin-1",
      nombre: "Marco Antonio (Administrador)",
      rol: "ADMIN",
    });

    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard/auditoria");
    revalidatePath("/dashboard");

    return { success: true, data: usuario };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar rol de usuario.";
    return { success: false, error: message };
  }
}

export async function cambiarEstadoUsuario(
  usuarioId: string,
  nuevoEstado: "ACTIVO" | "INACTIVO"
): Promise<ServerActionResult<UserItem>> {
  try {
    const usuario = dbStore.actualizarUsuario(usuarioId, nuevoEstado);

    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard");

    return { success: true, data: usuario };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al cambiar estado del usuario.";
    return { success: false, error: message };
  }
}

export async function eliminarUsuarioSistema(
  usuarioId: string
): Promise<ServerActionResult<UserItem>> {
  try {
    const eliminado = dbStore.eliminarUsuario(usuarioId, {
      id: "usr-admin-1",
      nombre: "Marco Antonio (Administrador)",
      rol: "ADMIN",
    });

    revalidatePath("/dashboard/usuarios");
    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard/auditoria");

    return { success: true, data: eliminado };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al eliminar usuario.";
    return { success: false, error: message };
  }
}
