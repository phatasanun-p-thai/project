-- ============================================================================
-- Schema — Alarm & Maintenance Management System
-- Creates the base tables. MUST run FIRST (before the RLS migrations).
-- Idempotent. Grants follow Supabase defaults (anon/authenticated/service_role).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles — ผู้ใช้ของระบบ (role: admin | technician)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'technician'
    check (role in ('admin', 'technician')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- machines — Master เครื่องจักร
-- ---------------------------------------------------------------------------
create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  machine_id text not null,
  machine_name text not null,
  machine_type text not null default '',
  location text not null default '',
  status text not null default 'Running'
    check (status in ('Running', 'Stop', 'Alarm', 'Maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- alarms — ประวัติ Alarm ของเครื่องจักร
-- ---------------------------------------------------------------------------
create table if not exists public.alarms (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  alarm_code text not null,
  alarm_description text not null,
  cause text,
  occurred_at timestamptz not null default now(),
  status text not null default 'Open'
    check (status in ('Open', 'In Progress', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alarms_machine_id_idx on public.alarms(machine_id);
create index if not exists alarms_occurred_at_idx on public.alarms(occurred_at desc);

-- ---------------------------------------------------------------------------
-- maintenance_records — งานซ่อมบำรุง
-- ---------------------------------------------------------------------------
create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  maintenance_type text not null,
  problem text not null,
  action_taken text not null,
  technician_id uuid references public.profiles(id) on delete set null,
  date date not null,
  status text not null default 'Scheduled'
    check (status in ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists maintenance_records_machine_id_idx
  on public.maintenance_records(machine_id);
create index if not exists maintenance_records_technician_id_idx
  on public.maintenance_records(technician_id);
create index if not exists maintenance_records_date_idx
  on public.maintenance_records(date desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger (ทุกตาราง)
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_machines_updated_at on public.machines;
create trigger trg_machines_updated_at
  before update on public.machines
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_alarms_updated_at on public.alarms;
create trigger trg_alarms_updated_at
  before update on public.alarms
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_maintenance_updated_at on public.maintenance_records;
create trigger trg_maintenance_updated_at
  before update on public.maintenance_records
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- signup trigger — สร้าง profile ให้ผู้ใช้ใหม่อัตโนมัติ (role = technician)
-- ไม่มีใคร escalate เป็น admin ตัวเองได้ (role เปลี่ยนได้แค่ admin ผ่าน RLS)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'technician'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Grants — ตาม default privilege ของ Supabase แต่ระบุชัดเพื่อกันพลาด
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant all on table public.profiles to anon, authenticated, service_role;
grant all on table public.machines to anon, authenticated, service_role;
grant all on table public.alarms to anon, authenticated, service_role;
grant all on table public.maintenance_records to anon, authenticated, service_role;