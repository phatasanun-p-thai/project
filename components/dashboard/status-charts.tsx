import Link from "next/link";
import type {
  Alarm,
  AlarmStatus,
  Machine,
  MachineStatus,
  MaintenanceRecord,
  MaintenanceStatus,
} from "@/types/database";
import {
  summarizeAlarms,
  summarizeMachines,
  summarizeMaintenance,
} from "@/lib/dashboard/stats";
import { DonutChart, type DonutDatum } from "./donut-chart";
import { SectionHeader } from "./section-header";

const machineColors: Record<MachineStatus, string> = {
  Running: "#10b981",
  Stop: "#6b7280",
  Alarm: "#ef4444",
  Maintenance: "#f59e0b",
};

const alarmColors: Record<AlarmStatus, string> = {
  Open: "#ef4444",
  "In Progress": "#f59e0b",
  Closed: "#10b981",
};

const maintenanceColors: Record<MaintenanceStatus, string> = {
  Scheduled: "#3b82f6",
  "In Progress": "#f59e0b",
  Completed: "#10b981",
  Cancelled: "#9ca3af",
};

function toChartData(
  counts: Record<string, number>,
  colors: Record<string, string>
): DonutDatum[] {
  return Object.keys(colors).map((key) => ({
    label: key,
    value: counts[key] ?? 0,
    color: colors[key],
  }));
}

function ChartCard({
  title,
  subtitle,
  data,
  href,
}: {
  title: string;
  subtitle: string;
  data: DonutDatum[];
  href: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="whitespace-nowrap text-xs font-medium text-blue-600 hover:underline"
        >
          ดูทั้งหมด
        </Link>
      </div>
      <div className="mt-4 flex-1">
        <DonutChart data={data} />
      </div>
    </div>
  );
}

export function StatusCharts({
  machines,
  alarms,
  records,
}: {
  machines: Machine[];
  alarms: Alarm[];
  records: MaintenanceRecord[];
}) {
  const machinesSummary = summarizeMachines(machines);
  const alarmsSummary = summarizeAlarms(alarms);
  const maintenanceSummary = summarizeMaintenance(records);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="กราฟสถานะ"
        description="อัตราส่วนสถานะแบบเรียลไทม์จากข้อมูลจริง"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartCard
          title="Machine Status"
          subtitle="สถานะเครื่องจักร"
          data={toChartData(
            {
              Running: machinesSummary.Running,
              Stop: machinesSummary.Stop,
              Alarm: machinesSummary.Alarm,
              Maintenance: machinesSummary.Maintenance,
            },
            machineColors
          )}
          href="/machines"
        />
        <ChartCard
          title="Alarm Status"
          subtitle="สถานะ Alarm"
          data={toChartData(
            {
              Open: alarmsSummary.Open,
              "In Progress": alarmsSummary["In Progress"],
              Closed: alarmsSummary.Closed,
            },
            alarmColors
          )}
          href="/alarms"
        />
        <ChartCard
          title="Maintenance Status"
          subtitle="สถานะงานซ่อมบำรุง"
          data={toChartData(
            {
              Scheduled: maintenanceSummary.Scheduled,
              "In Progress": maintenanceSummary["In Progress"],
              Completed: maintenanceSummary.Completed,
              Cancelled: maintenanceSummary.Cancelled,
            },
            maintenanceColors
          )}
          href="/maintenance"
        />
      </div>
    </section>
  );
}