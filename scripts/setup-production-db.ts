import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const { Pool } = pg;

async function setupProductionDb() {
  console.log("🚀 Iniciando adecuación de Supabase para Producción...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // 1. Agregar columnas de seguridad para hash de contraseña
  console.log("🔐 Aplicando DDL de columnas de seguridad (password_hash)...");
  await pool.query(`
    ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

    ALTER TABLE public.pacientes 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
  `);
  console.log("✅ Columnas password_hash verificadas en PostgreSQL.");

  // 2. Limpieza de datos transaccionales de prueba/demo (citas, pagos, historias, etc.)
  console.log("🧹 Purgando datos transaccionales demo (citas, pagos, paquetes de prueba)...");
  await pool.query(`
    -- Borrar historias clínicas demo
    DELETE FROM public.historia_evolucion;
    -- Borrar citas demo
    DELETE FROM public.citas;
    -- Borrar pagos demo
    DELETE FROM public.pagos;
    -- Borrar paquetes de tratamiento demo
    DELETE FROM public.tratamientos_paquetes;
    -- Borrar pacientes demo de prueba
    DELETE FROM public.pacientes WHERE dni IN ('45892011', '72109483', '10492837', '48201934', '08927163');
    -- Limpiar logs demo de auditoría previos
    DELETE FROM public.audit_logs WHERE usuario_nombre ILIKE '%demo%' OR detalles ILIKE '%demo%';
  `);
  console.log("✅ Tablas transaccionales limpias y listas para uso real.");

  // 3. Hashear contraseñas profesionales para los usuarios del sistema
  const adminPasswordHash = await bcrypt.hash("AdminFisio2026!", 10);
  const staffPasswordHash = await bcrypt.hash("StaffFisio2026!", 10);

  console.log("👥 Configurando credenciales criptográficas seguras para el equipo...");

  // Actualizar o crear Administrador Principal
  await pool.query(`
    UPDATE public.users 
    SET password_hash = $1 
    WHERE rol = 'ADMIN';
  `, [adminPasswordHash]);

  // Si no había ningún ADMIN, crear uno principal
  const adminCheck = await pool.query(`SELECT id FROM public.users WHERE rol = 'ADMIN' LIMIT 1;`);
  if (adminCheck.rows.length === 0) {
    await pool.query(`
      INSERT INTO public.users (nombre, email, rol, especialidad, estado, password_hash)
      VALUES ('Dirección Clínica', 'admin@ajfisioterapia.pe', 'ADMIN', 'Gerencia General', 'ACTIVO', $1);
    `, [adminPasswordHash]);
  }

  // Actualizar contraseñas para el personal del equipo (Recepción y Terapeutas)
  await pool.query(`
    UPDATE public.users 
    SET password_hash = $1 
    WHERE rol IN ('RECEPCION', 'TERAPEUTA') AND (password_hash IS NULL OR password_hash = '');
  `, [staffPasswordHash]);

  // Registrar log de auditoría inicial del sistema
  await pool.query(`
    INSERT INTO public.audit_logs (usuario_nombre, usuario_rol, accion, modulo, detalles, ip_address)
    VALUES ('Sistema', 'ADMIN', 'SISTEMA_PRODUCCION_INICIALIZADO', 'SISTEMA', 'Migración y hardening de seguridad completado. Datos demo purgados. Autenticación bcrypt y JWT activada.', '127.0.0.1');
  `);

  console.log("✨ Base de datos en Supabase configurada con éxito para Producción.");
  console.log("----------------------------------------------------------------");
  console.log("🔑 Credenciales de Acceso Inicial para el Cliente:");
  console.log("   ADMINISTRADOR (Gerencia):");
  console.log("     - Email: marco.yana@ajfisioterapia.pe (o admin@ajfisioterapia.pe)");
  console.log("     - Contraseña: AdminFisio2026!");
  console.log("");
  console.log("   PERSONAL (Recepción y Terapeutas):");
  console.log("     - Email: karin.palacios@ajfisioterapia.pe / jeiser.vasquez@ajfisioterapia.pe");
  console.log("     - Contraseña: StaffFisio2026!");
  console.log("----------------------------------------------------------------");

  await pool.end();
  process.exit(0);
}

setupProductionDb().catch((err) => {
  console.error("❌ Error configurando base de datos:", err);
  process.exit(1);
});
