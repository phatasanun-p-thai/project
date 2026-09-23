-- ============================================================================
-- Maintenance Management — RLS for maintenance_records
-- Run this in the Supabase SQL editor / via `supabase db push`.
-- Roles live in public.profiles.role (admin | technician).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper functions (security definer) — wrap role checks so policies stay simple.
-- search_path locked to prevent search-path hijacking.
-- ---------------------------------------------------------------------------

create or replace function public.app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.app_is_technician()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'technician'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles: the app renders technician names and admins pick a technician, so
-- every authenticated user may read profiles — but only themselves or users
-- with role = 'technician' (email/name are already user-facing in the app).
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_self_or_technicians" on public.profiles;
create policy "profiles_select_self_or_technicians"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or role = 'technician');

-- ---------------------------------------------------------------------------
-- maintenance_records
-- ---------------------------------------------------------------------------

alter table public.maintenance_records enable row level security;

drop policy if exists "maintenance_select_authenticated" on public.maintenance_records;
create policy "maintenance_select_authenticated"
  on public.maintenance_records
  for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid())
  );

-- Insert: admin may assign any technician; technician may only insert a record
-- that is assigned to their own auth.uid() — frontend cannot spoof another
-- user's technician_id.
drop policy if exists "maintenance_insert_admin" on public.maintenance_records;
create policy "maintenance_insert_admin"
  on public.maintenance_records
  for insert
  to authenticated
  with check (public.app_is_admin());

drop policy if exists "maintenance_insert_technician_self" on public.maintenance_records;
create policy "maintenance_insert_technician_self"
  on public.maintenance_records
  for insert
  to authenticated
  with check (
    public.app_is_technician()
    and technician_id = auth.uid()
  );

-- Update: admin may update any row (including reassigning technician).
-- For technician the policy's USING restricts to rows they own; the default
-- WITH CHECK (= USING) also blocks reassigning technician_id to anyone else.
drop policy if exists "maintenance_update_admin" on public.maintenance_records;
create policy "maintenance_update_admin"
  on public.maintenance_records
  for update
  to authenticated
  using (public.app_is_admin())
  with check (true);

drop policy if exists "maintenance_update_own_technician" on public.maintenance_records;
create policy "maintenance_update_own_technician"
  on public.maintenance_records
  for update
  to authenticated
  using (public.app_is_technician() and technician_id = auth.uid());

-- Delete: admin only.
drop policy if exists "maintenance_delete_admin" on public.maintenance_records;
create policy "maintenance_delete_admin"
  on public.maintenance_records
  for delete
  to authenticated
  using (public.app_is_admin());