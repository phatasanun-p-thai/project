import type { MachineStatus } from "@/types/database";

export const MACHINE_STATUS_OPTIONS: MachineStatus[] = [
  "Running",
  "Stop",
  "Alarm",
  "Maintenance",
];

export const MACHINE_STATUS_STYLES: Record<MachineStatus, string> = {
  Running: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  Stop: "bg-gray-100 text-gray-700 ring-gray-500/20",
  Alarm: "bg-red-100 text-red-700 ring-red-600/20",
  Maintenance: "bg-amber-100 text-amber-800 ring-amber-600/20",
};