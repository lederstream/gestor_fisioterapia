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

// Instancia singleton de PrismaClient para Next.js en Vercel
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
