-- ════════════════════════════════════════════════════════════════
--  RUBRO POR DEFECTO  (correr en el SQL Editor de Supabase)
--  El mercado objetivo es estética/belleza: una cuenta nueva NO debe
--  arrancar con historia clínica activada (eso hacía que dijera
--  "Pacientes"). Ahora se activa solo si el rubro elegido es de salud.
-- ════════════════════════════════════════════════════════════════

-- 1) El valor por defecto de la columna pasa a FALSE.
ALTER TABLE organizations ALTER COLUMN clinical_history_enabled SET DEFAULT false;

-- 2) El trigger de alta activa la historia clínica solo para rubros de salud.
--    El campo 'clinical' viene en la metadata del usuario (lo calcula el alta
--    en app/actions/auth.ts según el rubro elegido).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name   TEXT;
  org_slug   TEXT;
  is_clinical BOOLEAN;
  inv        RECORD;
BEGIN
  SELECT * INTO inv FROM invitations
    WHERE lower(email) = lower(NEW.email)
    ORDER BY created_at DESC
    LIMIT 1;

  IF inv.id IS NOT NULL THEN
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (inv.organization_id, NEW.id, inv.role);
    DELETE FROM invitations WHERE lower(email) = lower(NEW.email);
    RETURN NEW;
  END IF;

  org_name := COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mi Negocio');
  org_slug := 'org-' || substr(NEW.id::text, 1, 8);
  -- Solo true si el alta lo marcó explícitamente (rubro de salud).
  is_clinical := COALESCE((NEW.raw_user_meta_data->>'clinical')::boolean, false);

  INSERT INTO organizations (name, slug, owner_id, clinical_history_enabled)
  VALUES (org_name, org_slug, NEW.id, is_clinical)
  RETURNING id INTO new_org_id;

  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
