-- ════════════════════════════════════════════════════════════════
--  STRIPE / SUSCRIPCIONES  (correr en el SQL Editor de Supabase)
-- ════════════════════════════════════════════════════════════════

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_status            TEXT;

-- (el plan se guarda en la columna 'plan' que ya existe)
NOTIFY pgrst, 'reload schema';
