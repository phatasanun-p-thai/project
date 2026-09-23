import type { Machine, MachineStatus } from "@/types/database";

export interface MachineFilters {
  search: string;
  status: MachineStatus | "";
  machineType: string;
}

export const emptyMachineFilters: MachineFilters = {
  search: "",
  status: "",
  machineType: "",
};

export function isMachineFilterActive(filters: MachineFilters): boolean {
  return Boolean(filters.search || filters.status || filters.machineType);
}

export function filterMachines(
  machines: Machine[],
  filters: MachineFilters
): Machine[] {
  const query = filters.search.trim().toLowerCase();

  return machines.filter((machine) => {
    if (query) {
      const haystack = [
        machine.machine_id,
        machine.machine_name,
        machine.machine_type,
        machine.location,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.status && machine.status !== filters.status) return false;
    if (filters.machineType && machine.machine_type !== filters.machineType)
      return false;

    return true;
  });
}