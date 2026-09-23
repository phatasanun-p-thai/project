import type { Machine } from "@/types/database";

const CARDS = [
  { key: "total", label: "เครื่องจักรทั้งหมด", valueClass: "text-gray-900" },
  { key: "Running", label: "Running", valueClass: "text-emerald-600" },
  { key: "Stop", label: "Stop", valueClass: "text-gray-600" },
  { key: "Alarm", label: "Alarm", valueClass: "text-red-600" },
  { key: "Maintenance", label: "Maintenance", valueClass: "text-amber-600" },
] as const;

export function MachineStats({ machines }: { machines: Machine[] }) {
  const counts: Record<string, number> = {
    total: machines.length,
    Running: 0,
    Stop: 0,
    Alarm: 0,
    Maintenance: 0,
  };
  for (const machine of machines) {
    counts[machine.status] = (counts[machine.status] ?? 0) + 1;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
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