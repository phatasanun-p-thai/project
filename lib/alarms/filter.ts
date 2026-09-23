import type { AlarmStatus, AlarmWithMachine } from "@/types/database";
import { toDateKey } from "./format";

export interface AlarmFilters {
  search: string;
  machineId: string;
  alarmCode: string;
  status: AlarmStatus | "";
  dateFrom: string;
  dateTo: string;
}

export const emptyAlarmFilters: AlarmFilters = {
  search: "",
  machineId: "",
  alarmCode: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export function isAlarmFilterActive(filters: AlarmFilters): boolean {
  return Boolean(
    filters.search ||
      filters.machineId ||
      filters.alarmCode ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo
  );
}

export function filterAlarms(
  alarms: AlarmWithMachine[],
  filters: AlarmFilters
): AlarmWithMachine[] {
  const query = filters.search.trim().toLowerCase();

  return alarms.filter((alarm) => {
    if (query) {
      const haystack = [
        alarm.alarm_code,
        alarm.alarm_description,
        alarm.cause ?? "",
        alarm.machines?.machine_name ?? "",
        alarm.machines?.machine_id ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.machineId && alarm.machine_id !== filters.machineId)
      return false;
    if (filters.alarmCode && alarm.alarm_code !== filters.alarmCode)
      return false;
    if (filters.status && alarm.status !== filters.status) return false;

    const occurredDay = toDateKey(alarm.occurred_at);
    if (filters.dateFrom && occurredDay < filters.dateFrom) return false;
    if (filters.dateTo && occurredDay > filters.dateTo) return false;

    return true;
  });
}