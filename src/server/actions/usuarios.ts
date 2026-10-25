"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { dbStore, UserItem } from "@/lib/store";
import { UserRole } from "@/lib/permissions";
import { ServerActionResult } from "./citas";
import { prisma } from "@/lib/prisma";
import { obtenerSesionServidor } from "@/lib/auth-server";
import { obtenerIpCliente } from "./auditoria";

export async function obtenerUsuarios(): Promise<UserItem[]> {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      const usersDb = await prisma.user.findMany({
        orderBy: {
          nombre: "asc",
        },
      });

      return usersDb.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol as UserRole,
        especialidad: u.especialidad || undefined,
        estado: u.estado as "ACTIVO" | "INACTIVO",
      }));
    } catch (err) {
      console.warn("obtenerUsuarios db error, usando fallback dbStore:", err);
    }
  }

  return dbStore.getUsers();
}

export async function crearNuevoUsuario(data: {
  nombre: string;
  email: string;
  rol: UserRole;
  especialidad?: string;
  estado?: "ACTIVO" | "INACTIVO";
  password?: string;
}): Promise<ServerActionResult<UserItem>> {
  try {
    const sesion = await obtenerSesionServidor();
    const clientIp = await obtenerIpCliente();

    // Verificación estricta de autorización RBAC en backend
    if (!sesion || sesion.rol !== "ADMIN") {
      return {
        success: false,
        error: "Acceso denegado: Solo el Administrador General dispone de autorización para dar de alta nuevo personal del centro.",
      };
    }

    // Regla de integridad RBAC: Los pacientes no pertenecen al personal
    if (data.rol === "PACIENTE") {
      return {
        success: false,
        error: "Violación de seguridad RBAC: Los pacientes no se registran como personal. Utilice el módulo de Pacientes.",
      };
    }

    const rawPass = data.password?.trim();
    if (!rawPass || rawPass.length < 8) {
      return {
        success: false,
        error: "La contraseña inicial debe contener al menos 8 caracteres. Utilice el generador criptográfico seguro.",
      };
    }

    const cleanEmail = data.email.trim().toLowerCase();

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const existe = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (existe) {
          return { success: false, error: `Ya existe un usuario registrado con el correo ${cleanEmail}.` };
        }

        const passwordHash = await bcrypt.hash(rawPass, 10);

        const nuevoDb = await prisma.user.create({
          data: {
            nombre: data.nombre.trim(),
            email: cleanEmail,
            rol: data.rol,
            especialidad: data.especialidad?.trim() || null,
            estado: data.estado || "ACTIVO",
            passwordHash,
          },
        });

        await prisma.auditLog.create({
          data: {
            usuarioId: sesion?.userId,
            usuarioNombre: sesion?.nombre || "Administrador",
            usuarioRol: (sesion?.rol as any) || "ADMIN",
            accion: "USUARIO_CREADO",
            modulo: "CONFIGURACION",
            entidadId: nuevoDb.id,
            detalles: `Usuario ${nuevoDb.nombre} (${nuevoDb.rol}) creado en el sistema.`,
            ipAddress: clientIp,
          },
        });

        revalidatePath("/dashboard/usuarios");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/dashboard/auditoria");
        revalidatePath("/dashboard");

        return {
          success: true,
          data: {
            id: nuevoDb.id,
            nombre: nuevoDb.nombre,
            email: nuevoDb.email,
            rol: nuevoDb.rol as UserRole,
            especialidad: nuevoDb.especialidad || undefined,
            estado: nuevoDb.estado as "ACTIVO" | "INACTIVO",
          },
        };
      } catch (dbErr: any) {
        if (dbErr.code === "P2002") {
          return { success: false, error: `El correo ${cleanEmail} ya está registrado.` };
        }
        console.warn("crearNuevoUsuario db error, usando fallback dbStore:", dbErr);
      }
    }

    const usuario = dbStore.crearUsuario(data, {
      id: sesion?.userId || "usr-admin-1",
      nombre: sesion?.nombre || "Administrador",
      rol: (sesion?.rol as any) || "ADMIN",
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
    const sesion = await obtenerSesionServidor();
    const clientIp = await obtenerIpCliente();

    // Verificación estricta de autorización RBAC en backend
    if (!sesion || sesion.rol !== "ADMIN") {
      return {
        success: false,
        error: "Acceso denegado: Solo el Administrador General dispone de autorización para reasignar roles.",
      };
    }

    // BLINDAJE DE SEGURIDAD RBAC (Principio de Menor Privilegio - PoLP):
    // 1. Una cuenta de PACIENTE jamás puede ser elevada a roles de personal administrativo o médico
    // 2. El personal clínico o directivo no puede ser alterado a rol PACIENTE desde este módulo
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const usuarioTarget = await prisma.user.findUnique({
          where: { id: usuarioId },
        });

        if (usuarioTarget) {
          const esPacienteTarget = 
            usuarioTarget.rol === "PACIENTE" || 
            usuarioTarget.email.toLowerCase() === "alexander.saavedra@gmail.com" || 
            usuarioTarget.especialidad?.toLowerCase().includes("paciente");

          if (esPacienteTarget && nuevoRol !== "PACIENTE") {
            return {
              success: false,
              error: "Violación de seguridad RBAC: Los pacientes no pueden ser promovidos a roles administrativos ni clínicos del centro.",
            };
          }

          if (!esPacienteTarget && nuevoRol === "PACIENTE") {
            return {
              success: false,
              error: "Violación de seguridad RBAC: El personal clínico o administrativo no puede ser reasignado a rol paciente.",
            };
          }
        }

        const actualizadoDb = await prisma.user.update({
          where: { id: usuarioId },
          data: { rol: nuevoRol },
        });

        await prisma.auditLog.create({
          data: {
            usuarioId: sesion?.userId,
            usuarioNombre: sesion?.nombre || "Administrador",
            usuarioRol: (sesion?.rol as any) || "ADMIN",
            accion: "ROL_USUARIO_MODIFICADO",
            modulo: "CONFIGURACION",
            entidadId: usuarioId,
            detalles: `Rol de ${actualizadoDb.nombre} actualizado a ${nuevoRol}.`,
            ipAddress: clientIp,
          },
        });

        revalidatePath("/dashboard/usuarios");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/dashboard/auditoria");
        revalidatePath("/dashboard");

        return {
          success: true,
          data: {
            id: actualizadoDb.id,
            nombre: actualizadoDb.nombre,
            email: actualizadoDb.email,
            rol: actualizadoDb.rol as UserRole,
            especialidad: actualizadoDb.especialidad || undefined,
            estado: actualizadoDb.estado as "ACTIVO" | "INACTIVO",
          },
        };
      } catch (dbErr) {
        console.warn("modificarRolUsuario db error, usando fallback:", dbErr);
      }
    }

    const usuario = dbStore.actualizarRolUsuario(usuarioId, nuevoRol, {
      id: sesion?.userId || "usr-admin-1",
      nombre: sesion?.nombre || "Administrador",
      rol: (sesion?.rol as any) || "ADMIN",
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
    const sesion = await obtenerSesionServidor();
    if (!sesion || sesion.rol !== "ADMIN") {
      return { success: false, error: "Acceso denegado: Solo el Administrador puede activar o suspender cuentas de usuario." };
    }

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const actualizadoDb = await prisma.user.update({
          where: { id: usuarioId },
          data: { estado: nuevoEstado },
        });

        revalidatePath("/dashboard/usuarios");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/dashboard");

        return {
          success: true,
          data: {
            id: actualizadoDb.id,
            nombre: actualizadoDb.nombre,
            email: actualizadoDb.email,
            rol: actualizadoDb.rol as UserRole,
            especialidad: actualizadoDb.especialidad || undefined,
            estado: actualizadoDb.estado as "ACTIVO" | "INACTIVO",
          },
        };
      } catch (dbErr) {
        console.warn("cambiarEstadoUsuario db error, usando fallback:", dbErr);
      }
    }

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
    const sesion = await obtenerSesionServidor();
    if (!sesion || sesion.rol !== "ADMIN") {
      return { success: false, error: "Acceso denegado: Solo el Administrador puede dar de baja cuentas de usuario." };
    }

    const clientIp = await obtenerIpCliente();

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const eliminadoDb = await prisma.user.delete({
          where: { id: usuarioId },
        });

        await prisma.auditLog.create({
          data: {
            usuarioId: sesion?.userId,
            usuarioNombre: sesion?.nombre || "Administrador",
            usuarioRol: (sesion?.rol as any) || "ADMIN",
            accion: "USUARIO_ELIMINADO",
            modulo: "CONFIGURACION",
            entidadId: usuarioId,
            detalles: `Usuario ${eliminadoDb.nombre} eliminado del sistema.`,
            ipAddress: clientIp,
          },
        });

        revalidatePath("/dashboard/usuarios");
        revalidatePath("/dashboard/configuracion");
        revalidatePath("/dashboard/auditoria");

        return {
          success: true,
          data: {
            id: eliminadoDb.id,
            nombre: eliminadoDb.nombre,
            email: eliminadoDb.email,
            rol: eliminadoDb.rol as UserRole,
            especialidad: eliminadoDb.especialidad || undefined,
            estado: eliminadoDb.estado as "ACTIVO" | "INACTIVO",
          },
        };
      } catch (dbErr) {
        console.warn("eliminarUsuarioSistema db error, usando fallback:", dbErr);
      }
    }

    const eliminado = dbStore.eliminarUsuario(usuarioId, {
      id: sesion?.userId || "usr-admin-1",
      nombre: sesion?.nombre || "Administrador",
      rol: (sesion?.rol as any) || "ADMIN",
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

export async function cambiarPasswordUsuarioDesdeAdmin(
  usuarioId: string,
  nuevaPassword: string
): Promise<ServerActionResult> {
  try {
    const sesion = await obtenerSesionServidor();
    if (!sesion || sesion.rol !== "ADMIN") {
      return { success: false, error: "Solo los administradores pueden gestionar contraseñas del equipo." };
    }

    const cleanPass = nuevaPassword.trim();
    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    const passwordHash = await bcrypt.hash(cleanPass, 10);
    const clientIp = await obtenerIpCliente();

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const usuarioActualizado = await prisma.user.update({
          where: { id: usuarioId },
          data: { passwordHash },
        });

        await prisma.auditLog.create({
          data: {
            usuarioId: sesion.userId,
            usuarioNombre: sesion.nombre,
            usuarioRol: sesion.rol,
            accion: "CONTRASENA_RESETEADA",
            modulo: "CONFIGURACION",
            entidadId: usuarioId,
            detalles: `El administrador ${sesion.nombre} restableció la contraseña de acceso de ${usuarioActualizado.nombre}.`,
            ipAddress: clientIp,
          },
        });

        revalidatePath("/dashboard/usuarios");
        revalidatePath("/dashboard/auditoria");

        return { success: true };
      } catch (dbErr) {
        console.error("Error al actualizar contraseña en Prisma:", dbErr);
        return { success: false, error: "No se pudo actualizar la contraseña en la base de datos." };
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar la contraseña del usuario.";
    return { success: false, error: message };
  }
}

