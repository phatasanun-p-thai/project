import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "ไม่มีสิทธิ์เข้าถึง",
};

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path
              d="M12 14v-4m0 6h.01M5.1 4.7a2 2 0 0 0-1.6 3L9.6 18a2 2 0 0 0 3.4 0l6.1-10.3a2 2 0 0 0-1.6-3H5.1Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            403 — ไม่มีสิทธิ์เข้าถึง
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            บัญชีของคุณไม่มีสิทธิ์ใช้งานหน้านี้ หรือยังไม่มีบทบาทในระบบ
            กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="block rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            กลับไปหน้า Dashboard
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}