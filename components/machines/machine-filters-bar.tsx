"use client";

import type { MachineStatus } from "@/types/database";
import { MACHINE_STATUS_OPTIONS } from "@/lib/machines/format";
import { isMachineFilterActive, type MachineFilters } from "@/lib/machines/filter";

const inputClass =
  "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-1 block text-xs font-semibold text-gray-600";

interface Props {
  filters: MachineFilters;
  machineTypes: string[];
  onChange: (filters: MachineFilters) => void;
  onReset: () => void;
}

export function MachineFiltersBar({
  filters,
  machineTypes,
  onChange,
  onReset,
}: Props) {
  const update = (patch: Partial<MachineFilters>) =>
    onChange({ ...filters, ...patch });
  const active = isMachineFilterActive(filters);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="machine-search" className={labelClass}>
            ค้นหา
          </label>
          <input
            id="machine-search"
            type="search"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="รหัส / ชื่อ / ประเภท / ที่ตั้ง..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="machine-type" className={labelClass}>
            ประเภทเครื่องจักร
          </label>
          <select
            id="machine-type"
            value={filters.machineType}
            onChange={(e) => update({ machineType: e.target.value })}
            className={inputClass}
          >
            <option value="">ทุกประเภท</option>
            {machineTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="machine-status" className={labelClass}>
            สถานะ
          </label>
          <select
            id="machine-status"
            value={filters.status}
            onChange={(e) =>
              update({ status: e.target.value as MachineStatus | "" })
            }
            className={inputClass}
          >
            <option value="">ทุกสถานะ</option>
            {MACHINE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {active && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">มีตัวกรองที่ใช้งานอยู่</span>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
}