"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";
import { redirect } from "next/navigation";

export type LoginState =
  | { success: true }
  | { success: false; error: string }
  | { success: true; redirectTo?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
    return { success: false, error: message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  // redirect ทำงานฝั่ง server หลัง auth สำเร็จ
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}