// Gestor Fisioterapia - Seeding script para PostgreSQL (Supabase / Neon)
// AJ Fisioterapia - San Borja (Desarrollado por Marco Antonio Yana)

import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new (PrismaClient as any)();

async function main() {
  console.log("🌱 Iniciando Seeding de AJ Fisioterapia (San Borja)...");

  // 1. Crear las 6 salas físicas
  const salasData = [
    { nombre: "Sala 1", estado: "DISPONIBLE" as const },
    { nombre: "Sala 2", estado: "DISPONIBLE" as const },
    { nombre: "Sala 3", estado: "DISPONIBLE" as const },
    { nombre: "Sala 4", estado: "DISPONIBLE" as const },
    { nombre: "Sala 5", estado: "DISPONIBLE" as const },
    { nombre: "Sala 6", estado: "DISPONIBLE" as const },
  ];

  for (const s of salasData) {
    await prisma.sala.upsert({
      where: { nombre: s.nombre },
      update: {},
      create: s,
    });
  }
  console.log("✅ 6 Salas Físicas configuradas.");

  // 2. Crear Personal y Terapeutas (8 terapeutas, 2 recepcionistas, 1 admin)
  const personal = [
    { nombre: "Marco Antonio", email: "gerencia@ajfisioterapia.pe", rol: "ADMIN" as const, especialidad: "Dirección Clínica", estado: "ACTIVO" as const },
    { nombre: "Ana Ramos", email: "recepcion1@ajfisioterapia.pe", rol: "RECEPCION" as const, especialidad: null, estado: "ACTIVO" as const },
    { nombre: "Laura Peña", email: "recepcion2@ajfisioterapia.pe", rol: "RECEPCION" as const, especialidad: null, estado: "ACTIVO" as const },
    // 4 Licenciados
    { nombre: "Lic. Carlos Mendoza", email: "carlos.mendoza@ajfisioterapia.pe", rol: "TERAPEUTA" as const, especialidad: "Lic. Fisioterapia Deportiva y Readaptación", estado: "ACTIVO" as const },
    { nombre: "Lic. Andrea Rivas", email: "andrea.rivas@ajfisioterapia.pe", rol: "TERAPEUTA" as const, especialidad: "Lic. Terapia Manual Ortopédica y Columna", estado: "ACTIVO" as const },
    { nombre: "Lic. Javier Ponce", email: "javier.ponce@ajfisioterapia.pe", rol: "TERAPEUTA" as const, especialidad: "Lic. Biomecánica y Reeducación Postural", estado: "ACTIVO" as const },
    { nombre: "Lic. Valeria Soto", email: "valeria.soto@ajfisioterapia.pe", rol: "TERAPEUTA" as const, especialidad: "Lic. Neurorehabilitación y Adulto Mayor", estado: "ACTIVO" as const },
    // 2 Técnicos
    { nombre: "Tec. Miguel Torres", email: "miguel.torres@ajfisioterapia.pe", rol: "TERAPEUTA" as const, especialidad: "Técnico en Agentes Físicos y Electroterapia", estado: "ACTIVO" as const },
    { nombre: "Tec. Diana Paredes", email: "diana.paredes@ajfisioterapia.pe", rol: "TERAPEUTA" as const, especialidad: "Técnico en Masoterapia y Crioterapia", estado: "ACTIVO" as const },
  ];

  for (const p of personal) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: p,
    });
  }
  console.log("✅ Equipo clínico y administrativo creado (11 profesionales).");

  // 3. Crear Servicios
  const serviciosData = [
    { nombre: "Fisioterapia Traumatológica y Deportiva", duracionMinutos: 45, precioBase: 85.00 },
    { nombre: "Terapia Manual Ortopédica y Columna", duracionMinutos: 45, precioBase: 95.00 },
    { nombre: "Rehabilitación Neurológica Especializada", duracionMinutos: 60, precioBase: 120.00 },
    { nombre: "Descarga Muscular y Readaptación Funcional", duracionMinutos: 45, precioBase: 90.00 },
  ];

  for (const serv of serviciosData) {
    const existing = await prisma.servicio.findFirst({ where: { nombre: serv.nombre } });
    if (!existing) {
      await prisma.servicio.create({ data: serv });
    }
  }
  console.log("✅ Servicios clínicos registrados.");

  console.log("🎉 Seeding finalizado con éxito.");
}

main()
  .catch((e) => {
    console.error("Error en Seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
