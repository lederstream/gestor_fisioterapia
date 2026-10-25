"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { dbStore } from "@/lib/store";
import { establecerCookieSesion, SessionPayload } from "@/lib/auth-server";
import { obtenerIpCliente } from "./auditoria";

export interface SetupStatusResponse {
  inicializado: boolean;
  totalAdmins: number;
  requiereTokenSeguridad: boolean;
  mensaje?: string;
}

export interface SetupResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

/**
 * Consulta si el sistema clínico ya cuenta con al menos un Administrador Principal.
 * Si ya existe un Administrador, el portal de setup se bloquea permanentemente.
 */
export async function verificarEstadoSistema(): Promise<SetupStatusResponse> {
  try {
    const requiereToken = !!process.env.SETUP_SECRET_TOKEN;

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      try {
        const totalAdmins = await prisma.user.count({
          where: { rol: "ADMIN" },
        });

        return {
          inicializado: totalAdmins > 0,
          totalAdmins,
          requiereTokenSeguridad: requiereToken,
        };
      } catch (err) {
        console.warn("verificarEstadoSistema: Error consultando Supabase, usando dbStore:", err);
      }
    }

    const adminsStore = dbStore.getUsers().filter((u) => u.rol === "ADMIN").length;
    return {
      inicializado: adminsStore > 0,
      totalAdmins: adminsStore,
      requiereTokenSeguridad: requiereToken,
    };
  } catch {
    return {
      inicializado: true, // Fail-safe: asumir inicializado ante fallos críticos
      totalAdmins: 1,
      requiereTokenSeguridad: false,
    };
  }
}

/**
 * Server Action: inicializarAdministradorRaiz()
 * Crea de forma segura la cuenta del Administrador Principal (Root Admin).
 * Esta función está estrictamente protegida por el Principio de Una Sola Inicialización (Once-Only Bootstrap Gate).
 */
export async function inicializarAdministradorRaiz(formData: {
  nombre: string;
  email: string;
  password: string;
  especialidad?: string;
  tokenSeguridad?: string;
}): Promise<SetupResult> {
  const clientIp = await obtenerIpCliente();

  try {
    const cleanNombre = formData.nombre?.trim();
    const cleanEmail = formData.email?.trim().toLowerCase();
    const cleanPass = formData.password?.trim();
    const cleanEsp = formData.especialidad?.trim() || "Gerencia y Dirección Clínica";

    // 1. Validaciones de formulario
    if (!cleanNombre || cleanNombre.length < 3) {
      return { success: false, error: "El nombre completo debe tener al menos 3 caracteres." };
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return { success: false, error: "Ingrese un correo electrónico institucional válido." };
    }

    // 2. Políticas de Contraseña Segura (OWASP ASVS 4.0)
    if (!cleanPass || cleanPass.length < 8) {
      return { success: false, error: "La contraseña maestra debe contener al menos 8 caracteres." };
    }

    const hasUpper = /[A-Z]/.test(cleanPass);
    const hasLower = /[a-z]/.test(cleanPass);
    const hasNumber = /[0-9]/.test(cleanPass);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(cleanPass);

    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      return {
        success: false,
        error: "Por ciberseguridad, la contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial.",
      };
    }

    // 3. Validación de Token de Seguridad si está configurado en el servidor
    const expectedToken = process.env.SETUP_SECRET_TOKEN;
    if (expectedToken && formData.tokenSeguridad !== expectedToken) {
      await prisma.auditLog.create({
        data: {
          usuarioNombre: cleanNombre,
          usuarioRol: "ADMIN",
          accion: "INTENTO_SETUP_TOKEN_INVALIDO",
          modulo: "SEGURIDAD",
          detalles: `Intento de inicialización fallido con token inválido desde IP ${clientIp}.`,
          ipAddress: clientIp,
        },
      }).catch(() => {});

      return { success: false, error: "Token de seguridad del servidor inválido o no suministrado." };
    }

    // 4. Verificación Estricta: ¿Ya existe un Administrador?
    const estado = await verificarEstadoSistema();
    if (estado.inicializado) {
      await prisma.auditLog.create({
        data: {
          usuarioNombre: cleanNombre,
          usuarioRol: "ADMIN",
          accion: "INTENTO_REINICIALIZACION_BLOQUEADO",
          modulo: "SEGURIDAD",
          detalles: `Intento de reinicialización no autorizado bloqueado para ${cleanEmail} desde IP ${clientIp}.`,
          ipAddress: clientIp,
        },
      }).catch(() => {});

      return {
        success: false,
        error: "Operación Bloqueada: El sistema ya cuenta con un Administrador Principal configurado. Acceda mediante el login oficial.",
      };
    }

    // 5. Cifrado irreversible bcrypt con factor de costo 10
    const passwordHash = await bcrypt.hash(cleanPass, 10);

    let nuevoAdminId = `usr-admin-${Date.now()}`;

    // 6. Persistencia en Base de Datos Principal (Supabase)
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
      const adminCreado = await prisma.user.create({
        data: {
          nombre: cleanNombre,
          email: cleanEmail,
          rol: "ADMIN",
          especialidad: cleanEsp,
          estado: "ACTIVO",
          passwordHash,
        },
      });
      nuevoAdminId = adminCreado.id;
    } else {
      // Fallback a dbStore
      const adminCreado = dbStore.crearUsuario({
        nombre: cleanNombre,
        email: cleanEmail,
        rol: "ADMIN",
        especialidad: cleanEsp,
        estado: "ACTIVO",
      }, {
        id: "setup-boot",
        nombre: "Instalador del Sistema",
        rol: "ADMIN",
      });
      nuevoAdminId = adminCreado.id;
    }

    // 7. Registro de Auditoría Inmutable del Hito de Inicialización
    await prisma.auditLog.create({
      data: {
        usuarioId: nuevoAdminId,
        usuarioNombre: cleanNombre,
        usuarioRol: "ADMIN",
        accion: "SISTEMA_INICIALIZADO_ADMIN_RAIZ",
        modulo: "SEGURIDAD",
        detalles: `Administrador Principal inicializado exitosamente (${cleanEmail}). Puerta de setup sellada permanentemente.`,
        ipAddress: clientIp,
      },
    }).catch(() => {});

    // 8. Emisión de Sesión Criptográfica HTTP-only inmediata
    const sessionData: SessionPayload = {
      userId: nuevoAdminId,
      nombre: cleanNombre,
      email: cleanEmail,
      rol: "ADMIN",
      especialidad: cleanEsp,
      isPaciente: false,
    };

    await establecerCookieSesion(sessionData);

    return {
      success: true,
      redirectUrl: "/dashboard",
    };
  } catch (err: unknown) {
    console.error("Error en inicializarAdministradorRaiz:", err);
    return {
      success: false,
      error: "Error interno al inicializar el Administrador Principal. Inténtalo nuevamente.",
    };
  }
}
