-- ============================================================================
-- Hardening: unique machine_id + กัน duplicate จากฝั่ง database
-- Run AFTER 202609230001_rls_hardening.sql. Idempotent (รันซ้ำได้).
-- ============================================================================

-- Dedup: merge machines ตัวซ้ำ — ย้ายอ้างอิงจาก alarms/maintenance_records
-- ไปยังเครื่องจักรตัวแรก (created_at, id) ก่อน แล้วลบตัวซ้ำ
with ranked as (
  select
    id,
    machine_id,
    row_number() over (
      partition by machine_id
      order by created_at asc, id asc
    ) as rn
  from public.machines
  where machine_id is not null
),
dups as (
  select r.id as dup_id, k.id as keep_id
  from ranked r
  join machines k on k.machine_id = r.machine_id
  where r.rn > 1
    and k.id = (
      select id from ranked rk
      where rk.machine_id = r.machine_id and rk.rn = 1
      limit 1
    )
)
update public.alarms a
set machine_id = d.keep_id
from dups d
where a.machine_id = d.dup_id;

with ranked as (
  select
    id,
    machine_id,
    row_number() over (
      partition by machine_id
      order by created_at asc, id asc
    ) as rn
  from public.machines
  where machine_id is not null
),
dups as (
  select r.id as dup_id, k.id as keep_id
  from ranked r
  join machines k on k.machine_id = r.machine_id
  where r.rn > 1
    and k.id = (
      select id from ranked rk
      where rk.machine_id = r.machine_id and rk.rn = 1
      limit 1
    )
)
update public.maintenance_records mr
set machine_id = d.keep_id
from dups d
where mr.machine_id = d.dup_id;

with ranked as (
  select
    id,
    machine_id,
    row_number() over (
      partition by machine_id
      order by created_at asc, id asc
    ) as rn
  from public.machines
  where machine_id is not null
)
delete from public.machines m
where m.id in (
  select id from ranked where rn > 1
);

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