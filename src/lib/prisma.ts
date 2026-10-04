import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Instancia singleton de PrismaClient para entornos con o sin adapter inicializado
export const prisma =
  globalForPrisma.prisma ??
  (typeof PrismaClient === "function" ? new (PrismaClient as any)() : ({} as PrismaClient));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
