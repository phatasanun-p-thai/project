import type { Alarm } from "@/types/database";
import { summarizeAlarms } from "@/lib/dashboard/stats";
import { SectionHeader } from "./section-header";
import { SummaryCard } from "./summary-card";
import { DashboardEmptyState } from "./dashboard-empty-state";

export function AlarmSummary({ alarms }: { alarms: Alarm[] }) {
  const summary = summarizeAlarms(alarms);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Alarm"
        description="สถานะของ Alarm ทั้งหมดในระบบ"
        href="/alarms"
        hrefLabel="จัดการ Alarm"
      />

      {summary.total === 0 ? (
        <DashboardEmptyState
          variant="alarm"
          title="ยังไม่มีข้อมูล Alarm"
          description="เมื่อมี Alarm เกิดขึ้น จะแสดงสรุปสถานะที่นี่"
          actionHref="/alarms"
          actionLabel="ไปยังหน้า Alarm"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard
            label="Alarm ทั้งหมด"
            value={summary.total}
            barClass="bg-blue-500"
            textClass="text-gray-900"
            href="/alarms"
          />
          <SummaryCard
            label="Open"
            value={summary.Open}
            barClass="bg-red-500"
            textClass="text-red-700"
            href="/alarms"
          />
          <SummaryCard
            label="In Progress"
            value={summary["In Progress"]}
            barClass="bg-amber-500"
            textClass="text-amber-700"
            href="/alarms"
          />
          <SummaryCard
            label="Closed"
            value={summary.Closed}
            barClass="bg-emerald-500"
            textClass="text-emerald-700"
            href="/alarms"
          />
        </div>
      )}
    </section>
  );
}