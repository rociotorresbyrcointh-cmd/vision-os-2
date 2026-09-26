-- ════════════════════════════════════════════════════════════════
--  LÍMITE DE PROFESIONALES POR PLAN (candado en la base de datos)
--  Pegar todo esto en: Supabase → SQL Editor → New query → Run
--  Impide crear más profesionales de los que permite el plan, aun
--  saltándose la app. Debe coincidir con lib/plans.ts.
--    inicial = 1 · equipo = 4 · clinica/Premium = 10
--    cortesía = sin límite · prueba (trial) = 5
-- ════════════════════════════════════════════════════════════════

create or replace function enforce_prof_limit()
returns trigger
language plpgsql
security definer
as $$
declare
  v_plan text;
  v_max  int;
  v_cnt  int;
begin
  select o.plan into v_plan from organizations o where o.id = NEW.organization_id;

  v_max := case
    when v_plan = 'inicial'  then 1
    when v_plan = 'equipo'   then 4
    when v_plan = 'clinica'  then 10
    when v_plan = 'cortesia' then 1000000   -- sin límite práctico
    else 5                                   -- prueba / sin plan (TRIAL_MAX_PROF)
  end;

  select count(*) into v_cnt
  from professionals p
  where p.organization_id = NEW.organization_id
    and coalesce(p.is_active, true) = true;

  if v_cnt >= v_max then
    raise exception 'LIMITE_PROFESIONALES: tu plan (%) permite hasta % profesionales', coalesce(v_plan, 'prueba'), v_max
      using errcode = 'P0001';
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_enforce_prof_limit on professionals;
create trigger trg_enforce_prof_limit
  before insert on professionals
  for each row execute function enforce_prof_limit();
