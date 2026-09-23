import { requireRole } from "@/lib/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เครื่องจักร",
};

export default async function MachinesPage() {
  const { profile } = await requireRole("admin", "technician");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เครื่องจักร</h1>
          <p className="mt-1 text-sm text-gray-500">
            จัดการข้อมูล Master ของเครื่องจักร
          </p>
        </div>
        {profile.role === "admin" && (
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            เพิ่มเครื่องจักร
          </button>
        )}
      </header>

      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
        ตารางเครื่องจักร (ขั้นตอนถัดไป)
      </div>
    </div>
  );
}