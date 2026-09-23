import type { MaintenanceWithRelations } from "@/types/database";

const CARDS = [
  { key: "total", label: "รายการทั้งหมด", valueClass: "text-gray-900" },
  { key: "Scheduled", label: "Scheduled", valueClass: "text-blue-600" },
  {
    key: "In Progress",
    label: "In Progress",
    valueClass: "text-amber-600",
  },
  { key: "Completed", label: "Completed", valueClass: "text-emerald-600" },
] as const;

export function MaintenanceStats({
  records,
}: {
  records: MaintenanceWithRelations[];
}) {
  const counts: Record<string, number> = {
    total: records.length,
    Scheduled: 0,
    "In Progress": 0,
    Completed: 0,
    Cancelled: 0,
  };
  for (const record of records) {
    counts[record.status] = (counts[record.status] ?? 0) + 1;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="text-sm text-gray-500">{card.label}</div>
          <div
            className={`mt-1 font-mono text-2xl font-bold ${card.valueClass}`}
          >
            {counts[card.key] ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}