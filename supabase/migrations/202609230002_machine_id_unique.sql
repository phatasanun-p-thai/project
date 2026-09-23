-- ============================================================================
-- Hardening: unique machine_id + กัน duplicate จากฝั่ง database
-- Run AFTER 202609230001_rls_hardening.sql. Idempotent (รันซ้ำได้).
-- ============================================================================

-- Dedup: merge machines ตัวซ้ำ — ย้ายอ้างอิงจาก alarms/maintenance_records
-- ไปยังเครื่องจักรตัวแรก (created_at, id) ก่อน แล้วลบตัวซ้ำ
with dup as (
  select m2.id as duplicate_id, k.keep_id
  from public.machines m2
  join (
    select machine_id, min(id) as keep_id
    from public.machines
    where machine_id is not null
    group by machine_id
  ) k on k.machine_id = m2.machine_id
  where m2.id <> k.keep_id
)
update public.alarms a
set machine_id = d.keep_id
from dup d
where a.machine_id = d.duplicate_id;

with dup as (
  select m2.id as duplicate_id, k.keep_id
  from public.machines m2
  join (
    select machine_id, min(id) as keep_id
    from public.machines
    where machine_id is not null
    group by machine_id
  ) k on k.machine_id = m2.machine_id
  where m2.id <> k.keep_id
)
update public.maintenance_records mr
set machine_id = d.keep_id
from dup d
where mr.machine_id = d.duplicate_id;

with dup as (
  select m2.id as duplicate_id, k.keep_id
  from public.machines m2
  join (
    select machine_id, min(id) as keep_id
    from public.machines
    where machine_id is not null
    group by machine_id
  ) k on k.machine_id = m2.machine_id
  where m2.id <> k.keep_id
)
delete from public.machines m
using dup d
where m.id = d.duplicate_id;

-- Unique constraint (สร้างถ้ายังไม่มี)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'machines_machine_id_unique'
      and conrelid = 'public.machines'::regclass
  ) then
    begin
      alter table public.machines
        add constraint machines_machine_id_unique unique (machine_id);
    exception when unique_violation then
      raise exception 'machine_id ยังมีรายการซ้ำในตาราง machines — กรุณา merge ข้อมูลก่อน แล้วค่อยรันไฟล์นี้อีกครั้ง';
    end;
  end if;
end $$;