-- ════════════════════════════════════════════════════════════════
--  BOT DE WHATSAPP (Fase 2)  — correr en el SQL Editor de Supabase
--  Conexiones de WhatsApp por negocio + memoria de conversaciones.
--  Solo el servidor (service-role) entra acá; RLS bloquea todo lo demás
--  (son datos privados: tokens y charlas de clientas).
-- ════════════════════════════════════════════════════════════════

-- Un número de WhatsApp conectado (uno o más por organización).
-- Se identifica por phone_number_id, que es lo que Meta manda en cada webhook.
create table if not exists public.whatsapp_conexiones (
  phone_number_id   text primary key,
  organization_id   uuid not null references organizations(id) on delete cascade,
  display_number    text,                 -- el número legible, para mostrar
  access_token      text not null,        -- token de esa cuenta (per-tenant)
  waba_id           text,
  verificado        boolean not null default false,
  creado_en         timestamptz not null default now()
);
create index if not exists whatsapp_conexiones_org_idx
  on public.whatsapp_conexiones (organization_id);
alter table public.whatsapp_conexiones enable row level security;

-- Memoria del bot, separada por organización (dos salones pueden tener
-- clientas con el mismo teléfono sin cruzarse).
create table if not exists public.conversaciones_bot (
  organization_id    uuid not null references organizations(id) on delete cascade,
  telefono           text not null,
  -- [{ "papel": "usuario" | "asistente", "texto": "..." }]
  turnos             jsonb not null default '[]'::jsonb,
  ultimo_mensaje_id  text,
  actualizado_en     timestamptz not null default now(),
  primary key (organization_id, telefono)
);
create index if not exists conversaciones_bot_actualizado_idx
  on public.conversaciones_bot (actualizado_en);
alter table public.conversaciones_bot enable row level security;
