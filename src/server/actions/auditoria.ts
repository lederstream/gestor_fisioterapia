"use server";

import { dbStore, AuditLogItem } from "@/lib/store";

export interface FiltrosAuditoria {
  modulo?: string;
  accion?: string;
  busqueda?: string;
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
      return matchUsuario || matchDetalles || matchAccion;
    }
    return true;
  });
}
