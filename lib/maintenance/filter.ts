import type { MaintenanceStatus, MaintenanceWithRelations } from "@/types/database";
import { toDateKey } from "./format";

export interface MaintenanceFilters {
  search: string;
  machineId: string;
  technicianId: string;
  status: MaintenanceStatus | "";
  dateFrom: string;
  dateTo: string;
}

export const emptyMaintenanceFilters: MaintenanceFilters = {
  search: "",
  machineId: "",
  technicianId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export function isMaintenanceFilterActive(
  filters: MaintenanceFilters
): boolean {
  return Boolean(
    filters.search ||
      filters.machineId ||
      filters.technicianId ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo
  );
}

export function filterMaintenance(
  records: MaintenanceWithRelations[],
  filters: MaintenanceFilters
): MaintenanceWithRelations[] {
  const query = filters.search.trim().toLowerCase();

  return records.filter((record) => {
    if (query) {
      const haystack = [
        record.maintenance_type,
        record.problem,
        record.action_taken,
        record.machines?.machine_name ?? "",
        record.machines?.machine_id ?? "",
        record.technician?.full_name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.machineId && record.machine_id !== filters.machineId)
      return false;
    if (filters.technicianId && record.technician_id !== filters.technicianId)
      return false;
    if (filters.status && record.status !== filters.status) return false;

    const day = toDateKey(record.date);
    if (filters.dateFrom && day < filters.dateFrom) return false;
    if (filters.dateTo && day > filters.dateTo) return false;

    return true;
  });
}