"use client";

import type { AlarmStatus, Machine } from "@/types/database";
import { ALARM_STATUS_OPTIONS } from "@/lib/alarms/format";
import { isAlarmFilterActive, type AlarmFilters } from "@/lib/alarms/filter";

const inputClass =
  "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-1 block text-xs font-semibold text-gray-600";

interface Props {
  filters: AlarmFilters;
  machines: Machine[];
  alarmCodes: string[];
  onChange: (filters: AlarmFilters) => void;
  onReset: () => void;
}

export function AlarmFiltersBar({
  filters,
  machines,
  alarmCodes,
  onChange,
  onReset,
}: Props) {
  const update = (patch: Partial<AlarmFilters>) =>
    onChange({ ...filters, ...patch });
  const active = isAlarmFilterActive(filters);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="xl:col-span-1">
          <label htmlFor="alarm-search" className={labelClass}>
            ค้นหา
          </label>
          <input
            id="alarm-search"
            type="search"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="โค้ด / คำอธิบาย / เครื่อง..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="alarm-machine" className={labelClass}>
            เครื่องจักร
          </label>
          <select
            id="alarm-machine"
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
          <label htmlFor="alarm-code" className={labelClass}>
            Alarm Code
          </label>
          <select
            id="alarm-code"
            value={filters.alarmCode}
            onChange={(e) => update({ alarmCode: e.target.value })}
            className={inputClass}
          >
            <option value="">ทุก Alarm Code</option>
            {alarmCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="alarm-status" className={labelClass}>
            สถานะ
          </label>
          <select
            id="alarm-status"
            value={filters.status}
            onChange={(e) =>
              update({ status: e.target.value as AlarmStatus | "" })
            }
            className={inputClass}
          >
            <option value="">ทุกสถานะ</option>
            {ALARM_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="alarm-date-from" className={labelClass}>
            วันที่เริ่มต้น
          </label>
          <input
            id="alarm-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="alarm-date-to" className={labelClass}>
            วันที่สิ้นสุด
          </label>
          <input
            id="alarm-date-to"
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