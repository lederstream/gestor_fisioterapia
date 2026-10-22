import pg from 'pg';
const { Pool } = pg;

// Supabase pooler connection strings
// Pooler (Transaction Mode, port 6543)
const connectionString6543 = "postgresql://postgres.zypemlzwrrdbnxyncddo:EWvmJIGQapAKGWID@aws-0-us-east-1.pooler.supabase.com:6543/postgres";
// Session Mode (port 5432)
const connectionString5432 = "postgresql://postgres.zypemlzwrrdbnxyncddo:EWvmJIGQapAKGWID@aws-0-us-east-1.pooler.supabase.com:5432/postgres";

async function testAndMigrate() {
  console.log("Connecting to Supabase...");
  let pool;
  try {
    pool = new Pool({
      connectionString: connectionString6543,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    const client = await pool.connect();
    console.log("Successfully connected to Supabase on port 6543!");
    client.release();
  } catch (err) {
    console.warn("Failed on 6543, trying port 5432...", err.message);
    pool = new Pool({
      connectionString: connectionString5432,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    const client = await pool.connect();
    console.log("Successfully connected to Supabase on port 5432!");
    client.release();
  }

  // List existing tables
  const resTables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log("Existing tables:", resTables.rows.map(r => r.table_name));

  // Alter configuracion_clinica to make sure all white-label branding & landing columns exist
  console.log("Updating configuracion_clinica schema...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.configuracion_clinica (
      id VARCHAR(255) PRIMARY KEY DEFAULT 'config-principal',
      razon_social VARCHAR(255) DEFAULT 'AJ Fisioterapia S.A.C.',
      nombre_comercial VARCHAR(255) DEFAULT 'AJ Fisioterapia',
      ruc VARCHAR(50) DEFAULT '20608912345',
      direccion VARCHAR(255) DEFAULT 'Av. Guardia Civil 520, San Borja, Lima',
      telefono VARCHAR(50) DEFAULT '(01) 475-2010',
      whatsapp VARCHAR(50) DEFAULT '+51 987 654 321',
      hora_apertura VARCHAR(10) DEFAULT '08:00',
      hora_cierre VARCHAR(10) DEFAULT '20:00',
      intervalo_minutos INT DEFAULT 45,
      frecuencia_reevaluacion INT DEFAULT 5,
      bloqueo_alta_reevaluacion BOOLEAN DEFAULT true,
      total_salas_fisicas INT DEFAULT 6,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE public.configuracion_clinica 
      ADD COLUMN IF NOT EXISTS slogan VARCHAR(255) DEFAULT 'REHABILITACIÓN & BIENESTAR',
      ADD COLUMN IF NOT EXISTS titulo_hero VARCHAR(255) DEFAULT 'Vuelve a moverte.',
      ADD COLUMN IF NOT EXISTS subtitulo_hero VARCHAR(255) DEFAULT 'Vuelve a sentirte tú.',
      ADD COLUMN IF NOT EXISTS descripcion_hero TEXT DEFAULT 'Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.',
      ADD COLUMN IF NOT EXISTS direccion_avenida_calle VARCHAR(255) DEFAULT 'Av. Guardia Civil',
      ADD COLUMN IF NOT EXISTS direccion_numero VARCHAR(50) DEFAULT '520',
      ADD COLUMN IF NOT EXISTS direccion_distrito VARCHAR(100) DEFAULT 'San Borja',
      ADD COLUMN IF NOT EXISTS direccion_ciudad VARCHAR(100) DEFAULT 'Lima',
      ADD COLUMN IF NOT EXISTS direccion_referencia VARCHAR(255) DEFAULT 'A 2 cuadras de Av. Javier Prado Este',
      ADD COLUMN IF NOT EXISTS google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Av.+Guardia+Civil+520,+San+Borja',
      ADD COLUMN IF NOT EXISTS horarios_semana JSONB,
      ADD COLUMN IF NOT EXISTS testimonios JSONB,
      ADD COLUMN IF NOT EXISTS rating_promedio NUMERIC(3, 1) DEFAULT 4.9,
      ADD COLUMN IF NOT EXISTS total_pacientes_mes VARCHAR(50) DEFAULT '+1,100',
      ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/images/logo-clinica.svg',
      ADD COLUMN IF NOT EXISTS favicon_url TEXT DEFAULT '/favicon.ico',
      ADD COLUMN IF NOT EXISTS hero_image_url TEXT DEFAULT '/images/hero-physio.jpg',
      ADD COLUMN IF NOT EXISTS color_primario VARCHAR(20) DEFAULT '#0C3E37',
      ADD COLUMN IF NOT EXISTS color_secundario VARCHAR(20) DEFAULT '#E07052',
      ADD COLUMN IF NOT EXISTS color_acento VARCHAR(20) DEFAULT '#0D9488';
  `);

  console.log("Updating servicios schema...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.servicios (
      id VARCHAR(255) PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      duracion_minutos INT DEFAULT 45,
      precio_base NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE public.servicios
      ADD COLUMN IF NOT EXISTS categoria_tag VARCHAR(100) DEFAULT 'DOLOR & MOVILIDAD',
      ADD COLUMN IF NOT EXISTS descripcion TEXT,
      ADD COLUMN IF NOT EXISTS precio_promocional NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS texto_promocion VARCHAR(150),
      ADD COLUMN IF NOT EXISTS imagen_url TEXT,
      ADD COLUMN IF NOT EXISTS mostrar_en_web BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS orden INT DEFAULT 1;
  `);

  // Ensure default configuracion_clinica row exists
  const configExists = await pool.query(`SELECT id FROM public.configuracion_clinica WHERE id = 'config-principal'`);
  if (configExists.rows.length === 0) {
    console.log("Inserting default configuracion_clinica...");
    await pool.query(`
      INSERT INTO public.configuracion_clinica (
        id, razon_social, nombre_comercial, slogan, titulo_hero, subtitulo_hero, descripcion_hero,
        ruc, direccion, telefono, whatsapp, google_maps_url, hora_apertura, hora_cierre,
        intervalo_minutos, frecuencia_reevaluacion, bloqueo_alta_reevaluacion, total_salas_fisicas,
        rating_promedio, total_pacientes_mes, logo_url, favicon_url, hero_image_url,
        color_primario, color_secundario, color_acento, updated_at
      ) VALUES (
        'config-principal', 'AJ Fisioterapia S.A.C.', 'AJ Fisioterapia', 'REHABILITACIÓN & BIENESTAR',
        'Vuelve a moverte.', 'Vuelve a sentirte tú.', 'Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.',
        '20608912345', 'Av. Guardia Civil 520, San Borja, Lima (Ref: Cerca al Óvalo Quiñones)',
        '(01) 475-2010', '+51 987 654 321', 'https://maps.google.com/?q=Av.+Guardia+Civil+520,+San+Borja',
        '08:00', '20:00', 45, 5, true, 6, 4.9, '+1,100',
        '/images/logo-clinica.svg', '/favicon.ico', '/images/hero-physio.jpg',
        '#0C3E37', '#E07052', '#0D9488', NOW()
      );
    `);
  } else {
    console.log("Configuracion clinica exists, ensuring default colors...");
    await pool.query(`
      UPDATE public.configuracion_clinica
      SET 
        color_primario = COALESCE(color_primario, '#0C3E37'),
        color_secundario = COALESCE(color_secundario, '#E07052'),
        color_acento = COALESCE(color_acento, '#0D9488')
      WHERE id = 'config-principal';
    `);
  }

  // Count records in tables
  for (const t of ['configuracion_clinica', 'servicios', 'users', 'pacientes', 'salas', 'citas']) {
    try {
      const c = await pool.query(`SELECT COUNT(*) FROM public.${t}`);
      console.log(`Table public.${t}: ${c.rows[0].count} records`);
    } catch (e) {
      console.log(`Table public.${t} not queryable yet: ${e.message}`);
    }
  }

  await pool.end();
  console.log("Database migration and verification finished successfully!");
}

testAndMigrate().catch(e => {
  console.error("Migration error:", e);
  process.exit(1);
});
