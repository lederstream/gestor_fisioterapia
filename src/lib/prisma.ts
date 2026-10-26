import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  // Si no hay connection string o es la URL mock local sin servicio activo,
  // retornar un proxy seguro para evitar excepciones en build time o pruebas offline
  if (!connectionString || connectionString.includes("localhost:51213")) {
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === "then" || prop === "$disconnect" || prop === "$connect") {
          return () => Promise.resolve();
        }
        return new Proxy({}, {
          get(_mTarget, _mProp) {
            return () => Promise.resolve(null);
          }
        });
      }
    });
  }

  try {
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    const pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 1500,
      idleTimeoutMillis: 2000,
      max: 10,
    });
    pool.on("error", (err) => {
      console.warn("Postgres pool error:", err?.message || err);
      markDatabaseError(err);
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
  } catch (error) {
    console.warn("Prisma: No se pudo inicializar el driver adapter.", error);
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === "then" || prop === "$disconnect" || prop === "$connect") {
          return () => Promise.resolve();
        }
        return new Proxy({}, {
          get(_mTarget, _mProp) {
            return () => Promise.resolve(null);
          }
        });
      }
    });
  }
}

// Circuit Breaker State (High Availability & Zero Lag)
let dbUnavailableUntil = 0;

export function markDatabaseError(error: any) {
  const msg = String(error?.message || error?.driverAdapterError || error?.code || "");
  if (
    msg.includes("ConnectionClosed") ||
    msg.includes("P1017") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("timeout") ||
    msg.includes("closed")
  ) {
    dbUnavailableUntil = Date.now() + 60000; // 60s circuit breaker
    console.warn("⚡ Circuit Breaker activado: Base de datos no disponible. Atendiendo solicitudes instantáneamente desde dbStore.");
  }
}

export function isDatabaseAvailable(): boolean {
  return Date.now() >= dbUnavailableUntil;
}

// Instancia singleton de PrismaClient para Next.js en Vercel
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
