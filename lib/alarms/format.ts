import type { AlarmStatus, MachineStatus } from "@/types/database";

export const ALARM_STATUS_OPTIONS: AlarmStatus[] = [
  "Open",
  "In Progress",
  "Closed",
];

export const alarmStatusStyles: Record<AlarmStatus, string> = {
  Open: "bg-red-100 text-red-700 ring-red-600/20",
  "In Progress": "bg-amber-100 text-amber-800 ring-amber-600/20",
  Closed: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
};

export const machineStatusStyles: Record<MachineStatus, string> = {
  Running: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  Stop: "bg-gray-100 text-gray-700 ring-gray-500/20",
  Alarm: "bg-red-100 text-red-700 ring-red-600/20",
  Maintenance: "bg-amber-100 text-amber-800 ring-amber-600/20",
};

const pad = (n: number) => n.toString().padStart(2, "0");

/** 06/05/2026 14:30 */
export function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return (
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/** YYYY-MM-DD ตาม local timezone ใช้ตัดวันที่สำหรับ filter */
export function toDateKey(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** แปลง ISO เป็นค่าเริ่มต้นของ input[type=datetime-local] (YYYY-MM-DDTHH:MM ตาม local) */
export function toLocalDatetimeInput(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}