import type { MaintenanceStatus } from "@/types/database";

export const MAINTENANCE_STATUS_OPTIONS: MaintenanceStatus[] = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
];

export const maintenanceStatusStyles: Record<MaintenanceStatus, string> = {
  Scheduled: "bg-blue-100 text-blue-700 ring-blue-600/20",
  "In Progress": "bg-amber-100 text-amber-800 ring-amber-600/20",
  Completed: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  Cancelled: "bg-rose-100 text-rose-700 ring-rose-600/20",
};

const pad = (n: number) => n.toString().padStart(2, "0");

/** แปลงวันที่ (YYYY-MM-DD หรือ ISO) เป็น DD/MM/YYYY ตาม local */
export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** DD/MM/YYYY HH:mm สำหรับ created_at / updated_at */
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}