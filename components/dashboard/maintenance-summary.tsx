import type { MaintenanceRecord } from "@/types/database";
import { summarizeMaintenance } from "@/lib/dashboard/stats";
import { SectionHeader } from "./section-header";
import { SummaryCard } from "./summary-card";
import { DashboardEmptyState } from "./dashboard-empty-state";

export function MaintenanceSummary({
  records,
}: {
  records: MaintenanceRecord[];
}) {
  const summary = summarizeMaintenance(records);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Maintenance"
        description="สรุปงานซ่อมบำรุงเครื่องจักร"
        href="/maintenance"
        hrefLabel="จัดการ Maintenance"
      />

      {summary.total === 0 ? (
        <DashboardEmptyState
          variant="maintenance"
          title="ยังไม่มีรายการ Maintenance"
          description="บันทึกงานซ่อมบำรุงครั้งแรกเพื่อติดตามความคืบหน้า"
          actionHref="/maintenance"
          actionLabel="ไปยังหน้า Maintenance"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Maintenance ทั้งหมด"
            value={summary.total}
            barClass="bg-blue-500"
            textClass="text-gray-900"
            href="/maintenance"
          />
          <SummaryCard
            label="กำลังดำเนินการ"
            value={summary["In Progress"]}
            barClass="bg-amber-500"
            textClass="text-amber-700"
            href="/maintenance"
          />
          <SummaryCard
            label="เสร็จแล้ว"
            value={summary.Completed}
            barClass="bg-emerald-500"
            textClass="text-emerald-700"
            href="/maintenance"
          />
        </div>
      )}
    </section>
  );
}