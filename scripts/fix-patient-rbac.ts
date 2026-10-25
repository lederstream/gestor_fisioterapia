import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function fixPatientRbac() {
  console.log("🔒 Reparando inconsistencia de roles y RBAC en Supabase...");

  const patientPassHash = await bcrypt.hash("PacienteFisio2026!", 10);

  // 1. Corregir rol de Alexander Saavedra en public.users
  const updatedUser = await prisma.user.updateMany({
    where: {
      OR: [
        { email: { equals: "alexander.saavedra@gmail.com", mode: "insensitive" } },
        { nombre: { contains: "Alexander Saavedra", mode: "insensitive" } },
      ],
    },
    data: {
      rol: "PACIENTE",
      especialidad: "Paciente Titular",
      passwordHash: patientPassHash,
      estado: "ACTIVO",
    },
  });
  console.log("✅ Usuario Alexander Saavedra corregido a rol 'PACIENTE' en tabla users:", updatedUser);

  // 2. Asegurar que Alexander Saavedra exista en public.pacientes
  let paciente = await prisma.paciente.findFirst({
    where: {
      OR: [
        { dni: "45892011" },
        { email: { equals: "alexander.saavedra@gmail.com", mode: "insensitive" } },
      ],
    },
  });

  if (!paciente) {
    paciente = await prisma.paciente.create({
      data: {
        tipoDocumento: "DNI",
        dni: "45892011",
        primerNombre: "Alexander",
        apellidoPaterno: "Saavedra",
        apellidoMaterno: "Castillo",
        nombres: "Alexander",
        apellidos: "Saavedra Castillo",
        telefono: "987123456",
        email: "alexander.saavedra@gmail.com",
        fechaNacimiento: new Date("1991-04-12"),
        contactoEmergencia: "Esposa - 987999111",
        passwordHash: patientPassHash,
      },
    });
    console.log("✅ Paciente Alexander Saavedra insertado en tabla pacientes:", paciente.id);
  } else {
    paciente = await prisma.paciente.update({
      where: { id: paciente.id },
      data: {
        passwordHash: patientPassHash,
        email: "alexander.saavedra@gmail.com",
        nombres: "Alexander",
        apellidos: "Saavedra Castillo",
      },
    });
    console.log("✅ Paciente Alexander Saavedra actualizado en tabla pacientes:", paciente.id);
  }

  // 3. Registrar auditoría forense de la corrección de seguridad
  await prisma.auditLog.create({
    data: {
      usuarioNombre: "Sistema (Hardening RBAC)",
      usuarioRol: "ADMIN",
      accion: "CORRECCION_SEGURIDAD_RBAC",
      modulo: "SEGURIDAD",
      detalles: "Corrección estricta de principio de menor privilegio (PoLP): Alexander Saavedra restituido a rol exclusivo PACIENTE en Supabase. Bloqueo de escalamiento de privilegios aplicado.",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("✨ Reparación completada exitosamente.");
}

fixPatientRbac()
  .catch((err) => {
    console.error("❌ Error en reparación:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
