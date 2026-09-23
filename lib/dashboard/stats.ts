import type {
  Alarm,
  AlarmStatus,
  Machine,
  MachineStatus,
  MaintenanceRecord,
  MaintenanceStatus,
} from "@/types/database";

export interface MachineSummary {
  total: number;
  Running: number;
  Stop: number;
  Alarm: number;
  Maintenance: number;
}

export interface AlarmSummary {
  total: number;
  Open: number;
  "In Progress": number;
  Closed: number;
}

export interface MaintenanceSummary {
  total: number;
  Scheduled: number;
  "In Progress": number;
  Completed: number;
  Cancelled: number;
}

export function summarizeMachines(machines: Machine[]): MachineSummary {
  const counts: Record<MachineStatus, number> = {
    Running: 0,
    Stop: 0,
    Alarm: 0,
    Maintenance: 0,
  };
  for (const machine of machines) counts[machine.status] += 1;
  return { total: machines.length, ...counts };
}

export function summarizeAlarms(alarms: Alarm[]): AlarmSummary {
  const counts: Record<AlarmStatus, number> = {
    Open: 0,
    "In Progress": 0,
    Closed: 0,
  };
  for (const alarm of alarms) counts[alarm.status] += 1;
  return { total: alarms.length, ...counts };
}

export function summarizeMaintenance(
  records: MaintenanceRecord[]
): MaintenanceSummary {
  const counts: Record<MaintenanceStatus, number> = {
    Scheduled: 0,
    "In Progress": 0,
    Completed: 0,
    Cancelled: 0,
  };
  for (const record of records) counts[record.status] += 1;
  return { total: records.length, ...counts };
}