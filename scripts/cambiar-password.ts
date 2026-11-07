import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

async function main() {
  const args = process.argv.slice(2);
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ Error: No se encontró DATABASE_URL en el archivo .env");
    process.exit(1);
  }

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  if (args.length < 2) {
    console.log("=================================================================");
    console.log("🔐 HERRAMIENTA DE GESTIÓN Y RECUPERACIÓN DE CONTRASEÑAS");
    console.log("=================================================================");
    console.log("Uso:");
    console.log("  npx tsx scripts/cambiar-password.ts <email_o_dni> <nueva_contraseña>");
    console.log("");
    console.log("Ejemplo:");
    console.log("  npx tsx scripts/cambiar-password.ts marco.yana@ajfisioterapia.pe 252525");
    console.log("  npx tsx scripts/cambiar-password.ts admin 252525");
    console.log("=================================================================");
    console.log("📋 Consultando usuarios en Supabase...");

    try {
      const res = await pool.query(
        "SELECT id, nombre, email, rol, estado FROM public.users ORDER BY nombre ASC"
      );
      res.rows.forEach((u) => {
        console.log(` - [${u.rol}] ${u.nombre} (${u.email}) [Estado: ${u.estado}]`);
      });
    } catch (err: any) {
      console.error("Error al consultar usuarios:", err.message);
    } finally {
      await pool.end();
    }
    console.log("=================================================================");
    process.exit(0);
  }

  const [identifier, newPassword] = args;
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = newPassword.trim();

  if (cleanPass.length < 4) {
    console.error("❌ Error: La contraseña debe tener al menos 4 caracteres.");
    await pool.end();
    process.exit(1);
  }

  console.log(`🔍 Buscando cuenta asociada a: "${cleanId}" en Supabase...`);

  try {
    const saltRounds = 10;
    const newHash = await bcrypt.hash(cleanPass, saltRounds);

    // 1. Buscar en tabla users (Personal/Admin)
    const userCheck = await pool.query(
      `SELECT id, nombre, email, rol FROM public.users 
       WHERE LOWER(email) = $1 OR ($1 = 'admin' AND rol = 'ADMIN') LIMIT 1`,
      [cleanId]
    );

    if (userCheck.rows.length > 0) {
      const user = userCheck.rows[0];
      await pool.query(
        "UPDATE public.users SET password_hash = $1, estado = 'ACTIVO' WHERE id = $2",
        [newHash, user.id]
      );

      // Registrar auditoría
      await pool.query(
        `INSERT INTO public.audit_logs (usuario_id, usuario_nombre, usuario_rol, accion, modulo, detalles, ip_address)
         VALUES ($1, $2, $3, 'CAMBIO_PASSWORD_CLI', 'SEGURIDAD', $4, '127.0.0.1')`,
        [
          user.id,
          user.nombre,
          user.rol,
          `Contraseña restablecida exitosamente vía consola CLI para ${user.email} (${user.rol}).`,
        ]
      ).catch(() => {});

      console.log("=================================================================");
      console.log("✅ ¡CONTRASEÑA ACTUALIZADA Y RECUPERADA CON ÉXITO!");
      console.log(`   👤 Usuario: [${user.rol}] ${user.nombre}`);
      console.log(`   📧 Correo:  ${user.email}`);
      console.log(`   🔑 Nueva Contraseña asignada: ${cleanPass}`);
      console.log("=================================================================");
      console.log("👉 Ya puedes ir a /login e ingresar con este correo/usuario y tu nueva clave.");
      await pool.end();
      process.exit(0);
    }

    // 2. Buscar en tabla pacientes
    const pacCheck = await pool.query(
      `SELECT id, nombres, apellidos, dni, email FROM public.pacientes 
       WHERE dni = $1 OR LOWER(email) = $1 LIMIT 1`,
      [cleanId]
    );

    if (pacCheck.rows.length > 0) {
      const pac = pacCheck.rows[0];
      await pool.query(
        "UPDATE public.pacientes SET password_hash = $1 WHERE id = $2",
        [newHash, pac.id]
      );

      console.log("=================================================================");
      console.log("✅ ¡CONTRASEÑA DE PACIENTE ACTUALIZADA CON ÉXITO!");
      console.log(`   👤 Paciente: ${pac.nombres} ${pac.apellidos}`);
      console.log(`   🪪 DNI:      ${pac.dni}`);
      console.log(`   📧 Email:    ${pac.email || "No registrado"}`);
      console.log(`   🔑 Nueva Contraseña: ${cleanPass}`);
      console.log("=================================================================");
      await pool.end();
      process.exit(0);
    }

    console.error(`❌ No se encontró ningún usuario o paciente con el identificador "${cleanId}".`);
    await pool.end();
    process.exit(1);
  } catch (err: any) {
    console.error("❌ Error ejecutando cambio de contraseña:", err.message || err);
    await pool.end();
    process.exit(1);
  }
}

main();
