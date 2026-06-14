-- ════════════════════════════════════════════════════════════════
--  VISION OS 2.0 — Esquema completo
--  Pegar todo este archivo en: Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

-- Extensión necesaria para la constraint de no-solapamiento (EXCLUDE … gist)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ─── ORGANIZATIONS ───────────────────────────────────────────────
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id),
  plan        TEXT DEFAULT 'trial',
  timezone    TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── ORGANIZATION MEMBERS (usuarios ↔ organizaciones) ─────────────
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  role            TEXT NOT NULL DEFAULT 'staff'
                    CHECK (role IN ('owner','admin','staff','readonly')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ─── BRANCHES (sucursales) ────────────────────────────────────────
CREATE TABLE branches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT,
  phone           TEXT,
  hours_start     TIME DEFAULT '09:00',
  hours_end       TIME DEFAULT '20:00',
  days_of_week    INT[] DEFAULT '{1,2,3,4,5}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── PROFESSIONALS ────────────────────────────────────────────────
CREATE TABLE professionals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id       UUID REFERENCES branches(id),
  name            TEXT NOT NULL,
  specialty       TEXT,
  color           TEXT DEFAULT '#ec4899',
  hours_start     TIME DEFAULT '09:00',
  hours_end       TIME DEFAULT '18:00',
  days_of_week    INT[] DEFAULT '{1,2,3,4,5}',
  max_capacity_per_hour INT DEFAULT 1,
  is_resource     BOOLEAN DEFAULT false,   -- true = cabina/sala, false = persona
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── SERVICES ─────────────────────────────────────────────────────
CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  price           NUMERIC(10,2) DEFAULT 0,
  description     TEXT,
  color           TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── PATIENTS ─────────────────────────────────────────────────────
CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  email           TEXT,
  date_of_birth   DATE,
  gender          TEXT,
  health_insurance TEXT,
  membership_number TEXT,
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── APPOINTMENTS ─────────────────────────────────────────────────
CREATE TABLE appointments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id           UUID REFERENCES branches(id),
  professional_id     UUID NOT NULL REFERENCES professionals(id),
  service_id          UUID NOT NULL REFERENCES services(id),
  patient_id          UUID REFERENCES patients(id),
  client_name         TEXT NOT NULL,
  client_phone        TEXT,
  client_email        TEXT,
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  capacity_consumed   INT DEFAULT 1,
  recurrence_group_id UUID,
  recurrence_rule     JSONB,
  notes               TEXT,
  source              TEXT DEFAULT 'admin' CHECK (source IN ('admin','public','whatsapp')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Constraint de integridad: impide dos turnos solapados del mismo profesional.
-- Solo aplica a turnos que consumen capacidad 1 en recursos de capacidad 1;
-- para cabinas con capacidad > 1 se valida en la capa de negocio.
-- (Se aplica como índice parcial sobre turnos no cancelados.)
ALTER TABLE appointments
  ADD CONSTRAINT no_overlap_per_professional
  EXCLUDE USING gist (
    professional_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status <> 'cancelled' AND capacity_consumed = 1);

-- ─── BLOCKED TIMES ────────────────────────────────────────────────
CREATE TABLE blocked_times (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id       UUID REFERENCES branches(id),
  professional_id UUID REFERENCES professionals(id),
  title           TEXT NOT NULL,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  recurring_rule  JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════
--  ÍNDICES
-- ════════════════════════════════════════════════════════════════
CREATE INDEX idx_appointments_professional_time
  ON appointments(professional_id, start_time, end_time);
CREATE INDEX idx_appointments_organization_time
  ON appointments(organization_id, start_time);
CREATE INDEX idx_appointments_patient
  ON appointments(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_blocked_times_professional_time
  ON blocked_times(professional_id, start_time, end_time);
CREATE INDEX idx_professionals_organization
  ON professionals(organization_id) WHERE is_active = true;
CREATE INDEX idx_services_organization
  ON services(organization_id) WHERE is_active = true;
CREATE INDEX idx_patients_organization
  ON patients(organization_id);

-- ════════════════════════════════════════════════════════════════
--  HELPER: organization_id del usuario autenticado
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════
ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches             ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times        ENABLE ROW LEVEL SECURITY;

-- Aislamiento por organización en todas las tablas operativas
CREATE POLICY org_isolation ON branches
  FOR ALL USING (organization_id = get_user_organization_id());
CREATE POLICY org_isolation ON professionals
  FOR ALL USING (organization_id = get_user_organization_id());
CREATE POLICY org_isolation ON services
  FOR ALL USING (organization_id = get_user_organization_id());
CREATE POLICY org_isolation ON patients
  FOR ALL USING (organization_id = get_user_organization_id());
CREATE POLICY org_isolation ON appointments
  FOR ALL USING (organization_id = get_user_organization_id());
CREATE POLICY org_isolation ON blocked_times
  FOR ALL USING (organization_id = get_user_organization_id());

-- El dueño ve/gestiona su organización
CREATE POLICY owner_access ON organizations
  FOR ALL USING (owner_id = auth.uid());

-- Cada usuario ve sus propias membresías
CREATE POLICY members_see_own ON organization_members
  FOR SELECT USING (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════
--  TRIGGER: al registrarse un usuario, crear su organización + membresía
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_name   TEXT;
  org_slug   TEXT;
BEGIN
  org_name := COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mi Negocio');
  -- slug único basado en el id del usuario
  org_slug := 'org-' || substr(NEW.id::text, 1, 8);

  INSERT INTO organizations (name, slug, owner_id)
  VALUES (org_name, org_slug, NEW.id)
  RETURNING id INTO new_org_id;

  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ════════════════════════════════════════════════════════════════
--  FIN DEL ESQUEMA
-- ════════════════════════════════════════════════════════════════
