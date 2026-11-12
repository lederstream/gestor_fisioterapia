"use server";

import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { dbStore } from "@/lib/store";
import { requirePermission } from "@/lib/auth-server";
import { obtenerLogsAuditoria } from "./auditoria";

export interface SystemDiagnosticsData {
  dbConnected: boolean;
  dbType: "PostgreSQL (Supabase/Neon/Prod)" | "In-Memory Contingency Store";
  dbLatencyMs: number;
  serverTime: string;
  counts: {
    pacientes: number;
    citas: number;
    salas: number;
    servicios: number;
    usuarios: number;
    pagos: number;
    logs: number;
  };
  environment: string;
  systemStatus: "OPTIMO" | "CONTINGENCIA" | "DEGRADADO";
  recentLogs: any[];
}

export async function obtenerDiagnosticoSistema(): Promise<SystemDiagnosticsData> {
  await requirePermission("sistema:superadmin");
  const start = Date.now();
  let dbConnected = false;
  let latency = 0;

  let counts = {
    pacientes: dbStore.getPacientes().length,
    citas: dbStore.getCitas().length,
    salas: dbStore.getSalas().length,
    servicios: dbStore.getServicios().length,
    usuarios: dbStore.getUsers().length,
    pagos: dbStore.getPagos().length,
    logs: dbStore.getAuditLogs().length,
  };

  if (isDatabaseAvailable() && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:51213")) {
    try {
      // Test de latencia y conteo real de base de datos
      const [pCount, cCount, sCount, uCount] = await Promise.all([
        prisma.paciente.count(),
        prisma.cita.count(),
        prisma.sala.count(),
        prisma.user.count(),
      ]);

      latency = Date.now() - start;
      dbConnected = true;
      counts.pacientes = pCount;
      counts.citas = cCount;
      counts.salas = sCount;
      counts.usuarios = uCount;
    } catch {
      dbConnected = false;
      latency = Date.now() - start;
    }
  }

  const logs = await obtenerLogsAuditoria();

  return {
    dbConnected,
    dbType: dbConnected ? "PostgreSQL (Supabase/Neon/Prod)" : "In-Memory Contingency Store",
    dbLatencyMs: latency || 1,
    serverTime: new Date().toISOString(),
    counts,
    environment: process.env.NODE_ENV || "production",
    systemStatus: dbConnected ? "OPTIMO" : "CONTINGENCIA",
    recentLogs: logs.slice(0, 50),
  };
}

