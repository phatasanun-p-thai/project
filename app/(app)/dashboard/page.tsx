import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Alarm, Machine, MaintenanceRecord } from "@/types/database";
import { MachineSummary } from "@/components/dashboard/machine-summary";
import { AlarmSummary } from "@/components/dashboard/alarm-summary";
import { MaintenanceSummary } from "@/components/dashboard/maintenance-summary";
import { StatusCharts } from "@/components/dashboard/status-charts";

export const metadata: Metadata = {
  title: "Dashboard",
};

const NAV_LINKS = [
  { href: "/machines", label: "Machines" },
  { href: "/alarms", label: "Alarms" },
  { href: "/maintenance", label: "Maintenance" },
] as const;

export default async function DashboardPage() {
  const { profile } = await requireRole("admin", "technician");
  const supabase = await createClient();

  const [machinesResult, alarmsResult, recordsResult] = await Promise.all([
    supabase.from("machines").select("status"),
    supabase.from("alarms").select("status"),
    supabase.from("maintenance_records").select("status"),
  ]);

  const error =
    machinesResult.error?.message ??
    alarmsResult.error?.message ??
    recordsResult.error?.message;

  const machines = (machinesResult.data ?? []) as unknown as Machine[];
  const alarms = (alarmsResult.data ?? []) as unknown as Alarm[];
  const records = (recordsResult.data ?? []) as unknown as MaintenanceRecord[];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            ยินดีต้อนรับ {profile.full_name || profile.email} —{" "}
            {profile.role === "admin" ? "ผู้ดูแลระบบ" : "ช่างเทคนิค"}
          </p>
        </div>
        <nav aria-label="ลิงก์ด่วน" className="flex flex-wrap gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="text-base font-semibold text-red-700">
            โหลดข้อมูลไม่สำเร็จ
          </h2>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            ลองใหม่อีกครั้ง
          </a>
        </div>
      ) : (
        <>
          <MachineSummary machines={machines} />
          <AlarmSummary alarms={alarms} />
          <MaintenanceSummary records={records} />
          <StatusCharts machines={machines} alarms={alarms} records={records} />
        </>
      )}
    </div>
  );
}