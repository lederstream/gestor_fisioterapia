import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function fixPasses() {
  const adminHash = await bcrypt.hash("AdminFisio2026!", 10);
  const staffHash = await bcrypt.hash("StaffFisio2026!", 10);
  const patientHash = await bcrypt.hash("PacienteFisio2026!", 10);

  // Admin
  await prisma.user.updateMany({
    where: { rol: "ADMIN" },
    data: { passwordHash: adminHash },
  });

  // Staff (Recepcion y Terapeuta)
  await prisma.user.updateMany({
    where: { rol: { in: ["RECEPCION", "TERAPEUTA"] } },
    data: { passwordHash: staffHash },
  });

  // Pacientes
  await prisma.user.updateMany({
    where: { rol: "PACIENTE" },
    data: { passwordHash: patientHash },
  });

  await prisma.paciente.updateMany({
    data: { passwordHash: patientHash },
  });

  console.log("✅ Contraseñas sincronizadas en Supabase para todos los roles.");
}

fixPasses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
