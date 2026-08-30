-- DIAGNÓSTICO temporal: guarda TODO lo que Meta manda al webhook, crudo.
-- Sirve para ver si Meta entrega los mensajes y con qué formato.
-- Se puede borrar después con: drop table public.bot_webhook_log;
create table if not exists public.bot_webhook_log (
  id           bigserial primary key,
  recibido_en  timestamptz not null default now(),
  cuerpo       jsonb
);
alter table public.bot_webhook_log enable row level security;
