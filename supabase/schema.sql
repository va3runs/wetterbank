-- The Bench Code: database schema for Supabase (Postgres).
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- The public website can only INSERT votes and motions, and read TOTALS plus APPROVED motions.
-- It can never read, change or delete individual rows.

create extension if not exists pgcrypto;

-- One row per browser session that votes or files a motion.
create table if not exists public.bc_visits (
  session     uuid primary key,
  created_at  timestamptz not null default now(),
  draft       text check (char_length(draft) <= 20),
  lang        text check (lang in ('en', 'de')),
  device      text check (device in ('touch', 'pointer')),
  referrer    text check (char_length(referrer) <= 80),
  source      text check (char_length(source) <= 40),
  is_test     boolean not null default false
);

-- One row per vote. A session can vote on each paragraph once.
create table if not exists public.bc_votes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  session     uuid not null,
  clause      text not null check (clause ~ '^(s[1-9]\.[1-9][0-9]?|p-[0-9a-f]{8})$'),
  vote        text not null check (vote in ('for', 'against', 'abstain')),
  draft       text check (char_length(draft) <= 20),
  lang        text check (lang in ('en', 'de')),
  is_test     boolean not null default false,
  unique (session, clause)
);

-- Motions from the public. Hidden until you set approved = true.
create table if not exists public.bc_motions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  session       uuid not null,
  section       text not null check (section in ('3', '4', '5', '6', '7')),
  body          text not null check (char_length(body) between 8 and 240),
  lang          text check (lang in ('en', 'de')),
  is_test       boolean not null default false,
  approved      boolean not null default false,
  body_en       text check (char_length(body_en) <= 240),   -- optional translation you add when approving
  body_de       text check (char_length(body_de) <= 240)
);

create index if not exists bc_votes_clause_idx on public.bc_votes (clause);
create index if not exists bc_motions_approved_idx on public.bc_motions (approved);

alter table public.bc_visits  enable row level security;
alter table public.bc_votes   enable row level security;
alter table public.bc_motions enable row level security;

drop policy if exists "public can insert visits" on public.bc_visits;
create policy "public can insert visits" on public.bc_visits for insert to anon with check (true);

drop policy if exists "public can insert votes" on public.bc_votes;
create policy "public can insert votes" on public.bc_votes for insert to anon with check (true);

-- The public can file motions, but never approve them or add translations.
drop policy if exists "public can insert motions" on public.bc_motions;
create policy "public can insert motions" on public.bc_motions for insert to anon
  with check (approved = false and body_en is null and body_de is null);

revoke all on public.bc_visits, public.bc_votes, public.bc_motions from anon, authenticated;
grant insert on public.bc_visits, public.bc_votes, public.bc_motions to anon;

-- Totals per paragraph, number of voters, and approved motions. Test sessions excluded.
create or replace function public.bc_tally()
returns json
language sql
security definer
set search_path = public
stable
as $$
  with v as (select * from bc_votes where not is_test)
  select json_build_object(
    'votes',  (select count(*) from v),
    'voters', (select count(distinct session) from v),
    'clauses', coalesce((
      select json_object_agg(clause, json_build_object('for', f, 'against', a, 'abstain', x))
      from (
        select clause,
               count(*) filter (where vote = 'for')     as f,
               count(*) filter (where vote = 'against') as a,
               count(*) filter (where vote = 'abstain') as x
        from v group by clause
      ) t
    ), '{}'::json),
    'motions', coalesce((
      select json_agg(json_build_object(
        'id', 'p-' || left(replace(id::text, '-', ''), 8),
        'section', section, 'body', body, 'lang', lang, 'body_en', body_en, 'body_de', body_de
      ) order by created_at)
      from bc_motions where approved and not is_test
    ), '[]'::json)
  );
$$;

revoke all on function public.bc_tally() from public;
grant execute on function public.bc_tally() to anon;

-- For your own analysis (SQL Editor or CSV export). Not visible to the public.
create or replace view public.bc_flat as
select v.created_at, v.clause, v.vote, v.draft, v.lang, v.is_test,
       s.device, s.referrer, s.source, v.session
from bc_votes v left join bc_visits s on s.session = v.session;

revoke all on public.bc_flat from anon, authenticated;
