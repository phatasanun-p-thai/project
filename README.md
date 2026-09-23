# Alarm & Maintenance Management System

ระบบจัดการข้อมูลเครื่องจักร Alarm และ Maintenance สำหรับระบบ Automation

## Project

Web Application สำหรับบันทึก ติดตาม และจัดการข้อมูล Master เครื่องจักร,
Alarm ที่เกิดจากเครื่องจักร และงานซ่อมบำรุง (Maintenance) โดยแบ่งสิทธิ์ผู้ใช้เป็น
Admin และ Technician — สร้างด้วย **Next.js 15 + Supabase (PostgreSQL)**

## Objective

- เป็นระบบกลางสำหรับเก็บประวัติเครื่องจักร / Alarm / งานบำรุงรักษา ใช้ทดแทนการจดบันทึกกระดาษ
- ติดตามสถานะเครื่องจักร (Running / Stop / Alarm / Maintenance) แบบเรียลไทม์ผ่าน Dashboard
- ควบคุมสิทธิ์การเข้าถึงตามบทบาท (Admin จัดการได้ทั้งหมด, Technician ดูและอัปเดตเฉพาะที่ได้รับมอบหมาย)
- บังคับความปลอดภัยด้วย **Row Level Security (RLS)** ของ Supabase หลายชั้น
(RBAC ฝั่ง Server Action + RLS ฝั่งฐานข้อมูล + Trigger กันการปลอมแปลง)

## Features

- **Authentication**: Login / Logout / Session (secure cookie) / Role-based (Admin, Technician)
- **Machines**: Create / Read / Update / Delete / Search / Filter / ตรวจป้องกันรหัสเครื่องจักรซ้ำ (unique `machine_id`)
- **Alarms**: Create / Read / Update / Delete / เปลี่ยนสถานะ (Open, In Progress, Closed) / Search / Filter (เครื่อง, รหัส, สถานะ, ช่วงวันที่)
- **Maintenance**: Create / Read / Update / Delete / ผูกช่างเทคนิค (Tech แก้ได้เฉพาะของตัวเอง) / สถานะ / Search / Filter
- **Dashboard**: จำนวนเครื่องจักร, สถานะ Running/Stop/Alarm/Maintenance, จำนวน Alarm, จำนวนงาน Maintenance, กราฟ Donut 3 ชุด
- **Validation**: required fields, format ตรวจสอบด้วย Zod, error message ภาษาไทย (field-level)
- **Security**: RBAC ทุก Server Action, RLS + trigger ใน Supabase, Protected Routes, หน้า `/forbidden`, security headers

## Technology

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4 |
| ฐานข้อมูล | Supabase (PostgreSQL + PostgREST) |
| Auth | Supabase Auth (@supabase/ssr, email/password) |
| Validation | Zod |
| ทดสอบ | Vitest |
| CI/CD | GitHub Actions, Vercel |

## Database

Schema หลัก (อยู่ใน Supabase project) — ดู type ได้ที่ `types/database.ts`:

- `profiles` — ผู้ใช้ + บทบาท (`admin` / `technician`)
- `machines` — Master เครื่องจักร (`machine_id` unique, `status`)
- `alarms` — ประวัติ Alarm (`machine_id` FK → machines, `status`)
- `maintenance_records` — งานบำรุงรักษา (`machine_id` FK, `technician_id` FK → profiles)

Migrations (ต้องรันใน Supabase ตามลำดับ):

| ไฟล์ | รายละเอียด |
|---|---|
| `supabase/migrations/202609230000_schema.sql` | สร้างตาราง (profiles/machines/alarms/maintenance_records) + triggers + signup trigger |
| `supabase/migrations/202609230000_maintenance_rls.sql` | RLS สำหรับ maintenance_records + helper functions |
| `supabase/migrations/202609230001_rls_hardening.sql` | RLS profiles/machines/alarms + trigger ป้องกันการปลอมแปลง |
| `supabase/migrations/202609230002_machine_id_unique.sql` | Dedup + unique constraint บน `machine_id` |

## Installation

```bash
# 1. clone repo
git clone https://github.com/phatasanun-p-thai/project.git
cd project

# 2. ติดตั้ง dependencies
npm install

# 3. สร้างไฟล์ env จากตัวอย่าง
cp .env.example .env.local
# แล้วใส่ค่า REAL จาก Supabase Dashboard:
#   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

# 4. รัน migrations ใน Supabase SQL Editor (เรียงตามตารางด้านบน)
```

## Usage

```bash
npm run dev      # dev server: http://localhost:3000
npm run build    # production build
npm run start    # run production build
npm run typecheck
npm run lint     # eslint .
npm run test     # vitest run
```

1. ล็อกอินด้วยบัญชีที่สร้างใน Supabase Auth (อีเมล/รหัสผ่าน)
2. **Admin**: จัดการเครื่องจักร + Alarm + Maintenance ได้ทั้งหมด, กำหนดช่างเทคนิคให้งาน
3. **Technician**: ดูข้อมูลทั้งหมด, สร้าง/แก้ไขงานที่ตัวเองได้รับมอบหมาย, เปลี่ยนสถานะ Alarm ได้ (โดย RLS+trigger จำกัดเฉพาะคอลัมน์ที่อนุญาต)
4. Dashboard แสดงตัวเลขและกราฟจากข้อมูลจริง โดยอัปเดตเมื่อมีการเพิ่ม/แก้ไข

## Vercel URL

- Production: <https://contorller.vercel.app>
- Deployment ล่าสุด: <https://contorller-z7ub3n8fh-phatasanun-p-1708.vercel.app>

## AI Usage

- พัฒนาโดยใช้ AI coding assistant (opencode) ช่วยสร้าง feature หลัก
  (Dashboard, Alarms, Maintenance, Machines, Auth) และตรวจสอบคุณภาพ/ความปลอดภัย
- AI ใช้ในการ: สร้างโค้ดตาม requirement, เขียน RLS migrations + security hardening,
  เขียน unit tests (Vitest), ตั้ง CI workflow (GitHub Actions), เตรียมเอกสาร (README, DEPLOYMENT.md)
- ตรวจสอบแล้วภายหลังโดยทีมงาน: typecheck / lint / test / build ผ่าน, ไม่มี secret หลุดขึ้น repository