-- ════════════════════════════════════════════════════════════════
--  BOT DE WHATSAPP (Fase 1)  — correr en el SQL Editor de Supabase
--  Flags para prender/apagar por separado las Confirmaciones (lo que ya
--  existe) y el Bot de respuestas (nuevo), y la config del bot por negocio.
-- ════════════════════════════════════════════════════════════════

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS whatsapp_confirmations_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp_bot_enabled           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_bot_config            JSONB   NOT NULL DEFAULT '{}'::jsonb;
