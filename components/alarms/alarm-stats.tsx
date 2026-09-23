import type { AlarmWithMachine } from "@/types/database";

const CARDS = [
  { key: "total", label: "Alarm ทั้งหมด", valueClass: "text-gray-900" },
  { key: "Open", label: "Open", valueClass: "text-red-600" },
  { key: "In Progress", label: "In Progress", valueClass: "text-amber-600" },
  { key: "Closed", label: "Closed", valueClass: "text-emerald-600" },
] as const;

export function AlarmStats({ alarms }: { alarms: AlarmWithMachine[] }) {
  const counts: Record<string, number> = {
    total: alarms.length,
    Open: 0,
    "In Progress": 0,
    Closed: 0,
  };
  for (const alarm of alarms) {
    counts[alarm.status] = (counts[alarm.status] ?? 0) + 1;
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