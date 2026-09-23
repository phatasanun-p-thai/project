import type { AlarmStatus, MachineStatus } from "@/types/database";
import { alarmStatusStyles, machineStatusStyles } from "@/lib/alarms/format";

function Badge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

export function AlarmStatusBadge({ status }: { status: AlarmStatus }) {
  return <Badge label={status} className={alarmStatusStyles[status]} />;
}

export function MachineStatusBadge({ status }: { status: MachineStatus }) {
  return <Badge label={status} className={machineStatusStyles[status]} />;
}