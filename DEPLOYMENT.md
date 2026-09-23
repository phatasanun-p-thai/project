# Deployment Checklist — Vercel (Next.js + Supabase)

## 1. Pre-deploy review (ผลการตรวจสอบ)

| รายการ | สถานะ | หมายเหตุ |
|---|---|---|
| `package.json` | ✅ OK | `private: true`, Scripts: dev / build / start / lint / typecheck |
| Build script | ✅ OK | `next build` — build ผ่านในเครื่อง (9 routes) |
| Node.js version | ✅ OK | `engines: ">=20 <23"` — Vercel auto-select |
| Environment Variables | ⚠️ ต้องตั้งใน Vercel | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase URL | ⚠️ ต้องตั้ง | ใส่ค่าโปรเจกต์จริง (`.env.example` เป็น placeholder) |
| Supabase Anon Key | ⚠️ ต้องตั้ง | ใช้เฉพาะ anon key — **ห้าม** ใช้ service_role |
| Authentication Redirect | ⚠️ ตั้งใน Supabase Dashboard | Site URL = Production URL (ไม่มี OAuth callback ในแอปนี้) |
| Production URL | ℹ️ | ได้จาก Vercel (แบบ auto `xxx.vercel.app` หรือ custom domain) |
| GitHub Integration | ✅ OK | Git repo + `origin` ชี้ไป GitHub แล้ว, CI workflow พร้อม |
| RLS / Migrations | ⚠️ ต้องรันใน Supabase | `supabase/migrations/*.sql` (2 ไฟล์) ก่อนใช้งาน |
| Secrets ใน Source Code | ✅ OK | ไม่มี `.env*`/service_role ขึ้น repo (`.gitignore` ครอบแล้ว) |

## 2. ขั้นตอน Deployment

### ขั้นตอนที่ 1 — Push GitHub
```bash
git status                # ไม่มีไฟล์ขี้เปล่า / secret
git add -A
git commit -m "chore: prepare for deploy"
git push origin main
```
- CI (`/actions`) ต้องเขียว: Typecheck ✅ → Lint ✅ → Build ✅

### ขั้นตอนที่ 2 — Import Project เข้า Vercel
1. ไปที่ https://vercel.com/new
2. กด **Import Git Repository** → เลือก `phatasanun-p-thai/project`
3. Framework Preset: **Next.js** (Vercel detect อัตโนมัติ)
4. Root Directory: `/` , Build Command: `next build` (ค่า default)
5. กด **Deploy** ครั้งแรกได้เลย (ยังไม่ต้องตั้ง env → build ผ่าน แต่ runtime ต้องใช้ env)

### ขั้นตอนที่ 3 — ตั้ง Environment Variables
- Vercel → Project → **Settings → Environment Variables**
- เพิ่ม 2 ตัว (Production / Preview / Development):
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://<ref>.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<anon key จาก Supabase Dashboard>`
- **ห้าม** ใส่ `SUPABASE_SERVICE_ROLE_KEY` หรือ secrets อื่นลง Vercel/กิต config

### ขั้นตอนที่ 4 — Deploy
- Redeploy: Project → **Deployments** → `...` → **Redeploy**
- หรือ push commit ใหม่ (auto-deploy สำหรับ branch ที่ตั้งไว้)

### ขั้นตอนที่ 5 — ตรวจสอบ Build
- ไปที่ **Deployments** → รอ status **Ready** (เขียว)
- ดู Build Logs: ต้องขึ้น `✓ Generating static pages (9/9)` และไม่มี error
- ถ้าติดแดง → กดเปิด log ดู step ที่ fail แล้ว fix แล้ว push ใหม่

### ขั้นตอนที่ 6 — ตั้งค่า Supabase Auth (สำคัญ)
- Supabase Dashboard → **Authentication → URL Configuration**
- **Site URL**: ใส่ Production URL ที่ได้จาก Vercel (เช่น `https://project.vercel.app`)
- ถ้ามี custom domain ใช้ในอีเมล ให้ใส่ใน **Redirect URLs** ด้วย

### ขั้นตอนที่ 7 — ทดสอบ Login
- เปิด Production URL → login ด้วย user ที่มี role `admin` และ `technician`
- ตรวจ: เข้า `/dashboard` ได้, logout กลับ `/login` ได้
- ตรวจ: ยังไม่ login เปิด `/dashboard` ต้อง redirect ไป `/login`

### ขั้นตอนที่ 8 — ทดสอบ Role
- **Admin**: เห็นปุ่ม "เพิ่ม/แก้ไข/ลบ" บน Alarms + Maintenance
- **Technician**: ไม่เห็นปุ่ม "ลบ" (Maintenance), เห็น "เพิ่ม/แก้ไข"
- ตรวจหน้า `/forbidden`: user ที่ไม่มี role ต้องมาที่นี่ ไม่ loop

### ขั้นตอนที่ 9 — ทดสอบ CRUD
- Machine/Alarm/Maintenance: Create → Edit → Delete → กลับมาดู Dashboard ตัวเลขเปลี่ยน (ดึงจาก Supabase จริง)
- Technician: สร้าง Maintenance → ระบบบันทึก technician = ตัวเอง, แก้ได้เฉพาะของตัวเอง

### ขั้นตอนที่ 10 — ทดสอบ Dashboard + Production URL
- เปิด Dashboard: การ์ด + กราฟ Machine/Alarm/Maintenance ต้องแสดงจำนวนจริง
- ทดสอบบนมือถือ (responsive), refresh หน้าแล้ว session ยังอยู่
- ตรวจ HTTPS: ล็อกสีเขียว, redirect http → https อัตโนมัติ (Vercel จัดให้)

## 3. ข้อควรระวัง (Security)

- ✅ ใช้เฉพาะ anon key ฝั่ง client — RLS เป็นตัวบังคับสิทธิ์จริง
- ⚠️ ก่อน Deploy: รัน migration SQL 2 ไฟล์ใน Supabase และ**รัน RLS** (ไม่งั้นข้อมูลรั่วได้ตามที่วิเคราะห์ใน audit)
- ⚠️ ห้ามใส่ secret ลง `.env` ที่ commit / GitHub Secrets ที่ไม่จำเป็น / logs
- 🔒 คุกกี้ auth ถูกตั้ง `secure + sameSite=lax` แล้วในโหมด production (ตัว hardening ที่เพิ่มไว้)

## 4. คำสั่งตรวจสอบก่อนส่งงาน (local)

```bash
npm ci
npm run typecheck   # ผ่าน
npm run lint        # ผ่าน (eslint .)
npm run build       # ผ่าน
git status          # clean, ไม่มี .env*
```