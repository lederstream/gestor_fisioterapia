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

  if (args.length < 3) {
    console.log("=================================================================");
    console.log("👤 HERRAMIENTA CLI: CREAR USUARIO EN SUPABASE");
    console.log("=================================================================");
    console.log("Uso:");
    console.log("  npx tsx scripts/crear-usuario.ts <email> <contraseña> <rol> [nombre] [especialidad]");
    console.log("");
    console.log("Roles disponibles: SUPERADMIN | ADMIN | RECEPCION | TERAPEUTA | ASISTENTE");
    console.log("");
    console.log("Ejemplo:");
    console.log("  npx tsx scripts/crear-usuario.ts superadmin@sistema.pe 252525 SUPERADMIN \"Marco Antonio Yana\" \"Soporte Central\"");
    console.log("=================================================================");
    await pool.end();
    process.exit(0);
  }

  const [email, password, rawRol, nombreArg, espArg] = args;
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
  const rol = rawRol.trim().toUpperCase();
  const nombre = nombreArg ? nombreArg.trim() : "Usuario Sistema";
  const especialidad = espArg ? espArg.trim() : null;

  try {
    // 1. Asegurar que el tipo enum tenga SUPERADMIN si se solicita
    if (rol === "SUPERADMIN") {
      try {
        await pool.query("ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'SUPERADMIN'");
      } catch (e: any) {
        // En caso de que ya exista
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(cleanPass, saltRounds);

    const query = `
      INSERT INTO public.users (id, nombre, email, rol, especialidad, estado, password_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVO', $5, NOW(), NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        rol = EXCLUDED.rol,
        especialidad = EXCLUDED.especialidad,
        estado = 'ACTIVO',
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
      RETURNING id, nombre, email, rol, estado;
    `;

    const res = await pool.query(query, [nombre, cleanEmail, rol, especialidad, passwordHash]);
    const u = res.rows[0];

    console.log("=================================================================");
    console.log("✅ ¡USUARIO CREADO / ACTUALIZADO CON ÉXITO EN SUPABASE!");
    console.log(`   🆔 ID:     ${u.id}`);
    console.log(`   👤 Nombre: ${u.nombre}`);
    console.log(`   📧 Correo: ${u.email}`);
    console.log(`   🛡️ Rol:    ${u.rol}`);
    console.log(`   🔑 Clave:  ${cleanPass}`);
    console.log("=================================================================");
    console.log("👉 Ya puedes iniciar sesión en /login con estas credenciales.");
  } catch (err: any) {
    console.error("❌ Error al crear usuario en Supabase:", err.message);
  } finally {
    await pool.end();
  }
}

main();

