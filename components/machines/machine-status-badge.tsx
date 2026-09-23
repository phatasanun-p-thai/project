import type { MachineStatus } from "@/types/database";
import { MACHINE_STATUS_STYLES } from "@/lib/machines/format";

export function MachineStatusBadge({ status }: { status: MachineStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${MACHINE_STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}