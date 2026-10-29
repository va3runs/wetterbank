-- Wetterbank research site: database schema for Supabase (Postgres).
-- Run this once in Supabase → SQL Editor → New query → paste → Run.
-- Design: the public website can only INSERT rows and read AGGREGATE numbers.
-- It can never read, change or delete individual responses.

create extension if not exists pgcrypto;

-- One row when someone sits down (only with consent).
create table if not exists public.wb_sessions (
  id            uuid primary key,
  created_at    timestamptz not null default now(),
  study_version text check (char_length(study_version) <= 40),
  lang          text check (lang in ('en', 'de')),
  bench         text not null check (bench in ('silent', 'weather', 'complaints', 'names', 'morethanhuman')),
  stranger      text not null check (stranger in ('shopper', 'student', 'dog')),
  repeat_visit  boolean not null default false,
  device        text check (device in ('touch', 'pointer')),
  referrer      text check (char_length(referrer) <= 80),
  source        text check (char_length(source) <= 40),
  is_test       boolean not null default false
);

-- One row when the encounter and questions are finished.
create table if not exists public.wb_results (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null unique references public.wb_sessions(id) on delete cascade,
  created_at   timestamptz not null default now(),
  outcome      jsonb not null check (jsonb_typeof(outcome) = 'object' and pg_column_size(outcome) < 2000),
  events       jsonb not null check (jsonb_typeof(events) = 'array' and pg_column_size(events) < 16000),
  survey       jsonb not null check (jsonb_typeof(survey) = 'object' and pg_column_size(survey) < 4000),
  open_text    text check (char_length(open_text) <= 1000),
  duration_ms  integer check (duration_ms between 0 and 7200000)
);

create index if not exists wb_sessions_created_idx on public.wb_sessions (created_at);
create index if not exists wb_results_session_idx on public.wb_results (session_id);

-- Row level security: the public (anon) role may insert, nothing else.
alter table public.wb_sessions enable row level security;
alter table public.wb_results  enable row level security;

drop policy if exists "public can insert sessions" on public.wb_sessions;
create policy "public can insert sessions" on public.wb_sessions
  for insert to anon with check (true);

drop policy if exists "public can insert results" on public.wb_results;
create policy "public can insert results" on public.wb_results
  for insert to anon with check (true);

revoke all on public.wb_sessions from anon, authenticated;
revoke all on public.wb_results  from anon, authenticated;
grant insert on public.wb_sessions to anon;
grant insert on public.wb_results  to anon;

-- Aggregate numbers for the live results. Test sessions are excluded.
create or replace function public.wb_stats()
returns json
language sql
security definer
set search_path = public
stable
as $$
  with done as (
    select s.bench, r.outcome, r.survey
    from wb_results r
    join wb_sessions s on s.id = r.session_id
    where not s.is_test
  )
  select json_build_object(
    'total', (select count(*) from done),
    'benches', coalesce((
      select json_agg(b order by b.bench) from (
        select
          bench,
          count(*) as n,
          100.0 * avg(case when outcome->>'result' in ('talked', 'names') then 1 else 0 end) as talked_pct,
          100.0 * avg(case when outcome->>'result' = 'names' then 1 else 0 end) as names_pct,
          100.0 * avg(case when outcome->>'result' = 'bench' then 1 else 0 end) as bench_only_pct,
          avg((survey->>'easier')::numeric) as easier_avg,
          avg((survey->>'intrusive')::numeric) as intrusive_avg,
          avg((survey->>'want')::numeric) as want_avg
        from done
        group by bench
      ) b
    ), '[]'::json)
  );
$$;

revoke all on function public.wb_stats() from public;
grant execute on function public.wb_stats() to anon;

-- A flat view for your own analysis (SQL Editor or CSV export). Not visible to the public.
create or replace view public.wb_flat as
select
  s.created_at, s.study_version, s.lang, s.bench, s.stranger, s.repeat_visit, s.device, s.referrer, s.source, s.is_test,
  r.created_at is not null                   as finished,
  r.outcome->>'result'                       as result,
  r.outcome->>'names_via'                    as names_via,
  r.outcome->'first_contact'->>'via'         as first_contact_via,
  (r.outcome->'first_contact'->>'beat')::int as first_contact_moment,
  (r.outcome->>'bench_refused')::boolean     as bench_refused,
  (r.outcome->>'to_stranger')::int           as to_stranger,
  (r.outcome->>'to_bench')::int              as to_bench,
  (r.outcome->>'phone')::int                 as phone,
  r.survey->>'who'                           as who,
  r.survey->>'credit'                        as credit,
  (r.survey->>'easier')::int                 as easier,
  (r.survey->>'intrusive')::int              as intrusive,
  (r.survey->>'want')::int                   as want,
  (r.survey->>'felt_real')::int              as felt_real,
  r.survey->>'real'                          as real_life,
  r.survey->>'age'                           as age,
  r.survey->>'germany'                       as lives_in_germany,
  r.survey->>'german'                        as german_first_language,
  r.open_text,
  r.duration_ms,
  r.events,
  left(s.id::text, 8)                        as participation_code
from wb_sessions s
left join wb_results r on r.session_id = s.id;

revoke all on public.wb_flat from anon, authenticated;
