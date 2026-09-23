import type { AlarmWithMachine, Machine } from "@/types/database";
import { MachineStatusBadge } from "./status-badges";

interface Props {
  machine: Machine;
  alarms: AlarmWithMachine[];
}

export function MachineInfoPanel({ machine, alarms }: Props) {
  const machineAlarms = alarms.filter((a) => a.machine_id === machine.id);
  const openCount = machineAlarms.filter((a) => a.status !== "Closed").length;

  return (
    <section
      aria-label="ข้อมูลเครื่องจักรที่เลือก"
      className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                d="M3 9.5 12 4l9 5.5M5 10v8h14v-8M9 18v-4h6v4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {machine.machine_name}
              </h3>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-blue-800">
                {machine.machine_id}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              เลือกจาก Filter — แสดงข้อมูลเครื่องจักรที่เกี่ยวข้อง
            </p>
          </div>
        </div>
        <MachineStatusBadge status={machine.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div>
          <dt className="text-xs text-gray-500">ประเภท</dt>
          <dd className="mt-0.5 font-medium text-gray-900">
            {machine.machine_type || "-"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">สถานที่</dt>
          <dd className="mt-0.5 font-medium text-gray-900">
            {machine.location || "-"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Alarm ทั้งหมด</dt>
          <dd className="mt-0.5 font-mono font-semibold text-gray-900">
            {machineAlarms.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">ยังไม่ปิด (Open/In Progress)</dt>
          <dd className="mt-0.5 font-mono font-semibold text-red-600">
            {openCount}
          </dd>
        </div>
      </dl>
    </section>
  );
}