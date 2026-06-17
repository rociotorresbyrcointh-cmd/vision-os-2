-- ════════════════════════════════════════════════════════════════
--  ROLES Y EQUIPO  (correr completo en el SQL Editor de Supabase)
-- ════════════════════════════════════════════════════════════════

-- 1) Tabla de invitaciones pendientes
CREATE TABLE IF NOT EXISTS invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'staff'
                    CHECK (role IN ('owner','admin','staff','readonly')),
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inv_org ON invitations;
CREATE POLICY inv_org ON invitations
  FOR ALL
  USING (organization_id = get_user_organization_id())
  WITH CHECK (organization_id = get_user_organization_id());

-- 2) Que cualquier miembro pueda LEER su organización (no solo el dueño)
DROP POLICY IF EXISTS members_see_org ON organizations;
CREATE POLICY members_see_org ON organizations
  FOR SELECT USING (id = get_user_organization_id());

-- 3) Que el DUEÑO pueda gestionar (cambiar rol / quitar) a los miembros de su org
DROP POLICY IF EXISTS members_owner_manage ON organization_members;
CREATE POLICY members_owner_manage ON organization_members
  FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND (SELECT owner_id FROM organizations WHERE id = organization_id) = auth.uid()
  );

-- 4) Listar miembros con su email (auth.users no es accesible directo desde el cliente)
CREATE OR REPLACE FUNCTION list_org_members()
RETURNS TABLE(user_id UUID, email TEXT, role TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT m.user_id, u.email::TEXT, m.role, m.created_at
  FROM organization_members m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.organization_id = get_user_organization_id()
  ORDER BY m.created_at;
$$;

-- 5) Al registrarse un usuario: si tiene invitación pendiente, se une a ESA
--    organización con el rol invitado. Si no, crea su propio negocio (flujo normal).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name   TEXT;
  org_slug   TEXT;
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

  INSERT INTO organizations (name, slug, owner_id)
  VALUES (org_name, org_slug, NEW.id)
  RETURNING id INTO new_org_id;

  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
