import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceManager } from "@/components/maintenance/maintenance-manager";
import type { Machine, MaintenanceWithRelations, Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Maintenance",
};

export default async function MaintenancePage() {
  const { profile } = await requireRole("admin", "technician");
  const supabase = await createClient();

  const [recordsResult, machinesResult, techniciansResult] = await Promise.all([
    supabase
      .from("maintenance_records")
      .select("*, machines(*), technician:profiles(*)")
      .order("date", { ascending: false }),
    supabase.from("machines").select("*").order("machine_name"),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "technician")
      .order("full_name"),
  ]);

  const error =
    recordsResult.error?.message ??
    machinesResult.error?.message ??
    techniciansResult.error?.message;

  const machines = (machinesResult.data ?? []) as Machine[];
  const records = (recordsResult.data ?? []) as MaintenanceWithRelations[];
  const technicians = (techniciansResult.data ?? []) as Profile[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
        <p className="mt-1 text-sm text-gray-500">
          บันทึกและติดตามสถานะงานซ่อมบำรุงเครื่องจักร
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="text-base font-semibold text-red-700">
            โหลดข้อมูลไม่สำเร็จ
          </h2>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <a
            href="/maintenance"
            className="mt-4 inline-block rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            ลองใหม่อีกครั้ง
          </a>
        </div>
      ) : (
        <MaintenanceManager
          records={records}
          machines={machines}
          technicians={technicians}
          isAdmin={profile.role === "admin"}
          currentProfile={profile}
        />
      )}
    </div>
  );
}