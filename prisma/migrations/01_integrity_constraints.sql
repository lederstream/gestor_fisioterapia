-- ==============================================================================
-- KineFlow Core - Migración de Integridad Avanzada para PostgreSQL
-- AJ Fisioterapia (San Borja)
-- ==============================================================================

-- 1. Restricción de Integridad Clínica: Escala EVA entre 0 y 10
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_eva_inicio_valido'
  ) THEN
    ALTER TABLE "historia_evolucion"
      ADD CONSTRAINT "chk_eva_inicio_valido" CHECK ("eva_dolor_inicio" >= 0 AND "eva_dolor_inicio" <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_eva_fin_valido'
  ) THEN
    ALTER TABLE "historia_evolucion"
      ADD CONSTRAINT "chk_eva_fin_valido" CHECK ("eva_dolor_fin" >= 0 AND "eva_dolor_fin" <= 10);
  END IF;
END $$;

-- 2. Restricción de Integridad de Filiación: DNI peruano de 8 dígitos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_dni_peruano'
  ) THEN
    ALTER TABLE "pacientes"
      ADD CONSTRAINT "chk_dni_peruano" CHECK (length("dni") = 8);
  END IF;
END $$;

-- 3. Índice Único Parcial para Vouchers de Pago (Anti-duplicidad Yape / Plin / POS)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_pagos_numero_operacion_unique"
  ON "pagos" ("numero_operacion")
  WHERE "numero_operacion" IS NOT NULL AND "numero_operacion" != '';

-- 4. Extensión btree_gist para exclusión de solapamiento horario en PostgreSQL
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_no_solapamiento_sala'
  ) THEN
    ALTER TABLE "citas"
      ADD CONSTRAINT "chk_no_solapamiento_sala"
      EXCLUDE USING gist (
        "sala_id" WITH =,
        tstzrange("fecha_hora_inicio", "fecha_hora_fin") WITH &&
      )
      WHERE ("estado" != 'CANCELADA');
  END IF;
END $$;
