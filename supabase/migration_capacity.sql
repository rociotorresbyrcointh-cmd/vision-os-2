-- ════════════════════════════════════════════════════════════════
--  Migración: capacidad por hora correcta
--  Bloquea solapamientos solo para personas; permite cabinas/recursos.
-- ════════════════════════════════════════════════════════════════

-- 1. Quitar la constraint anterior
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS no_overlap_per_professional;

-- 2. Columna que indica si el turno debe bloquear solapamientos
--    (true = persona de capacidad 1; false = recurso/cabina)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS blocks_overlap BOOLEAN NOT NULL DEFAULT true;

-- 3. Nueva constraint: solo aplica a turnos que bloquean solapamiento
ALTER TABLE appointments
  ADD CONSTRAINT no_overlap_per_professional
  EXCLUDE USING gist (
    professional_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status <> 'cancelled' AND blocks_overlap = true);
