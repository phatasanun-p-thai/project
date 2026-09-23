import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, Role } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile:", error.message);
    return null;
  }
  return data;
}

/** ใช้ใน protected page/layout — ไม่มี session เด้งไป /login */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** ใช้ใน page ที่ต้องการ role เฉพาะ — เช็ค role จาก tables.profiles (source of truth) */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (!profile || !roles.includes(profile.role)) {
    redirect("/forbidden");
  }
  return { user, profile };
}