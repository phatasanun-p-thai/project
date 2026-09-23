import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "../../lib/supabase/server";

/**
 * Layout สำหรับทุกหน้าในกลุ่ม (app) — URL ยังเป็น /dashboard, /machines...
 * ตรวจ session + role ทุกครั้งที่ render (Authorization ชั้น Server)
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  // ไม่อนุญาตให้ fallback บทบาทเอง — ถ้าไม่มี profile ให้ไปหน้าจำกัดสิทธิ์
  if (!profile) {
    redirect("/forbidden");
  }

  const role = profile.role;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar email={user.email ?? ""} role={role} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}