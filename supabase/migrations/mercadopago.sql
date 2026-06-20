-- ════════════════════════════════════════════════════════════════
--  MERCADO PAGO  (correr en el SQL Editor de Supabase)
-- ════════════════════════════════════════════════════════════════

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS mp_preapproval_id TEXT;
NOTIFY pgrst, 'reload schema';
