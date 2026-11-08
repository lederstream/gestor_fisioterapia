-- ========================================================================================
-- SCRIPT MAESTRO DE INICIALIZACIÓN LIMPIA PARA CUALQUIER CLÍNICA (MULTI-TENANT READY)
-- Gestor Fisioterapia / KineFlow Core
-- Ejecutar en el SQL Editor de Supabase (o cualquier PostgreSQL 15+)
-- ========================================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUMERADOS (Con soporte para todos los roles, incluido ASISTENTE y SUPERADMIN)
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('SUPERADMIN', 'ADMIN', 'RECEPCION', 'TERAPEUTA', 'ASISTENTE', 'PACIENTE');
EXCEPTION WHEN duplicate_object THEN
    ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'SUPERADMIN';
    ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'ASISTENTE';
END $$;

DO $$ BEGIN
    CREATE TYPE estado_usuario AS ENUM ('ACTIVO', 'INACTIVO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_sala AS ENUM ('DISPONIBLE', 'MANTENIMIENTO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_pago AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_cita AS ENUM ('PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE metodo_pago AS ENUM ('EFECTIVO', 'YAPE', 'PLIN', 'POS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_verificacion_pago AS ENUM ('VERIFICADO', 'PENDIENTE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. CREACIÓN DE TABLAS SI NO EXISTEN (Idénticas al schema de Prisma)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'TERAPEUTA',
    especialidad VARCHAR(150),
    estado estado_usuario NOT NULL DEFAULT 'ACTIVO',
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento VARCHAR(20) NOT NULL DEFAULT 'DNI',
    dni VARCHAR(20) UNIQUE NOT NULL,
    primer_nombre VARCHAR(60),
    segundo_nombre VARCHAR(60),
    apellido_paterno VARCHAR(60),
    apellido_materno VARCHAR(60),
    nombres VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    telefono VARCHAR(25) NOT NULL,
    email VARCHAR(150),
    fecha_nacimiento DATE NOT NULL,
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_parentesco VARCHAR(50),
    contacto_emergencia_telefono VARCHAR(25),
    contacto_emergencia VARCHAR(150),
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    estado estado_sala NOT NULL DEFAULT 'DISPONIBLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    categoria_tag VARCHAR(50) DEFAULT 'DOLOR & MOVILIDAD',
    descripcion TEXT,
    duracion_minutos INT NOT NULL DEFAULT 45,
    precio_base NUMERIC(10, 2) NOT NULL,
    precio_promocional NUMERIC(10, 2),
    texto_promocion VARCHAR(100),
    imagen_url TEXT,
    mostrar_en_web BOOLEAN NOT NULL DEFAULT true,
    orden INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tratamientos_paquetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
    servicio_id UUID NOT NULL REFERENCES public.servicios(id) ON DELETE RESTRICT,
    total_sesiones INT NOT NULL DEFAULT 10,
    sesiones_consumidas INT NOT NULL DEFAULT 0,
    monto_total NUMERIC(10, 2) NOT NULL,
    monto_pagado NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estado_pago estado_pago NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paquete_id UUID REFERENCES public.tratamientos_paquetes(id) ON DELETE SET NULL,
    terapeuta_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    sala_id UUID NOT NULL REFERENCES public.salas(id) ON DELETE RESTRICT,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
    fecha_hora_inicio TIMESTAMPTZ NOT NULL,
    fecha_hora_fin TIMESTAMPTZ NOT NULL,
    estado estado_cita NOT NULL DEFAULT 'PROGRAMADA',
    es_reevaluacion BOOLEAN NOT NULL DEFAULT false,
    notas_cita TEXT,
    creado_por_nombre VARCHAR(150),
    confirmado_por_nombre VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_citas_sala_inicio UNIQUE (sala_id, fecha_hora_inicio),
    CONSTRAINT uq_citas_terapeuta_inicio UNIQUE (terapeuta_id, fecha_hora_inicio)
);

CREATE TABLE IF NOT EXISTS public.pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paquete_id UUID NOT NULL REFERENCES public.tratamientos_paquetes(id) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL,
    metodo_pago metodo_pago NOT NULL,
    numero_operacion VARCHAR(100) UNIQUE,
    comprobante_url TEXT,
    estado estado_verificacion_pago NOT NULL DEFAULT 'VERIFICADO',
    fecha_pago TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.historia_evolucion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID UNIQUE NOT NULL REFERENCES public.citas(id) ON DELETE CASCADE,
    terapeuta_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    eva_dolor_inicio INT NOT NULL,
    eva_dolor_fin INT NOT NULL,
    tratamiento_aplicado TEXT NOT NULL,
    notas_reevaluacion TEXT,
    bloquea_alta BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID,
    usuario_nombre VARCHAR(150) NOT NULL DEFAULT 'Sistema',
    usuario_rol rol_usuario NOT NULL DEFAULT 'ADMIN',
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(100),
    detalles TEXT NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.configuracion_clinica (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'config-principal',
    razon_social VARCHAR(150) NOT NULL DEFAULT 'AJ Fisioterapia S.A.C.',
    nombre_comercial VARCHAR(100) NOT NULL DEFAULT 'AJ Fisioterapia',
    slogan VARCHAR(150) DEFAULT 'REHABILITACIÓN & BIENESTAR',
    titulo_hero VARCHAR(150) DEFAULT 'Vuelve a moverte.',
    subtitulo_hero VARCHAR(150) DEFAULT 'Vuelve a sentirte tú.',
    descripcion_hero TEXT DEFAULT 'Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.',
    ruc VARCHAR(20) NOT NULL DEFAULT '20608912345',
    direccion VARCHAR(200) NOT NULL DEFAULT 'Av. Guardia Civil 520, San Borja, Lima',
    direccion_distrito VARCHAR(50) DEFAULT 'San Borja',
    direccion_ciudad VARCHAR(50) DEFAULT 'Lima',
    telefono VARCHAR(30) NOT NULL DEFAULT '(01) 475-2010',
    whatsapp VARCHAR(30) NOT NULL DEFAULT '+51 987 654 321',
    hora_apertura VARCHAR(10) NOT NULL DEFAULT '08:00',
    hora_cierre VARCHAR(10) NOT NULL DEFAULT '20:00',
    intervalo_minutos INT NOT NULL DEFAULT 45,
    frecuencia_reevaluacion INT NOT NULL DEFAULT 5,
    bloqueo_alta_reevaluacion BOOLEAN NOT NULL DEFAULT true,
    total_salas_fisicas INT NOT NULL DEFAULT 6,
    color_primario VARCHAR(20) DEFAULT '#0C3E37',
    color_secundario VARCHAR(20) DEFAULT '#E07052',
    color_acento VARCHAR(20) DEFAULT '#0D9488',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================================
-- 4. LIMPIEZA TOTAL ATÓMICA DE DATOS ANTERIORES
-- ========================================================================================
TRUNCATE TABLE 
    public.audit_logs,
    public.historia_evolucion,
    public.pagos,
    public.citas,
    public.tratamientos_paquetes,
    public.pacientes,
    public.salas,
    public.servicios,
    public.users,
    public.configuracion_clinica
CASCADE;

-- ========================================================================================
-- 5. SEMBRADO LIMPIO (SEEDING CON UUIDs NATIVOS 100% DINÁMICOS)
-- ========================================================================================

-- 5.1. Configuración de la Clínica
INSERT INTO public.configuracion_clinica (
    id, razon_social, nombre_comercial, ruc, direccion, telefono, whatsapp, hora_apertura, hora_cierre
) VALUES (
    'config-principal',
    'AJ Fisioterapia S.A.C.',
    'AJ Fisioterapia',
    '20608912345',
    'Av. Guardia Civil 520, San Borja, Lima',
    '(01) 475-2010',
    '+51 987 654 321',
    '08:00',
    '20:00'
);

-- 5.2. Las 6 Salas Físicas Oficiales
INSERT INTO public.salas (nombre, estado) VALUES
    ('Sala 1', 'DISPONIBLE'),
    ('Sala 2', 'DISPONIBLE'),
    ('Sala 3', 'DISPONIBLE'),
    ('Sala 4', 'DISPONIBLE'),
    ('Sala 5', 'DISPONIBLE'),
    ('Sala 6', 'DISPONIBLE');

-- 5.3. Servicios Clínicos
INSERT INTO public.servicios (nombre, categoria_tag, descripcion, duracion_minutos, precio_base, precio_promocional, orden) VALUES
    ('Terapia física y dolor', 'DOLOR & MOVILIDAD', 'Tratamiento personalizado para aliviar el dolor, recuperar movilidad articular y volver a la rutina sin dolor.', 45, 40.00, 30.00, 1),
    ('Rehabilitación deportiva', 'DEPORTE & READAPTACIÓN', 'Recuperación acelerada de desgarros, esguinces, tendinitis y acondicionamiento musculoesquelético para atletas.', 45, 50.00, 40.00, 2),
    ('Descarga muscular profunda', 'RECUPERACIÓN & DESCARGA', 'Terapia manual descontracturante con termoterapia y liberación miofascial para aliviar tensión acumulada y estrés.', 45, 45.00, 35.00, 3),
    ('Terapia preventiva y postural', 'COLUMNA & BIENESTAR', 'Corrección ergonómica, reeducación postural global y ejercicios específicos para evitar recaídas y dolor lumbar.', 45, 35.00, 30.00, 4),
    ('Rehabilitación postoperatoria', 'CIRUGÍA & TRAUMA', 'Protocolos clínicos de fase temprana para prótesis, ligamentos cruzados y fracturas.', 45, 60.00, 50.00, 5),
    ('Neurorehabilitación funcional', 'NEUROLÓGICA', 'Rehabilitación neuromuscular para ACV, Parkinson y parálisis facial.', 60, 80.00, 65.00, 6);

-- 5.4. Personal y Usuarios Administrativos/Clínicos
-- Hasheados nativamente con bcrypt (factor de costo 10) usando pgcrypto:
-- Superadmin:  SuperAdmin2026!
-- Admin:        AdminClinico2026!
-- Recepción:    Recepcion2026!
-- Terapeutas:   Terapeuta2026!
-- Asistentes:   Asistente2026!
INSERT INTO public.users (nombre, email, rol, especialidad, estado, password_hash) VALUES
    ('Super Administrador', 'superadmin@sistema.pe', 'SUPERADMIN', 'Auditoría Global & Infraestructura TI', 'ACTIVO', crypt('SuperAdmin2026!', gen_salt('bf', 10))),
    ('Marco Antonio Yana', 'gerencia@ajfisioterapia.pe', 'ADMIN', 'Director Clínico & Gerencia General', 'ACTIVO', crypt('AdminClinico2026!', gen_salt('bf', 10))),
    ('Ana Ramos', 'recepcion1@ajfisioterapia.pe', 'RECEPCION', 'Coordinadora de Citas y Caja', 'ACTIVO', crypt('Recepcion2026!', gen_salt('bf', 10))),
    ('Laura Peña', 'recepcion2@ajfisioterapia.pe', 'RECEPCION', 'Atención al Paciente y Turnos', 'ACTIVO', crypt('Recepcion2026!', gen_salt('bf', 10))),
    ('Lic. Jeiser Vásquez', 'jeiser.vasquez@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Fisioterapia Deportiva y Readaptación', 'ACTIVO', crypt('Terapeuta2026!', gen_salt('bf', 10))),
    ('Lic. Andrea Rivas', 'andrea.rivas@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Terapia Manual Ortopédica y Columna', 'ACTIVO', crypt('Terapeuta2026!', gen_salt('bf', 10))),
    ('Lic. Javier Ponce', 'javier.ponce@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Biomecánica y Reeducación Postural', 'ACTIVO', crypt('Terapeuta2026!', gen_salt('bf', 10))),
    ('Lic. Valeria Soto', 'valeria.soto@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Neurorehabilitación y Adulto Mayor', 'ACTIVO', crypt('Terapeuta2026!', gen_salt('bf', 10))),
    ('Tec. Miguel Torres', 'miguel.torres@ajfisioterapia.pe', 'ASISTENTE', 'Técnico en Agentes Físicos y Electroterapia', 'ACTIVO', crypt('Asistente2026!', gen_salt('bf', 10))),
    ('Tec. Diana Paredes', 'diana.paredes@ajfisioterapia.pe', 'ASISTENTE', 'Técnico en Masoterapia y Crioterapia', 'ACTIVO', crypt('Asistente2026!', gen_salt('bf', 10)));

-- 5.5. Pacientes Iniciales Reales (Con DNI peruano oficial y clave hasheada con bcrypt igual a su DNI)
INSERT INTO public.pacientes (
    tipo_documento, dni, nombres, apellidos, telefono, email, fecha_nacimiento, password_hash
) VALUES
    ('DNI', '45892011', 'Juan Carlos', 'Morales Díaz', '987654321', 'juan.morales@gmail.com', '1988-06-14', crypt('45892011', gen_salt('bf', 10))),
    ('DNI', '10234567', 'María Elena', 'Vargas Prado', '976543210', 'maria.vargas@gmail.com', '1992-09-22', crypt('10234567', gen_salt('bf', 10))),
    ('DNI', '72345678', 'Alexander', 'Rodríguez Castro', '965432109', 'alexander.rodriguez@gmail.com', '1995-03-30', crypt('72345678', gen_salt('bf', 10))),
    ('DNI', '08912345', 'Rosa Patricia', 'Flores Vega', '954321098', 'rosa.flores@gmail.com', '1980-11-15', crypt('08912345', gen_salt('bf', 10)));

-- 5.6. Paquetes de Tratamiento Activos
INSERT INTO public.tratamientos_paquetes (
    paciente_id, servicio_id, total_sesiones, sesiones_consumidas, monto_total, monto_pagado, estado_pago
)
SELECT 
    p.id, s.id, 10, 3, 300.00, 300.00, 'PAGADO'::estado_pago
FROM public.pacientes p, public.servicios s
WHERE p.dni = '45892011' AND s.nombre ILIKE '%Terapia física%'
LIMIT 1;

INSERT INTO public.tratamientos_paquetes (
    paciente_id, servicio_id, total_sesiones, sesiones_consumidas, monto_total, monto_pagado, estado_pago
)
SELECT 
    p.id, s.id, 20, 7, 700.00, 350.00, 'PARCIAL'::estado_pago
FROM public.pacientes p, public.servicios s
WHERE p.dni = '10234567' AND s.nombre ILIKE '%Rehabilitación deportiva%'
LIMIT 1;

-- 5.7. Registro de Auditoría Inicial
INSERT INTO public.audit_logs (
    usuario_nombre, usuario_rol, accion, modulo, detalles
) VALUES (
    'Sistema Clínico', 'SUPERADMIN', 'SISTEMA_RESTAURADO', 'SISTEMA',
    'Inicialización limpia de la base de datos institucional. Salas, servicios y roles configurados con éxito.'
);

-- ========================================================================================
-- FIN DEL SCRIPT MAESTRO - BASE DE DATOS LISTA Y 100% DINÁMICA
-- ========================================================================================

