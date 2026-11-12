"use server";

import bcrypt from "bcryptjs";
import { prisma, markDatabaseError } from "@/lib/prisma";
import { 
  establecerCookieSesion, 
  eliminarCookieSesion, 
  obtenerSesionServidor, 
  SessionPayload 
} from "@/lib/auth-server";
import { UserRole } from "@/lib/permissions";
import { obtenerIpCliente } from "./auditoria";

export interface AuthActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginResponseData {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    especialidad?: string;
    targetUrl: string;
  };
}

/**
 * Server Action: iniciarSesion()
 * Autenticación real con hashing bcrypt y emisión de JWT en cookie HTTP-only
 */
export async function iniciarSesion(
  identifier: string,
  passwordIngresada: string
): Promise<AuthActionResult<LoginResponseData>> {
  try {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPass = passwordIngresada.trim();

    if (!cleanIdentifier || !cleanPass) {
      return { success: false, error: "Por favor ingresa tu usuario/correo y contraseña." };
    }

    const clientIp = await obtenerIpCliente();

    // 1. Autenticación estricta contra PostgreSQL / Supabase cuando DATABASE_URL está configurado
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const usuario = await prisma.user.findFirst({
          where: {
            email: { equals: cleanIdentifier, mode: "insensitive" },
          },
        });

    if (usuario) {
      if (usuario.estado === "INACTIVO") {
        return { success: false, error: "Tu cuenta de usuario se encuentra suspendida o inactiva." };
      }

      // BLINDAJE INMUTABLE DE RBAC:
      // Si el correo o perfil corresponde a un paciente, FORZAR rol estricto PACIENTE y deshabilitar privilegios admin
      const isKnownPatient = 
        usuario.rol === "PACIENTE" || 
        usuario.especialidad?.toLowerCase().includes("paciente");

      const rolEfectivo: UserRole = isKnownPatient ? "PACIENTE" : (usuario.rol as UserRole);

      // Validar contraseña estrictamente con hashing criptográfico bcrypt (o migración única de texto plano en BD)
      let isPlainTextMatch = false;
      let bcryptMatch = false;
      if (usuario.passwordHash) {
        try {
          bcryptMatch = await bcrypt.compare(cleanPass, usuario.passwordHash);
        } catch {
          bcryptMatch = false;
        }
        if (!bcryptMatch && !usuario.passwordHash.startsWith("$2") && usuario.passwordHash === cleanPass) {
          isPlainTextMatch = true;
        }
      }

      const passwordValida = bcryptMatch || isPlainTextMatch;

      // Si fue creada en texto plano manualmente en Supabase, auto-encriptarla a bcrypt al primer login
      if (isPlainTextMatch) {
        try {
          const secureHash = await bcrypt.hash(cleanPass, 10);
          await prisma.user.update({
            where: { id: usuario.id },
            data: { passwordHash: secureHash },
          });
        } catch {}
      }

      if (!passwordValida) {
        // Registro inmutable de intento fallido en bitácora forense de seguridad
        await prisma.auditLog.create({
          data: {
            usuarioId: usuario.id,
            usuarioNombre: usuario.nombre,
            usuarioRol: rolEfectivo as any,
            accion: "LOGIN_FALLIDO",
            modulo: "SEGURIDAD",
            detalles: `Intento de acceso fallido para ${usuario.email} (${rolEfectivo}). Contraseña incorrecta.`,
            ipAddress: clientIp,
          },
        }).catch(() => {});

        return { success: false, error: "Contraseña incorrecta. Por favor verifica tus credenciales." };
      }

      // Si el usuario es de tipo PACIENTE, enlazar su ID de paciente correspondiente si existe
      let effectiveUserId = usuario.id;
      if (rolEfectivo === "PACIENTE") {
        try {
          const pac = await prisma.paciente.findFirst({
            where: {
              OR: [
                { email: { equals: usuario.email, mode: "insensitive" } },
                { id: usuario.id },
              ]
            }
          });
          if (pac) effectiveUserId = pac.id;
        } catch {}
      }

      const sessionData: SessionPayload = {
        userId: effectiveUserId,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: rolEfectivo,
        especialidad: isKnownPatient ? "Paciente Titular" : (usuario.especialidad || undefined),
        isPaciente: rolEfectivo === "PACIENTE",
      };

      await establecerCookieSesion(sessionData);

      // Registrar auditoría de inicio de sesión exitoso
      await prisma.auditLog.create({
        data: {
          usuarioId: usuario.id,
          usuarioNombre: usuario.nombre,
          usuarioRol: rolEfectivo as any,
          accion: "INICIO_SESION",
          modulo: "SISTEMA",
          detalles: `Inicio de sesión exitoso en el portal clínico (${rolEfectivo}).`,
          ipAddress: clientIp,
        },
      }).catch(() => {});

      // Todo el personal administrativo, clínico, pacientes y superadmin aterrizan en "Inicio" (/dashboard)
      const targetUrl = "/dashboard";

      return {
        success: true,
        data: {
          user: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: rolEfectivo,
            especialidad: sessionData.especialidad,
            targetUrl,
          },
        },
      };
    }

    // 2. Si no es un usuario del personal, buscar en pacientes (por DNI o Email)
    const paciente = await prisma.paciente.findFirst({
      where: {
        OR: [
          { dni: cleanIdentifier },
          { email: { equals: cleanIdentifier, mode: "insensitive" } },
        ],
      },
    });

    if (paciente) {
      let passwordValida = false;
      if (paciente.passwordHash) {
        try {
          passwordValida = await bcrypt.compare(cleanPass, paciente.passwordHash);
        } catch {
          passwordValida = false;
        }
        // Si en BD existía texto plano heredado (sin prefijo $2), migrarlo a bcrypt una sola vez
        if (!passwordValida && !paciente.passwordHash.startsWith("$2") && paciente.passwordHash === cleanPass) {
          passwordValida = true;
          try {
            const secureHash = await bcrypt.hash(cleanPass, 10);
            await prisma.paciente.update({
              where: { id: paciente.id },
              data: { passwordHash: secureHash },
            });
          } catch {}
        }
      } else if (cleanPass === paciente.dni) {
        // Solo si el paciente aún no tiene passwordHash registrado, su DNI sirve como primer acceso y se hashea de inmediato
        passwordValida = true;
        try {
          const secureHash = await bcrypt.hash(cleanPass, 10);
          await prisma.paciente.update({
            where: { id: paciente.id },
            data: { passwordHash: secureHash },
          });
        } catch {}
      }

      if (!passwordValida) {
        return { success: false, error: "Contraseña o documento incorrecto para este paciente." };
      }

      const sessionData: SessionPayload = {
        userId: paciente.id,
        nombre: paciente.nombres + " " + paciente.apellidos,
        email: paciente.email || `${paciente.dni}@paciente.clinica`,
        rol: "PACIENTE",
        especialidad: `Paciente Titular (DNI: ${paciente.dni})`,
        isPaciente: true,
      };

      await establecerCookieSesion(sessionData);

      return {
        success: true,
        data: {
          user: {
            id: paciente.id,
            nombre: sessionData.nombre,
            email: sessionData.email,
            rol: "PACIENTE",
            especialidad: sessionData.especialidad,
            targetUrl: "/dashboard",
          },
        },
      };
    }
  } catch (dbErr) {
    markDatabaseError(dbErr);
    console.error("Error de base de datos en iniciarSesion:", dbErr);
    return {
      success: false,
      error: "Servicio de autenticación temporalmente no disponible. Inténtalo nuevamente.",
    };
  }
}

    // Si no hay base de datos configurada (o el usuario/paciente no existe), denegar acceso (fail-closed)
    return {
      success: false,
      error: "Credenciales incorrectas o usuario no registrado.",
    };
  } catch (err: unknown) {
    console.error("Error en iniciarSesion:", err);
    return {
      success: false,
      error: "Error interno en el servidor de autenticación. Inténtalo nuevamente.",
    };
  }
}

/**
 * Server Action: cerrarSesion()
 */
export async function cerrarSesion(): Promise<{ success: boolean }> {
  await eliminarCookieSesion();
  return { success: true };
}

/**
 * Server Action: obtenerSesionActual()
 */
export async function obtenerSesionActual(): Promise<SessionPayload | null> {
  return await obtenerSesionServidor();
}

/**
 * Server Action: cambiarPassword()
 */
export async function cambiarPassword(
  passwordActual: string,
  nuevaPassword: string
): Promise<AuthActionResult> {
  try {
    const sesion = await obtenerSesionServidor();
    if (!sesion) {
      return { success: false, error: "Sesión no válida o expirada." };
    }

    if (!nuevaPassword || nuevaPassword.length < 8) {
      return { success: false, error: "La nueva contraseña debe tener al menos 8 caracteres." };
    }

    const usuario = await prisma.user.findUnique({
      where: { id: sesion.userId },
    });

    if (!usuario) {
      const paciente = await prisma.paciente.findUnique({
        where: { id: sesion.userId },
      });
      if (!paciente) {
        return { success: false, error: "Usuario o paciente no encontrado." };
      }
      if (paciente.passwordHash) {
        const match = await bcrypt.compare(passwordActual, paciente.passwordHash);
        if (!match) {
          return { success: false, error: "La contraseña actual no es correcta." };
        }
      } else if (passwordActual !== paciente.dni) {
        return { success: false, error: "La contraseña actual no es correcta." };
      }

      const nuevoHash = await bcrypt.hash(nuevaPassword, 10);
      await prisma.paciente.update({
        where: { id: paciente.id },
        data: { passwordHash: nuevoHash },
      });

      return { success: true };
    }

    if (!usuario.passwordHash) {
      return { success: false, error: "La cuenta no tiene una contraseña configurada. Contacta al administrador." };
    }

    const match = await bcrypt.compare(passwordActual, usuario.passwordHash);
    if (!match) {
      return { success: false, error: "La contraseña actual no es correcta." };
    }

    const nuevoHash = await bcrypt.hash(nuevaPassword, 10);
    await prisma.user.update({
      where: { id: sesion.userId },
      data: { passwordHash: nuevoHash },
    });

    const clientIp = await obtenerIpCliente();
    await prisma.auditLog.create({
      data: {
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        usuarioRol: usuario.rol,
        accion: "CAMBIO_PASSWORD_PROPIA",
        modulo: "SEGURIDAD",
        detalles: `El usuario ${usuario.email} actualizó exitosamente su propia contraseña.`,
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return { success: true };
  } catch (err) {
    return { success: false, error: "Error al actualizar la contraseña." };
  }
}
