import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AlarmManager } from "@/components/alarms/alarm-manager";
import type { AlarmWithMachine, Machine } from "@/types/database";

export const metadata: Metadata = {
  title: "Alarms",
};

export default async function AlarmsPage() {
  const { profile } = await requireRole("admin", "technician");
  const supabase = await createClient();

  const [alarmsResult, machinesResult] = await Promise.all([
    supabase.from("alarms").select("*").order("occurred_at", { ascending: false }),
    supabase.from("machines").select("*").order("machine_name"),
  ]);

  const error = alarmsResult.error?.message ?? machinesResult.error?.message;
  const machines = (machinesResult.data ?? []) as Machine[];
  const machinesById = new Map(machines.map((m) => [m.id, m]));
  const alarms = ((alarmsResult.data ?? []) as AlarmWithMachine[]).map(
    (alarm) => ({
      ...alarm,
      machines: machinesById.get(alarm.machine_id) ?? null,
    })
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Alarms</h1>
        <p className="mt-1 text-sm text-gray-500">
          บันทึกและติดตามสถานะ Alarm ของเครื่องจักร
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="text-base font-semibold text-red-700">
            โหลดข้อมูลไม่สำเร็จ
          </h2>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <a
            href="/alarms"
            className="mt-4 inline-block rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            ลองใหม่อีกครั้ง
          </a>
        </div>
      ) : (
        <AlarmManager
          alarms={alarms}
          machines={machines}
          isAdmin={profile.role === "admin"}
        />
      )}
    </div>
  );
}