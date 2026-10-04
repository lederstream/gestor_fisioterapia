-- ========================================================================================
-- KineFlow Core - Schema Relacional PostgreSQL para Supabase (Nivel Senior & Producción)
-- Centro: AJ Fisioterapia (Sede San Borja - Lima, Perú)
-- Características: RLS (Row Level Security), Concurrencia GiST anti-solapamiento, Triggers,
-- Auditoría Inmutable, Índices de Alto Rendimiento y Seeding Oficial.
-- ========================================================================================

-- 1. EXTENSIONES POSTGRESQL NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- Generación de UUIDs v4
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Hashing criptográfico
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- Prevención de solapamiento de horarios en salas

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

-- 3.1. Usuarios y Personal Clínico (RBAC con perfiles vinculables a Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Vínculo opcional con Auth Supabase
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'TERAPEUTA',
    especialidad VARCHAR(150), -- Ej: "Lic. Fisioterapia Deportiva y Readaptación"
    telefono VARCHAR(20),
    estado estado_usuario NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2. Directorio de Pacientes (Con validación de DNI peruano de 8 dígitos)
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Para acceso al Portal del Paciente
    dni VARCHAR(12) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(25) NOT NULL,
    email VARCHAR(150),
    fecha_nacimiento DATE NOT NULL,
    contacto_emergencia VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pacientes_dni CHECK (dni ~ '^[0-9]{8}$') -- Regla estricta DNI 8 dígitos numéricos
);

-- 3.3. Salas Físicas (Capacidad fija de 6 salas en San Borja)
CREATE TABLE IF NOT EXISTS public.salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL, -- "Sala 1" a "Sala 6"
    estado estado_sala NOT NULL DEFAULT 'DISPONIBLE',
    equipamiento TEXT,
    capacidad_simultanea INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4. Catálogo de Servicios Clínicos
CREATE TABLE IF NOT EXISTS public.servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    duracion_minutos INT NOT NULL DEFAULT 45,
    precio_base NUMERIC(10, 2) NOT NULL CHECK (precio_base > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5. Tratamientos y Paquetes de Sesiones (1, 10 y 20 sesiones)
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

-- 3.6. Citas y Concurrencia de Salas (Exclusión GiST para cero solapamiento a nivel BD)
CREATE TABLE IF NOT EXISTS public.citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paquete_id UUID REFERENCES public.tratamientos_paquetes(id) ON DELETE SET NULL,
    terapeuta_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    sala_id UUID NOT NULL REFERENCES public.salas(id) ON DELETE RESTRICT,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
    fecha_hora_inicio TIMESTAMPTZ NOT NULL,
    fecha_hora_fin TIMESTAMPTZ NOT NULL,
    estado estado_cita NOT NULL DEFAULT 'PROGRAMADA',
    es_reevaluacion BOOLEAN NOT NULL DEFAULT FALSE, -- Hito clínico obligatorio en sesión 5
    notas_cita TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rango_horario CHECK (fecha_hora_fin > fecha_hora_inicio),
    
    -- SENIOR CONSTRAINT 1: Imposible reservar 2 citas al mismo tiempo en la misma Sala
    CONSTRAINT uq_citas_sala_horario EXCLUDE USING gist (
        sala_id WITH =,
        tstzrange(fecha_hora_inicio, fecha_hora_fin) WITH &&
    ) WHERE (estado != 'CANCELADA'),

    -- SENIOR CONSTRAINT 2: Imposible asignar a un terapeuta a dos salas simultáneamente
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
    numero_operacion VARCHAR(60) UNIQUE, -- Para conciliar Yape/Plin/POS
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

-- 3.9. Auditoría y Trazabilidad Inmutable (Append-Only Audit Trail)
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

-- 3.10. Configuración Maestra del Centro (Patrón Singleton)
CREATE TABLE IF NOT EXISTS public.configuracion_clinica (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'config-principal',
    razon_social VARCHAR(150) NOT NULL DEFAULT 'AJ Fisioterapia S.A.C.',
    nombre_comercial VARCHAR(100) NOT NULL DEFAULT 'AJ Fisioterapia',
    ruc VARCHAR(11) NOT NULL DEFAULT '20608912345',
    direccion VARCHAR(200) NOT NULL DEFAULT 'Av. Guardia Civil 520, San Borja, Lima',
    telefono VARCHAR(30) NOT NULL DEFAULT '(01) 475-2010',
    whatsapp VARCHAR(30) NOT NULL DEFAULT '+51 987 654 321',
    hora_apertura TIME NOT NULL DEFAULT '08:00:00',
    hora_cierre TIME NOT NULL DEFAULT '20:00:00',
    intervalo_minutos INT NOT NULL DEFAULT 45,
    frecuencia_reevaluacion INT NOT NULL DEFAULT 5,
    bloqueo_alta_reevaluacion BOOLEAN NOT NULL DEFAULT TRUE,
    total_salas_fisicas INT NOT NULL DEFAULT 6,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_singleton_config CHECK (id = 'config-principal')
);

-- ========================================================================================
-- 4. ÍNDICES DE ALTO RENDIMIENTO (OPTIMIZADOS PARA ESCALAR A MILES DE REGISTROS)
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
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();
    CREATE TRIGGER trg_pacientes_updated_at BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();
    CREATE TRIGGER trg_salas_updated_at BEFORE UPDATE ON public.salas FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();
    CREATE TRIGGER trg_servicios_updated_at BEFORE UPDATE ON public.servicios FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();
    CREATE TRIGGER trg_paquetes_updated_at BEFORE UPDATE ON public.tratamientos_paquetes FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();
    CREATE TRIGGER trg_citas_updated_at BEFORE UPDATE ON public.citas FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();
    CREATE TRIGGER trg_pagos_updated_at BEFORE UPDATE ON public.pagos FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_updated_at();
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
BEGIN
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado FROM public.pagos WHERE paquete_id = NEW.paquete_id;
    SELECT monto_total INTO v_monto_total FROM public.tratamientos_paquetes WHERE id = NEW.paquete_id;

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
    WHERE id = NEW.paquete_id;

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
-- 6. ROW LEVEL SECURITY (RLS) - SEGURIDAD Y AISLAMIENTO DE ROLES EN SUPABASE
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
-- 6.1. Salas y Servicios: Lectura pública/autenticada, modificación solo ADMIN
CREATE POLICY "Lectura salas para autenticados" ON public.salas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestion salas solo ADMIN" ON public.salas FOR ALL TO authenticated USING (public.auth_user_role() = 'ADMIN');

CREATE POLICY "Lectura servicios para autenticados" ON public.servicios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestion servicios solo ADMIN" ON public.servicios FOR ALL TO authenticated USING (public.auth_user_role() = 'ADMIN');

-- 6.2. Pagos: Oculto para Terapeutas y Pacientes ajenos. Visible para ADMIN y RECEPCION.
CREATE POLICY "Admin y Recepcion gestionan pagos" ON public.pagos FOR ALL TO authenticated 
USING (public.auth_user_role() IN ('ADMIN', 'RECEPCION'));

-- 6.3. Historia Clínica: Visible para Terapeuta y Admin. Recepción NO tiene acceso clínico.
CREATE POLICY "Historia clinica terapeutas y admin" ON public.historia_evolucion FOR ALL TO authenticated
USING (public.auth_user_role() IN ('ADMIN', 'TERAPEUTA'));

-- 6.4. Aislamiento de Pacientes: El paciente autenticado SOLO ve su propio expediente
CREATE POLICY "Pacientes ven solo su perfil" ON public.pacientes FOR SELECT TO authenticated
USING (
    public.auth_user_role() IN ('ADMIN', 'RECEPCION', 'TERAPEUTA') 
    OR auth_user_id = auth.uid()
);

-- ========================================================================================
-- 7. SEED DATA OFICIAL (AJ FISIOTERAPIA - SAN BORJA)
-- ========================================================================================

-- 7.1. Configuración Principal
INSERT INTO public.configuracion_clinica (id, razon_social, nombre_comercial, ruc, direccion, telefono, whatsapp, total_salas_fisicas)
VALUES ('config-principal', 'AJ Fisioterapia S.A.C.', 'AJ Fisioterapia', '20608912345', 'Av. Guardia Civil 520, San Borja, Lima', '(01) 475-2010', '+51 987 654 321', 6)
ON CONFLICT (id) DO NOTHING;

-- 7.2. 6 Salas Físicas de San Borja
INSERT INTO public.salas (nombre, estado, equipamiento)
VALUES 
    ('Sala 1', 'DISPONIBLE', 'Camilla reclinable, ultrasonido y compresero caliente'),
    ('Sala 2', 'DISPONIBLE', 'Electroestimulación TENS/EMS, láser terapéutico y magnetoterapia'),
    ('Sala 3', 'DISPONIBLE', 'Mesa de tracción cervical/lumbar y dinamómetro digital'),
    ('Sala 4', 'DISPONIBLE', 'Kit de punción seca, ventosas neumáticas e instrumental neuromiofascial'),
    ('Sala 5', 'DISPONIBLE', 'Barras paralelas, colchoneta de bobath y balón de estimulación neuro'),
    ('Sala 6', 'DISPONIBLE', 'Espaldar sueco, pesas funcionales, therabands y plataformas de equilibrio')
ON CONFLICT (nombre) DO NOTHING;

-- 7.3. Catálogo de Servicios de Terapia
INSERT INTO public.servicios (nombre, duracion_minutos, precio_base)
VALUES 
    ('Fisioterapia Traumatológica y Deportiva', 45, 85.00),
    ('Terapia Manual Ortopédica y Columna', 45, 95.00),
    ('Rehabilitación Neurológica Especializada', 60, 120.00),
    ('Descarga Muscular y Readaptación Funcional', 45, 90.00)
ON CONFLICT DO NOTHING;

-- 7.4. Personal Inicial (Admin, Recepción y Terapeutas)
INSERT INTO public.users (nombre, email, rol, especialidad, estado)
VALUES 
    ('Marco Antonio', 'gerencia@ajfisioterapia.pe', 'ADMIN', 'Dirección Clínica y Gerencia', 'ACTIVO'),
    ('Ana Ramos', 'recepcion1@ajfisioterapia.pe', 'RECEPCION', 'Admisión y Caja Principal', 'ACTIVO'),
    ('Laura Peña', 'recepcion2@ajfisioterapia.pe', 'RECEPCION', 'Atención al Paciente y Turno Tarde', 'ACTIVO'),
    ('Lic. Carlos Mendoza', 'carlos.mendoza@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Fisioterapia Deportiva y Readaptación', 'ACTIVO'),
    ('Lic. Andrea Rivas', 'andrea.rivas@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Terapia Manual Ortopédica y Columna', 'ACTIVO'),
    ('Lic. Javier Ponce', 'javier.ponce@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Biomecánica y Reeducación Postural', 'ACTIVO'),
    ('Lic. Valeria Soto', 'valeria.soto@ajfisioterapia.pe', 'TERAPEUTA', 'Lic. Neurorehabilitación y Adulto Mayor', 'ACTIVO'),
    ('Tec. Miguel Torres', 'miguel.torres@ajfisioterapia.pe', 'TERAPEUTA', 'Técnico en Agentes Físicos y Electroterapia', 'ACTIVO')
ON CONFLICT (email) DO NOTHING;
