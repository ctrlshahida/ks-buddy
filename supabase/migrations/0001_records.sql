-- ks-buddy activity records, one row per reviewed learning activity.
-- Each row belongs to the signed-in user; row level security enforces this.

create table public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  title text not null default '',
  work text not null check (length(btrim(work)) > 0),
  learn text not null default '',
  hours numeric(5, 2) not null check (hours >= 0 and hours <= 24),
  otj boolean not null default false,
  project text not null default 'Other',
  codes text[] not null default '{}'
    check (codes <@ array['K1','K2','K3','K4','S1','S3','S6','S8','B1','B2']),
  files text[] not null default '{}',
  mapping_reasons jsonb not null default '[]'::jsonb,
  source text,
  created_at timestamptz not null default now()
);

create index records_user_created_idx on public.records (user_id, created_at desc);

alter table public.records enable row level security;

create policy "Users read their own records"
  on public.records for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users add their own records"
  on public.records for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own records"
  on public.records for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own records"
  on public.records for delete to authenticated
  using ((select auth.uid()) = user_id);
