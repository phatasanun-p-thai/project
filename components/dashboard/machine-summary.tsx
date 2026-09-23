import type { Machine } from "@/types/database";
import { summarizeMachines } from "@/lib/dashboard/stats";
import { SectionHeader } from "./section-header";
import { SummaryCard } from "./summary-card";
import { DashboardEmptyState } from "./dashboard-empty-state";

export function MachineSummary({ machines }: { machines: Machine[] }) {
  const summary = summarizeMachines(machines);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Machine Summary"
        description="สถานะการทำงานของเครื่องจักรทั้งหมด"
        href="/machines"
        hrefLabel="จัดการเครื่องจักร"
      />

      {summary.total === 0 ? (
        <DashboardEmptyState
          variant="machine"
          title="ยังไม่มีข้อมูลเครื่องจักร"
          description="เพิ่มเครื่องจักรเครื่องแรกเพื่อเริ่มติดตามสถานะการทำงาน"
          actionHref="/machines"
          actionLabel="ไปยังหน้าเครื่องจักร"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryCard
            label="เครื่องจักรทั้งหมด"
            value={summary.total}
            barClass="bg-blue-500"
            textClass="text-gray-900"
            href="/machines"
          />
          <SummaryCard
            label="Running"
            value={summary.Running}
            barClass="bg-emerald-500"
            textClass="text-emerald-700"
            href="/machines"
          />
          <SummaryCard
            label="Stop"
            value={summary.Stop}
            barClass="bg-gray-400"
            textClass="text-gray-700"
            href="/machines"
          />
          <SummaryCard
            label="Alarm"
            value={summary.Alarm}
            barClass="bg-red-500"
            textClass="text-red-700"
            href="/machines"
          />
          <SummaryCard
            label="Maintenance"
            value={summary.Maintenance}
            barClass="bg-amber-500"
            textClass="text-amber-700"
            href="/machines"
          />
        </div>
      )}
    </section>
  );
}