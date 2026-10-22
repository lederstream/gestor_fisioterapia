-- ========================================================================================
-- KineFlow Core / Gestor Fisioterapia - Schema Relacional PostgreSQL para Supabase
-- Clínica: AJ Fisioterapia (San Borja - Lima, Perú)
-- Autor: Marco Antonio Yana (Lederstream)
-- Características: Concurrencia GiST anti-solapamiento, Triggers atómicos, RLS, 
-- Auditoría Inmutable, Índices de alto rendimiento y Seeding completo para producción.
-- ========================================================================================

-- 1. EXTENSIONES POSTGRESQL NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- Generación de UUIDs v4
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Hashing criptográfico
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- Prevención estricta de solapamiento horario

-- ========================================================================================
-- 2. TIPOS ENUMERADOS (ENUMS)
-- ========================================================================================

DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'RECEPCION', 'TERAPEUTA', 'PACIENTE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

-- ========================================================================================
-- 3. TABLAS MAESTRAS Y OPERATIVAS
-- ========================================================================================

-- 3.1. Personal Clínico y Usuarios del Sistema (RBAC)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'TERAPEUTA',
    especialidad VARCHAR(150),
    telefono VARCHAR(25),
    estado estado_usuario NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2. Directorio de Pacientes (Compatible con DNI peruano, Carné de Extranjería y Pasaporte)
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pacientes_dni CHECK (
        (tipo_documento = 'DNI' AND dni ~ '^[0-9]{8}$') OR
        (tipo_documento != 'DNI' AND length(dni) >= 5)
    )
);

-- 3.3. Salas Físicas (Capacidad fija de 6 salas en San Borja)
CREATE TABLE IF NOT EXISTS public.salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    estado estado_sala NOT NULL DEFAULT 'DISPONIBLE',
    equipamiento TEXT,
    capacidad_simultanea INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4. Catálogo de Servicios Clínicos de Fisioterapia (Marca Blanca)
CREATE TABLE IF NOT EXISTS public.servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    categoria_tag VARCHAR(100) DEFAULT 'DOLOR & MOVILIDAD',
    descripcion TEXT,
    duracion_minutos INT NOT NULL DEFAULT 45,
    precio_base NUMERIC(10, 2) NOT NULL CHECK (precio_base > 0),
    precio_promocional NUMERIC(10, 2),
    texto_promocion VARCHAR(150),
    imagen_url TEXT,
    mostrar_en_web BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5. Tratamientos y Paquetes de Sesiones (1, 10 y 20 sesiones con pagos fraccionados)
CREATE TABLE IF NOT EXISTS public.tratamientos_paquetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
    servicio_id UUID NOT NULL REFERENCES public.servicios(id) ON DELETE RESTRICT,
    total_sesiones INT NOT NULL DEFAULT 10 CHECK (total_sesiones IN (1, 10, 20)),
    sesiones_consumidas INT NOT NULL DEFAULT 0,
    monto_total NUMERIC(10, 2) NOT NULL CHECK (monto_total >= 0),
    monto_pagado NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (monto_pagado >= 0),
    estado_pago estado_pago NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_consumo_sesiones CHECK (sesiones_consumidas <= total_sesiones)
);

-- 3.6. Citas y Control de Concurrencia de Salas (Exclusión GiST para cero solapamiento horario)
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paquete_id UUID REFERENCES public.tratamientos_paquetes(id) ON DELETE SET NULL,
    terapeuta_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    sala_id UUID NOT NULL REFERENCES public.salas(id) ON DELETE RESTRICT,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
    fecha_hora_inicio TIMESTAMPTZ NOT NULL,
    fecha_hora_fin TIMESTAMPTZ NOT NULL,
    estado estado_cita NOT NULL DEFAULT 'PROGRAMADA',
    es_reevaluacion BOOLEAN NOT NULL DEFAULT FALSE,
    notas_cita TEXT,
    creado_por_nombre VARCHAR(100),
    confirmado_por_nombre VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rango_horario CHECK (fecha_hora_fin > fecha_hora_inicio),
    
    -- Restricción GiST 1: Imposible reservar 2 citas al mismo tiempo en la misma Sala física
    CONSTRAINT uq_citas_sala_horario EXCLUDE USING gist (
        sala_id WITH =,
        tstzrange(fecha_hora_inicio, fecha_hora_fin) WITH &&
    ) WHERE (estado != 'CANCELADA'),

    -- Restricción GiST 2: Imposible asignar a un mismo terapeuta a dos salas a la vez
    CONSTRAINT uq_citas_terapeuta_horario EXCLUDE USING gist (
        terapeuta_id WITH =,
        tstzrange(fecha_hora_inicio, fecha_hora_fin) WITH &&
    ) WHERE (estado != 'CANCELADA')
);

-- 3.7. Pagos y Cobranzas (Libro diario de caja conciliado)
CREATE TABLE IF NOT EXISTS public.pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paquete_id UUID NOT NULL REFERENCES public.tratamientos_paquetes(id) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    metodo_pago metodo_pago NOT NULL,
    numero_operacion VARCHAR(60) UNIQUE,
    comprobante_url TEXT,
    estado estado_verificacion_pago NOT NULL DEFAULT 'VERIFICADO',
    fecha_pago TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8. Ficha Clínica y Evolución (Escala EVA de Dolor 0 a 10)
CREATE TABLE IF NOT EXISTS public.historia_evolucion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID UNIQUE NOT NULL REFERENCES public.citas(id) ON DELETE CASCADE,
    terapeuta_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    eva_dolor_inicio INT NOT NULL CHECK (eva_dolor_inicio BETWEEN 0 AND 10),
    eva_dolor_fin INT NOT NULL CHECK (eva_dolor_fin BETWEEN 0 AND 10),
    tratamiento_aplicado TEXT NOT NULL,
    notas_reevaluacion TEXT,
    bloquea_alta BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9. Auditoría y Trazabilidad Inmutable (Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    usuario_nombre VARCHAR(150) NOT NULL DEFAULT 'Sistema',
    usuario_rol rol_usuario NOT NULL DEFAULT 'ADMIN',
    accion VARCHAR(60) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(100),
    detalles TEXT NOT NULL,
    ip_address INET DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10. Configuración Maestra del Centro Clínico (Marca Blanca)
CREATE TABLE IF NOT EXISTS public.configuracion_clinica (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'config-principal',
    razon_social VARCHAR(150) NOT NULL DEFAULT 'AJ Fisioterapia S.A.C.',
    nombre_comercial VARCHAR(100) NOT NULL DEFAULT 'AJ Fisioterapia',
    slogan VARCHAR(150) DEFAULT 'REHABILITACIÓN & BIENESTAR',
    titulo_hero VARCHAR(200) DEFAULT 'Vuelve a moverte.',
    subtitulo_hero VARCHAR(200) DEFAULT 'Vuelve a sentirte tú.',
    descripcion_hero TEXT DEFAULT 'Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.',
    ruc VARCHAR(11) NOT NULL DEFAULT '20608912345',
    direccion VARCHAR(200) NOT NULL DEFAULT 'Av. Guardia Civil 520, San Borja, Lima',
    direccion_avenida_calle VARCHAR(150) DEFAULT 'Av. Guardia Civil',
    direccion_numero VARCHAR(30) DEFAULT '520',
    direccion_distrito VARCHAR(100) DEFAULT 'San Borja',
    direccion_ciudad VARCHAR(100) DEFAULT 'Lima',
    direccion_referencia VARCHAR(200) DEFAULT 'A 2 cuadras de Av. Javier Prado Este',
    telefono VARCHAR(30) NOT NULL DEFAULT '(01) 475-2010',
    whatsapp VARCHAR(30) NOT NULL DEFAULT '+51 987 654 321',
    google_maps_url TEXT,
    hora_apertura TIME NOT NULL DEFAULT '08:00:00',
    hora_cierre TIME NOT NULL DEFAULT '20:00:00',
    intervalo_minutos INT NOT NULL DEFAULT 45,
    frecuencia_reevaluacion INT NOT NULL DEFAULT 5,
    bloqueo_alta_reevaluacion BOOLEAN NOT NULL DEFAULT TRUE,
    total_salas_fisicas INT NOT NULL DEFAULT 6,
    horarios_semana JSONB,
    testimonios JSONB,
    rating_promedio NUMERIC(3, 1) DEFAULT 4.9,
    total_pacientes_mes VARCHAR(50) DEFAULT '+1,100',
    logo_url TEXT,
    favicon_url TEXT,
    hero_image_url TEXT DEFAULT '/images/hero-physio.jpg',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_singleton_config CHECK (id = 'config-principal')
);

-- ========================================================================================
-- 4. ÍNDICES DE ALTO RENDIMIENTO
-- ========================================================================================

CREATE INDEX IF NOT EXISTS idx_citas_rango_fechas ON public.citas (fecha_hora_inicio, fecha_hora_fin, estado);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON public.citas (paciente_id, estado);
CREATE INDEX IF NOT EXISTS idx_citas_terapeuta ON public.citas (terapeuta_id, fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_citas_sala ON public.citas (sala_id, fecha_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON public.pacientes (dni);
CREATE INDEX IF NOT EXISTS idx_pacientes_apellidos ON public.pacientes (apellidos, nombres);
CREATE INDEX IF NOT EXISTS idx_paquetes_paciente ON public.tratamientos_paquetes (paciente_id, estado_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_paquete ON public.pagos (paquete_id, fecha_pago);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_modulo ON public.audit_logs (modulo, accion);

-- ========================================================================================
-- 5. FUNCIONES Y DISPARADORES AUTOMÁTICOS (AUTOMATED TRIGGERS)
-- ========================================================================================

-- 5.1. Actualizador automático de columna updated_at
CREATE OR REPLACE FUNCTION public.fn_actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();

    DROP TRIGGER IF EXISTS trg_pacientes_updated_at ON public.pacientes;
    CREATE TRIGGER trg_pacientes_updated_at BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();

    DROP TRIGGER IF EXISTS trg_salas_updated_at ON public.salas;
    CREATE TRIGGER trg_salas_updated_at BEFORE UPDATE ON public.salas FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();

    DROP TRIGGER IF EXISTS trg_servicios_updated_at ON public.servicios;
    CREATE TRIGGER trg_servicios_updated_at BEFORE UPDATE ON public.servicios FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();

    DROP TRIGGER IF EXISTS trg_paquetes_updated_at ON public.tratamientos_paquetes;
    CREATE TRIGGER trg_paquetes_updated_at BEFORE UPDATE ON public.tratamientos_paquetes FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();

    DROP TRIGGER IF EXISTS trg_citas_updated_at ON public.citas;
    CREATE TRIGGER trg_citas_updated_at BEFORE UPDATE ON public.citas FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();

    DROP TRIGGER IF EXISTS trg_pagos_updated_at ON public.pagos;
    CREATE TRIGGER trg_pagos_updated_at BEFORE UPDATE ON public.pagos FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();

    DROP TRIGGER IF EXISTS trg_historia_updated_at ON public.historia_evolucion;
    CREATE TRIGGER trg_historia_updated_at BEFORE UPDATE ON public.historia_evolucion FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5.2. Garantía de Inmutabilidad en Audit Logs (Imposible UPDATE o DELETE)
CREATE OR REPLACE FUNCTION public.fn_prevenir_mutacion_audit()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operación denegada: La tabla audit_logs es inmutable y legalmente protegida.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_inmutable ON public.audit_logs;
CREATE TRIGGER trg_audit_inmutable
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_prevenir_mutacion_audit();

-- 5.3. Actualización Automática de Saldo del Paquete tras un Pago
CREATE OR REPLACE FUNCTION public.fn_actualizar_saldo_paquete()
RETURNS TRIGGER AS $$
DECLARE
    v_total_pagado NUMERIC(10, 2);
    v_monto_total NUMERIC(10, 2);
    v_nuevo_estado estado_pago;
    v_paquete_id UUID;
BEGIN
    v_paquete_id := COALESCE(NEW.paquete_id, OLD.paquete_id);
    
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado FROM public.pagos WHERE paquete_id = v_paquete_id;
    SELECT monto_total INTO v_monto_total FROM public.tratamientos_paquetes WHERE id = v_paquete_id;

    IF v_total_pagado >= v_monto_total THEN
        v_nuevo_estado := 'PAGADO';
    ELSIF v_total_pagado > 0 THEN
        v_nuevo_estado := 'PARCIAL';
    ELSE
        v_nuevo_estado := 'PENDIENTE';
    END IF;

    UPDATE public.tratamientos_paquetes
    SET monto_pagado = v_total_pagado,
        estado_pago = v_nuevo_estado
    WHERE id = v_paquete_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pago_saldo ON public.pagos;
CREATE TRIGGER trg_pago_saldo
AFTER INSERT OR UPDATE OR DELETE ON public.pagos
FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_saldo_paquete();

-- 5.4. Incremento Automático de Sesiones Consumidas al Atender Cita
CREATE OR REPLACE FUNCTION public.fn_consumir_sesion_cita()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.estado != 'ATENDIDA' AND NEW.estado = 'ATENDIDA' AND NEW.paquete_id IS NOT NULL) THEN
        UPDATE public.tratamientos_paquetes
        SET sesiones_consumidas = sesiones_consumidas + 1
        WHERE id = NEW.paquete_id AND sesiones_consumidas < total_sesiones;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cita_consumida ON public.citas;
CREATE TRIGGER trg_cita_consumida
AFTER UPDATE OF estado ON public.citas
FOR EACH ROW EXECUTE FUNCTION public.fn_consumir_sesion_cita();

-- ========================================================================================
-- 6. ROW LEVEL SECURITY (RLS) - SEGURIDAD Y PERMISOS EN SUPABASE
-- ========================================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tratamientos_paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historia_evolucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_clinica ENABLE ROW LEVEL SECURITY;

-- Helper para obtener el rol del usuario conectado en Supabase JWT
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS rol_usuario AS $$
BEGIN
    RETURN COALESCE(
        (SELECT rol FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1),
        (SELECT 'PACIENTE'::rol_usuario WHERE EXISTS (SELECT 1 FROM public.pacientes WHERE auth_user_id = auth.uid()))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de Seguridad:
-- Permitir acceso de servicio backend y consultas autenticadas
CREATE POLICY "Acceso autenticado a salas" ON public.salas FOR ALL TO authenticated USING (true);
CREATE POLICY "Lectura anonima a salas" ON public.salas FOR SELECT TO anon USING (true);

CREATE POLICY "Acceso autenticado a servicios" ON public.servicios FOR ALL TO authenticated USING (true);
CREATE POLICY "Lectura anonima a servicios" ON public.servicios FOR SELECT TO anon USING (true);

CREATE POLICY "Acceso total a usuarios para admin" ON public.users FOR ALL TO authenticated 
USING (public.auth_user_role() = 'ADMIN' OR auth_user_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY "Lectura personal clinico" ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Gestion pacientes personal clinico" ON public.pacientes FOR ALL TO authenticated 
USING (public.auth_user_role() IN ('ADMIN', 'RECEPCION', 'TERAPEUTA') OR auth.role() = 'service_role');
CREATE POLICY "Pacientes ven solo su perfil" ON public.pacientes FOR SELECT TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY "Gestion citas para clinica" ON public.citas FOR ALL TO authenticated USING (true);
CREATE POLICY "Insert citas desde portal web publico" ON public.citas FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Gestion pagos para admin y recepcion" ON public.pagos FOR ALL TO authenticated 
USING (public.auth_user_role() IN ('ADMIN', 'RECEPCION') OR auth.role() = 'service_role');

CREATE POLICY "Historia clinica para terapeutas y admin" ON public.historia_evolucion FOR ALL TO authenticated
USING (public.auth_user_role() IN ('ADMIN', 'TERAPEUTA') OR auth.role() = 'service_role');

CREATE POLICY "Configuracion lectura general" ON public.configuracion_clinica FOR SELECT USING (true);
CREATE POLICY "Configuracion gestion admin" ON public.configuracion_clinica FOR ALL TO authenticated 
USING (public.auth_user_role() = 'ADMIN' OR auth.role() = 'service_role');

CREATE POLICY "Auditoria lectura admin" ON public.audit_logs FOR SELECT TO authenticated 
USING (public.auth_user_role() = 'ADMIN' OR auth.role() = 'service_role');
CREATE POLICY "Auditoria insercion sistema" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ========================================================================================
-- 7. SEED DATA OFICIAL (AJ FISIOTERAPIA - SAN BORJA)
-- ========================================================================================

-- 7.1. Configuración Principal
INSERT INTO public.configuracion_clinica (
    id, razon_social, nombre_comercial, slogan, titulo_hero, subtitulo_hero, descripcion_hero, ruc, direccion,
    direccion_avenida_calle, direccion_numero, direccion_distrito, direccion_ciudad, direccion_referencia,
    telefono, whatsapp, google_maps_url, hora_apertura, hora_cierre, intervalo_minutos, frecuencia_reevaluacion, total_salas_fisicas,
    rating_promedio, total_pacientes_mes, hero_image_url, testimonios
)
VALUES (
    'config-principal', 'AJ Fisioterapia S.A.C.', 'AJ Fisioterapia', 'REHABILITACIÓN & BIENESTAR',
    'Vuelve a moverte.', 'Vuelve a sentirte tú.',
    'Fisioterapia especializada y humana para recuperar tu bienestar, paso a paso.',
    '20608912345', 'Av. Guardia Civil 520, San Borja, Lima',
    'Av. Guardia Civil', '520', 'San Borja', 'Lima', 'A 2 cuadras de Av. Javier Prado Este',
    '(01) 475-2010', '+51 987 654 321', 'https://maps.google.com/?q=Av.+Guardia+Civil+520,+San+Borja',
    '08:00:00', '20:00:00', 45, 5, 6,
    4.9, '+1,100', '/images/hero-physio.jpg',
    '[
        {"id": "test-1", "nombre": "Renzo Morales", "calificacion": 5, "ocupacion": "Dolor Lumbar y Hernia Discal • San Borja", "comentario": "Llegué con un dolor lumbar severo que me impedía estar sentado más de 20 minutos en mi trabajo de oficina. Con 5 sesiones de terapia manual y descompresión, el cambio fue radical. Hoy trabajo sin molestias y volví a entrenar.", "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"},
        {"id": "test-2", "nombre": "Valeria Coronado", "calificacion": 5, "ocupacion": "Rehabilitación de Menisco • Miraflores", "comentario": "Me lesioné la rodilla a 6 semanas de correr la media maratón de Lima. El equipo de fisioterapia deportiva no solo alivió la inflamación, sino que me readaptó la pisada. ¡Pude correr y cruzar la meta sin dolor!", "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80"},
        {"id": "test-3", "nombre": "Dr. Fernando Townsend", "calificacion": 5, "ocupacion": "Post-operatorio Manguito Rotador • San Isidro", "comentario": "Como médico cirujano soy muy exigente con la evidencia clínica. En AJ Fisioterapia encontré licenciados altamente capacitados, tecnología de vanguardia y una calidez humana admirable.", "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80"},
        {"id": "test-4", "nombre": "Mariana Quispe", "calificacion": 5, "ocupacion": "Cervicalgia y Teletrabajo • Surco", "comentario": "Pasaba 10 horas en teletrabajo y las contracturas en el cuello me producían mareos y dolor diario. La combinación de punción seca y reeducación postural me devolvió el bienestar por completo.", "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80"},
        {"id": "test-5", "nombre": "Alberto Gutiérrez (73 años)", "calificacion": 5, "ocupacion": "Artrosis de Cadera y Equilibrio • San Borja", "comentario": "Mi hija me trajo porque me daba miedo caminar solo por la calle. La paciencia, vocación y ejercicios guiados de los terapeutas han hecho que recupere la fuerza y la confianza para salir a pasear.", "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80"},
        {"id": "test-6", "nombre": "Camila Benavides", "calificacion": 5, "ocupacion": "Esguince de Tobillo Grado 2 • La Molina", "comentario": "La atención es impecable desde la recepción hasta la última sesión. La puntualidad de los turnos, la limpieza de las salas y el gimnasio de rehabilitación hacen que valga cada sol invertido.", "avatarUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80"}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    nombre_comercial = EXCLUDED.nombre_comercial,
    slogan = EXCLUDED.slogan,
    direccion = EXCLUDED.direccion,
    telefono = EXCLUDED.telefono,
    whatsapp = EXCLUDED.whatsapp,
    testimonios = EXCLUDED.testimonios;

-- 7.2. Las 6 Salas Físicas de San Borja con Equipamiento
INSERT INTO public.salas (nombre, estado, equipamiento, capacidad_simultanea)
VALUES 
    ('Sala 1', 'DISPONIBLE', 'Camilla hidráulica, TENS, Ultrasonido terapéutico', 1),
    ('Sala 2', 'DISPONIBLE', 'Camilla quiropráctica, Láser de alta intensidad', 1),
    ('Sala 3', 'DISPONIBLE', 'Gimnasio funcional, Espalderas, Balones bobath', 1),
    ('Sala 4', 'DISPONIBLE', 'Crioterapia compresiva Game Ready, Magnetoterapia', 1),
    ('Sala 5', 'DISPONIBLE', 'Tracción cervical y lumbar computarizada', 1),
    ('Sala 6', 'DISPONIBLE', 'Punción seca, Ondas de choque focales', 1)
ON CONFLICT (nombre) DO UPDATE SET
    equipamiento = EXCLUDED.equipamiento;

-- 7.3. Catálogo de Servicios de Terapia Física (Con Descuentos y Promociones)
INSERT INTO public.servicios (nombre, categoria_tag, descripcion, duracion_minutos, precio_base, precio_promocional, texto_promocion, orden, mostrar_en_web)
VALUES 
    ('Terapia física', 'DOLOR & MOVILIDAD', 'Tratamientos personalizados para aliviar el dolor, recuperar movilidad y volver a tu rutina.', 45, 40.00, 30.00, 'PROMOCION DSCTO S/ 30 por sesión', 1, true),
    ('Rehabilitación deportiva', 'RENDIMIENTO', 'Recuperación muscular progresiva para regresar a tu deporte con confianza y seguridad.', 45, 40.00, 30.00, 'PROMOCION DSCTO S/ 30 por sesión', 2, true),
    ('Terapia neurológica', 'FUNCIONALIDAD', 'Acompañamiento especializado para mejorar la función, el equilibrio y la independencia.', 60, 60.00, 50.00, 'PROMOCION DSCTO S/ 50 por sesión', 3, true),
    ('Masoterapia', 'BIENESTAR', 'Masajes relajantes, descontracturantes según las necesidades de tu cuerpo.', 45, 80.00, 60.00, 'PROMOCION DSCTO S/ 60 por sesión 1 hora', 4, true)
ON CONFLICT DO NOTHING;

-- 7.4. Personal Clínico y Administrativo Inicial (10 profesionales)
INSERT INTO public.users (nombre, email, rol, especialidad, estado)
VALUES 
    ('Marco Yana', 'marco.yana@ajfisioterapia.pe', 'ADMIN', 'Gerencia y Dirección Clínica', 'ACTIVO'),
    ('Karin Palacios', 'karin.palacios@ajfisioterapia.pe', 'RECEPCION', 'Admisión y Caja Principal', 'ACTIVO'),
    ('Laura Peña', 'recepcion2@ajfisioterapia.pe', 'RECEPCION', 'Atención al Paciente y Turno Tarde', 'ACTIVO'),
    ('Lic. Jeiser Vasquez', 'jeiser.vasquez@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Fisioterapia Deportiva y Readaptación', 'ACTIVO'),
    ('Lic. Andrea Rivas', 'andrea.rivas@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Terapia Manual Ortopédica y Columna', 'ACTIVO'),
    ('Lic. Javier Ponce', 'javier.ponce@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Biomecánica y Reeducación Postural', 'ACTIVO'),
    ('Lic. Valeria Soto', 'valeria.soto@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Neurorehabilitación y Adulto Mayor', 'ACTIVO'),
    ('Tec. Miguel Torres', 'miguel.torres@ajfisioterapia.pe', 'TERAPEUTA', 'Técnico en Agentes Físicos y Electroterapia', 'ACTIVO'),
    ('Tec. Diana Paredes', 'diana.paredes@ajfisioterapia.pe', 'TERAPEUTA', 'Técnico en Masoterapia y Crioterapia', 'ACTIVO'),
    ('Alexander Saavedra', 'alexander.saavedra@gmail.com', 'PACIENTE', 'Paciente Titular', 'ACTIVO')
ON CONFLICT (email) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    especialidad = EXCLUDED.especialidad;

-- 7.5. Pacientes Semilla Iniciales
INSERT INTO public.pacientes (
    tipo_documento, dni, primer_nombre, apellido_paterno, apellido_materno, nombres, apellidos, telefono, email, fecha_nacimiento, contacto_emergencia
)
VALUES 
    ('DNI', '45892011', 'Alexander', 'Saavedra', 'Castillo', 'Alexander', 'Saavedra Castillo', '987123456', 'alexander.saavedra@gmail.com', '1991-04-12', 'Esposa - 987999111'),
    ('DNI', '72109483', 'Camila', 'Vargas', 'Flores', 'Camila', 'Vargas Flores', '976543210', 'camila.vargas@hotmail.com', '1998-09-24', 'Madre - 976000222')
ON CONFLICT (dni) DO NOTHING;
