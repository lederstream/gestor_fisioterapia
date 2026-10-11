"use server";

import { dbStore, AuditLogItem } from "@/lib/store";
import { headers } from "next/headers";

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
    return "127.0.0.1 (Terminal Local)";
  } catch {
    return "127.0.0.1 (Terminal Local)";
  }
}

export async function obtenerLogsAuditoria(filtros?: FiltrosAuditoria): Promise<AuditLogItem[]> {
  const logs = dbStore.getAuditLogs();

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
