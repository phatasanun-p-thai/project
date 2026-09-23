-- ============================================================================
-- Security hardening — RLS for profiles / machines / alarms + defense-in-depth
-- triggers. Self-contained and idempotent. Role lives in public.profiles.role
-- (admin | technician). Run in Supabase SQL editor or `supabase db push`.
--
-- NOTE: Callers hitting PostgREST directly (bypassing the UI / Server Actions)
-- are still constrained by these policies: SELECT only for authenticated users,
-- writes admin-restricted, technicians limited to their permitted columns.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Role helpers (security definer, locked search_path to prevent hijacking).
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

-- ============================================================================
-- profiles — ผู้ใช้อ่านได้เฉพาะตัวเองหรือข้อมูลช่างเทคนิค;
-- การแก้ไข profile อนุญาตเฉพาะ admin เท่านั้น
-- (ไม่มี INSERT/UPDATE-by-user สำหรับ role/email → ผู้ใช้ escalate เองไม่ได้;
--  record ใหม่เกิดจาก signup trigger ซึ่งต้องเป็น SECURITY DEFINER หรือ service_role)
-- ============================================================================

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_technicians" on public.profiles;
create policy "profiles_select_self_or_technicians"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or role = 'technician');

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

-- ============================================================================
-- machines — อ่านได้ทุก user ในระบบ; เขียน/ลบเฉพาะ admin
-- ============================================================================

alter table public.machines enable row level security;

drop policy if exists "machines_select_authenticated" on public.machines;
create policy "machines_select_authenticated"
  on public.machines
  for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "machines_insert_admin" on public.machines;
create policy "machines_insert_admin"
  on public.machines
  for insert
  to authenticated
  with check (public.app_is_admin());

drop policy if exists "machines_update_admin" on public.machines;
create policy "machines_update_admin"
  on public.machines
  for update
  to authenticated
  using (public.app_is_admin())
  with check (public.app_is_admin());

drop policy if exists "machines_delete_admin" on public.machines;
create policy "machines_delete_admin"
  on public.machines
  for delete
  to authenticated
  using (public.app_is_admin());

-- ============================================================================
-- alarms — อ่านได้ทุก user; สร้าง/ลบเฉพาะ admin;
-- update: admin แก้ได้ทุกคอลัมน์, technician แก้ได้เฉพาะ status (บังคับด้วย trigger)
-- ============================================================================

alter table public.alarms enable row level security;

drop policy if exists "alarms_select_authenticated" on public.alarms;
create policy "alarms_select_authenticated"
  on public.alarms
  for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "alarms_insert_admin" on public.alarms;
create policy "alarms_insert_admin"
  on public.alarms
  for insert
  to authenticated
  with check (public.app_is_admin());

drop policy if exists "alarms_update_admin" on public.alarms;
create policy "alarms_update_admin"
  on public.alarms
  for update
  to authenticated
  using (public.app_is_admin())
  with check (true);

drop policy if exists "alarms_update_technician_status" on public.alarms;
create policy "alarms_update_technician_status"
  on public.alarms
  for update
  to authenticated
  using (public.app_is_technician())
  with check (public.app_is_technician());

drop policy if exists "alarms_delete_admin" on public.alarms;
create policy "alarms_delete_admin"
  on public.alarms
  for delete
  to authenticated
  using (public.app_is_admin());

-- ---------------------------------------------------------------------------
-- Technician may ONLY change status/updated_at on alarms — blocks tampering
-- with machine_id, alarm_code, description, cause, occurred_at via REST.
-- ---------------------------------------------------------------------------
create or replace function public.prevent_alarm_technician_tamper()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.app_is_technician() and not public.app_is_admin() then
    if new.machine_id is distinct from old.machine_id
       or new.alarm_code is distinct from old.alarm_code
       or new.alarm_description is distinct from old.alarm_description
       or new.cause is distinct from old.cause
       or new.occurred_at is distinct from old.occurred_at
       or new.created_at is distinct from old.created_at then
      raise exception 'technician may only update alarm status';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_alarm_technician_tamper on public.alarms;
create trigger trg_prevent_alarm_technician_tamper
  before update on public.alarms
  for each row execute function public.prevent_alarm_technician_tamper();

-- ---------------------------------------------------------------------------
-- Defense-in-depth: technician cannot reassign maintenance_records to another
-- user. (RLS WITH CHECK already enforces this; trigger adds a hard backstop.)
-- ---------------------------------------------------------------------------
create or replace function public.prevent_maintenance_technician_reassign()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.app_is_technician() and not public.app_is_admin()
     and new.technician_id is distinct from old.technician_id then
    raise exception 'technician cannot reassign maintenance record';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_maintenance_technician_reassign on public.maintenance_records;
create trigger trg_prevent_maintenance_technician_reassign
  before update on public.maintenance_records
  for each row execute function public.prevent_maintenance_technician_reassign();