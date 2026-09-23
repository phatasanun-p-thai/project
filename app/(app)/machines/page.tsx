import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MachineManager } from "@/components/machines/machine-manager";
import type { Machine } from "@/types/database";

export const metadata: Metadata = {
  title: "เครื่องจักร",
};

export default async function MachinesPage() {
  const { profile } = await requireRole("admin", "technician");
  const supabase = await createClient();

  const machinesResult = await supabase
    .from("machines")
    .select("*")
    .order("machine_id");

  const error = machinesResult.error?.message;
  const machines = (machinesResult.data ?? []) as Machine[];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เครื่องจักร</h1>
          <p className="mt-1 text-sm text-gray-500">
            จัดการข้อมูล Master ของเครื่องจักร
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="text-base font-semibold text-red-700">
            โหลดข้อมูลไม่สำเร็จ
          </h2>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <a
            href="/machines"
            className="mt-4 inline-block rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            ลองใหม่อีกครั้ง
          </a>
        </div>
      ) : (
        <MachineManager
          machines={machines}
          isAdmin={profile.role === "admin"}
        />
      )}
    </div>
  );
}