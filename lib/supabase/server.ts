import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

type SetCookieItem = {
  name: string;
  value: string;
  options?: CookieOptions;
};

/**
 * Server-side Supabase client ใช้ใน Server Components / Server Actions / Route Handlers
 * อ่าน session จาก cookies ผ่าน @supabase/ssr
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: SetCookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                path: "/",
                httpOnly: false,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              })
            );
          } catch {
            // เรียกจาก Server Component จะยอมให้เขียนไม่ได้ (อ่านได้อย่างเดียว)
            // แต่ middleware จะ refresh token ให้อยู่แล้ว
          }
        },
      },
    }
  );
}