-- ════════════════════════════════════════════════════════════════
--  SEÑA / RESERVA CON SEÑA  (correr en el SQL Editor de Supabase)
-- ════════════════════════════════════════════════════════════════

-- 1) Columnas de seña en la organización
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deposit_enabled  BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deposit_amount   NUMERIC;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deposit_currency TEXT DEFAULT 'ARS';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deposit_link     TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deposit_note     TEXT;

-- 2) Que el portal de reservas devuelva la info de seña (si está activada)
DROP FUNCTION IF EXISTS public_booking_info(uuid);
CREATE OR REPLACE FUNCTION public_booking_info(p_org uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT CASE WHEN o.public_booking_enabled THEN jsonb_build_object(
    'name', o.name,
    'logo', o.logo_url,
    'enabled', true,
    'deposit', CASE WHEN o.deposit_enabled AND o.deposit_amount IS NOT NULL THEN jsonb_build_object(
      'amount', o.deposit_amount,
      'currency', COALESCE(o.deposit_currency, 'ARS'),
      'link', o.deposit_link,
      'note', o.deposit_note
    ) ELSE NULL END,
    'services', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'duration_minutes', s.duration_minutes, 'price', s.price) ORDER BY s.created_at) FROM services s WHERE s.organization_id = p_org AND s.is_active), '[]'::jsonb),
    'professionals', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', pr.id, 'name', pr.name, 'color', pr.color, 'days_of_week', pr.days_of_week, 'hours_start', pr.hours_start, 'hours_end', pr.hours_end) ORDER BY pr.created_at) FROM professionals pr WHERE pr.organization_id = p_org AND pr.is_active), '[]'::jsonb)
  ) ELSE jsonb_build_object('enabled', false) END
  FROM organizations o WHERE o.id = p_org;
$$;
