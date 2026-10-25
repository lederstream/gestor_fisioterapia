import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { iniciarSesion } from "../src/server/actions/auth";

async function verifyLogins() {
  console.log("🧪 Iniciando pruebas automatizadas de RBAC y sesiones...");

  // 1. Prueba Login Admin
  const adminRes = await iniciarSesion("admin", "AdminFisio2026!");
  console.log("1. Login ADMIN:", {
    success: adminRes.success,
    rol: adminRes.data?.user.rol,
    nombre: adminRes.data?.user.nombre,
  });

  if (!adminRes.success || adminRes.data?.user.rol !== "ADMIN") {
    throw new Error("FALLO: El admin no obtuvo rol ADMIN. Error: " + adminRes.error);
  }

  // 2. Prueba Login Paciente por Email
  const pacienteEmailRes = await iniciarSesion("alexander.saavedra@gmail.com", "PacienteFisio2026!");
  console.log("2. Login PACIENTE por Email:", {
    success: pacienteEmailRes.success,
    rol: pacienteEmailRes.data?.user.rol,
    nombre: pacienteEmailRes.data?.user.nombre,
  });

  if (pacienteEmailRes.data?.user.rol !== "PACIENTE") {
    throw new Error("FALLO CRÍTICO: Paciente por email obtuvo rol " + pacienteEmailRes.data?.user.rol);
  }

  // 3. Prueba Login Paciente por Alias
  const pacienteAliasRes = await iniciarSesion("paciente", "PacienteFisio2026!");
  console.log("3. Login PACIENTE por Alias ('paciente'):", {
    success: pacienteAliasRes.success,
    rol: pacienteAliasRes.data?.user.rol,
    nombre: pacienteAliasRes.data?.user.nombre,
  });

  if (pacienteAliasRes.data?.user.rol !== "PACIENTE") {
    throw new Error("FALLO CRÍTICO: Paciente por alias obtuvo rol " + pacienteAliasRes.data?.user.rol);
  }

  // 4. Prueba Login Paciente por DNI
  const pacienteDniRes = await iniciarSesion("45892011", "PacienteFisio2026!");
  console.log("4. Login PACIENTE por DNI ('45892011'):", {
    success: pacienteDniRes.success,
    rol: pacienteDniRes.data?.user.rol,
    nombre: pacienteDniRes.data?.user.nombre,
  });

  if (pacienteDniRes.data?.user.rol !== "PACIENTE") {
    throw new Error("FALLO CRÍTICO: Paciente por DNI obtuvo rol " + pacienteDniRes.data?.user.rol);
  }

  console.log("✅ TODAS LAS PRUEBAS DE RBAC PASARON CON ÉXITO: 0 brechas detectadas.");
}

verifyLogins()
  .catch((e) => {
    console.error("❌ Error en pruebas:", e);
    process.exit(1);
  });
