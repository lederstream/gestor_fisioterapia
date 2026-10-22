import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Checking Prisma Supabase connection...");
  const config = await prisma.configuracionClinica.findFirst();
  console.log("SUCCESS Config retrieved from Supabase:", {
    id: config?.id,
    nombreComercial: config?.nombreComercial,
    colorPrimario: config?.colorPrimario,
    colorSecundario: config?.colorSecundario,
    colorAcento: config?.colorAcento,
    logoUrl: config?.logoUrl,
  });

  const servicios = await prisma.servicio.findMany();
  console.log(`SUCCESS Servicios count from Supabase: ${servicios.length}`);
  servicios.forEach((s) => {
    console.log(` - [${s.id}] ${s.nombre} (S/ ${s.precioBase})`);
  });

  const users = await prisma.user.findMany();
  console.log(`SUCCESS Users count from Supabase: ${users.length}`);
  users.forEach((u) => {
    console.log(` - [${u.rol}] ${u.nombre} (${u.email})`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("Prisma Supabase connection error:", err);
  process.exit(1);
});
