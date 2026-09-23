"use client";

import type { Machine, MaintenanceStatus, Profile } from "@/types/database";
import { MAINTENANCE_STATUS_OPTIONS } from "@/lib/maintenance/format";
import { isMaintenanceFilterActive, type MaintenanceFilters } from "@/lib/maintenance/filter";

const inputClass =
  "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-1 block text-xs font-semibold text-gray-600";

interface Props {
  filters: MaintenanceFilters;
  machines: Machine[];
  technicians: Profile[];
  onChange: (filters: MaintenanceFilters) => void;
  onReset: () => void;
}

export function MaintenanceFiltersBar({
  filters,
  machines,
  technicians,
  onChange,
  onReset,
}: Props) {
  const update = (patch: Partial<MaintenanceFilters>) =>
    onChange({ ...filters, ...patch });
  const active = isMaintenanceFilterActive(filters);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="xl:col-span-1">
          <label htmlFor="maintenance-search" className={labelClass}>
            ค้นหา
          </label>
          <input
            id="maintenance-search"
            type="search"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="ประเภท / ปัญหา / เครื่อง..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="maintenance-machine" className={labelClass}>
            เครื่องจักร
          </label>
          <select
            id="maintenance-machine"
            value={filters.machineId}
            onChange={(e) => update({ machineId: e.target.value })}
            className={inputClass}
          >
            <option value="">ทุกเครื่องจักร</option>
            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.machine_name} ({machine.machine_id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="maintenance-technician" className={labelClass}>
            ช่างเทคนิค
          </label>
          <select
            id="maintenance-technician"
            value={filters.technicianId}
            onChange={(e) => update({ technicianId: e.target.value })}
            className={inputClass}
          >
            <option value="">ทุกช่างเทคนิค</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="maintenance-status" className={labelClass}>
            สถานะ
          </label>
          <select
            id="maintenance-status"
            value={filters.status}
            onChange={(e) =>
              update({ status: e.target.value as MaintenanceStatus | "" })
            }
            className={inputClass}
          >
            <option value="">ทุกสถานะ</option>
            {MAINTENANCE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="maintenance-date-from" className={labelClass}>
            วันที่เริ่มต้น
          </label>
          <input
            id="maintenance-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="maintenance-date-to" className={labelClass}>
            วันที่สิ้นสุด
          </label>
          <input
            id="maintenance-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className={inputClass}
          />
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