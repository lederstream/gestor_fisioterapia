"use server";

import { dbStore, AuditLogItem } from "@/lib/store";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { obtenerSesionServidor } from "@/lib/auth-server";

export interface FiltrosAuditoria {
  modulo?: string;
  accion?: string;
  busqueda?: string;
}

/**
 * Obtener la dirección IP real de la solicitud HTTP entrante
 * Detecta cabeceras de proxy (x-forwarded-for, x-real-ip) o retorna la terminal local
 */
export async function obtenerIpCliente(): Promise<string> {
  try {
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = h.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
    return "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export async function obtenerLogsAuditoria(filtros?: FiltrosAuditoria): Promise<AuditLogItem[]> {
  const sesion = await obtenerSesionServidor();
  const esSuperAdmin = sesion?.rol === "SUPERADMIN";

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      const logsDb = await prisma.auditLog.findMany({
        where: esSuperAdmin ? undefined : {
          AND: [
            { usuarioRol: { not: "SUPERADMIN" } },
            { detalles: { not: { contains: "SUPERADMIN" } } },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 200,
      });

      const formateados: AuditLogItem[] = logsDb.map((l) => ({
        id: l.id,
        usuarioId: l.usuarioId,
        usuarioNombre: l.usuarioNombre,
        usuarioRol: l.usuarioRol as any,
        accion: l.accion,
        modulo: l.modulo as any,
        entidadId: l.entidadId,
        detalles: l.detalles,
        ipAddress: l.ipAddress || undefined,
        createdAt: l.createdAt.toISOString(),
      }));

      if (!filtros) return formateados;

      return formateados.filter((log) => {
        if (filtros.modulo && filtros.modulo !== "TODOS" && log.modulo !== filtros.modulo) {
          return false;
        }
        if (filtros.accion && filtros.accion !== "TODOS" && log.accion !== filtros.accion) {
          return false;
        }
        if (filtros.busqueda) {
          const q = filtros.busqueda.toLowerCase();
          const matchUsuario = log.usuarioNombre.toLowerCase().includes(q);
          const matchDetalles = log.detalles.toLowerCase().includes(q);
          const matchAccion = log.accion.toLowerCase().includes(q);
          const matchIp = (log.ipAddress || "").toLowerCase().includes(q);
          return matchUsuario || matchDetalles || matchAccion || matchIp;
        }
        return true;
      });
    } catch (err) {
      console.warn("obtenerLogsAuditoria db error, usando fallback dbStore:", err);
    }
  }

  const rawLogs = dbStore.getAuditLogs();
  const logs = esSuperAdmin 
    ? rawLogs 
    : rawLogs.filter((l) => (l.usuarioRol as string) !== "SUPERADMIN" && !l.detalles?.includes("SUPERADMIN"));

  if (!filtros) return logs;

  return logs.filter((log) => {
    if (filtros.modulo && filtros.modulo !== "TODOS" && log.modulo !== filtros.modulo) {
      return false;
    }
    if (filtros.accion && filtros.accion !== "TODOS" && log.accion !== filtros.accion) {
      return false;
    }
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      const matchUsuario = log.usuarioNombre.toLowerCase().includes(q);
      const matchDetalles = log.detalles.toLowerCase().includes(q);
      const matchAccion = log.accion.toLowerCase().includes(q);
      const matchIp = (log.ipAddress || "").toLowerCase().includes(q);
      return matchUsuario || matchDetalles || matchAccion || matchIp;
    }
    return true;
  });
}
