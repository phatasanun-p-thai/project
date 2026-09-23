"use client";

import { Fragment } from "react";
import type { AlarmStatus, AlarmWithMachine } from "@/types/database";
import { ALARM_STATUS_OPTIONS, formatDateTime } from "@/lib/alarms/format";
import { AlarmStatusBadge, MachineStatusBadge } from "./status-badges";

const HEADERS = [
  "เครื่องจักร",
  "Alarm Code",
  "คำอธิบาย",
  "วันที่/เวลา",
  "สาเหตุ",
  "สถานะ",
  "การจัดการ",
];

const selectClass =
  "rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50";
const buttonClass =
  "rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50";

interface Props {
  alarms: AlarmWithMachine[];
  selectedId: string | null;
  isAdmin: boolean;
  statusPending: boolean;
  onSelect: (id: string | null) => void;
  onStatusChange: (id: string, status: AlarmStatus) => void;
  onEdit: (alarm: AlarmWithMachine) => void;
  onDelete: (alarm: AlarmWithMachine) => void;
}

export function AlarmTable({
  alarms,
  selectedId,
  isAdmin,
  statusPending,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {HEADERS.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alarms.map((alarm) => {
              const expanded = selectedId === alarm.id;
              return (
                <Fragment key={alarm.id}>
                  <tr
                    onClick={() => onSelect(expanded ? null : alarm.id)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      expanded ? "bg-blue-50/70" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {alarm.machines?.machine_name ?? "ไม่พบเครื่องจักร"}
                      </div>
                      <div className="font-mono text-xs text-gray-500">
                        {alarm.machines?.machine_id ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-800">
                        {alarm.alarm_code}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-4 py-3">
                      <div className="truncate text-gray-700">
                        {alarm.alarm_description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                      {formatDateTime(alarm.occurred_at)}
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <div className="truncate text-gray-600">
                        {alarm.cause || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AlarmStatusBadge status={alarm.status} />
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(alarm)}
                            className={`${buttonClass} border-gray-300 text-gray-700 hover:bg-gray-100`}
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(alarm)}
                            className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50`}
                          >
                            ลบ
                          </button>
                        </div>
                      ) : (
                        <select
                          aria-label={`เปลี่ยนสถานะ ${alarm.alarm_code}`}
                          value={alarm.status}
                          disabled={statusPending}
                          onChange={(e) =>
                            onStatusChange(
                              alarm.id,
                              e.target.value as AlarmStatus
                            )
                          }
                          className={selectClass}
                        >
                          {ALARM_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="border-t-2 border-blue-200 bg-blue-50/50">
                      <td colSpan={HEADERS.length} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                          <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              ข้อมูลเครื่องจักรที่เกี่ยวข้อง
                            </div>
                            {alarm.machines ? (
                              <dl className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between gap-3">
                                  <dt className="text-gray-500">ชื่อ</dt>
                                  <dd className="text-right font-medium text-gray-900">
                                    {alarm.machines.machine_name}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-gray-500">รหัส</dt>
                                  <dd className="font-mono text-gray-900">
                                    {alarm.machines.machine_id}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-gray-500">ประเภท</dt>
                                  <dd className="text-right font-medium text-gray-900">
                                    {alarm.machines.machine_type || "-"}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-gray-500">สถานที่</dt>
                                  <dd className="text-right font-medium text-gray-900">
                                    {alarm.machines.location || "-"}
                                  </dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <dt className="text-gray-500">
                                    สถานะเครื่อง
                                  </dt>
                                  <dd>
                                    <MachineStatusBadge
                                      status={alarm.machines.status}
                                    />
                                  </dd>
                                </div>
                              </dl>
                            ) : (
                              <p className="mt-3 text-sm text-gray-500">
                                ไม่พบข้อมูลเครื่องจักร
                              </p>
                            )}
                          </div>

                          <div className="rounded-md border border-gray-200 bg-white p-4 lg:col-span-2">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              รายละเอียด Alarm
                            </div>
                            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                              <div>
                                <dt className="text-xs text-gray-500">
                                  Alarm Code
                                </dt>
                                <dd className="mt-0.5 font-mono font-semibold text-gray-900">
                                  {alarm.alarm_code}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-gray-500">
                                  สถานะปัจจุบัน
                                </dt>
                                <dd className="mt-1">
                                  <AlarmStatusBadge status={alarm.status} />
                                </dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-xs text-gray-500">
                                  คำอธิบาย Alarm
                                </dt>
                                <dd className="mt-0.5 text-gray-900">
                                  {alarm.alarm_description}
                                </dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-xs text-gray-500">
                                  สาเหตุ
                                </dt>
                                <dd className="mt-0.5 text-gray-700">
                                  {alarm.cause || "-"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-gray-500">
                                  วันที่/เวลาที่เกิด
                                </dt>
                                <dd className="mt-0.5 font-mono text-gray-900">
                                  {formatDateTime(alarm.occurred_at)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-gray-500">
                                  อัปเดตล่าสุด
                                </dt>
                                <dd className="mt-0.5 font-mono text-gray-900">
                                  {formatDateTime(alarm.updated_at)}
                                </dd>
                              </div>
                            </dl>

                            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                              <span className="text-xs text-gray-500">
                                เปลี่ยนสถานะ:
                              </span>
                              <select
                                aria-label={`เปลี่ยนสถานะ ${alarm.alarm_code}`}
                                value={alarm.status}
                                disabled={statusPending}
                                onChange={(e) =>
                                  onStatusChange(
                                    alarm.id,
                                    e.target.value as AlarmStatus
                                  )
                                }
                                className={selectClass}
                              >
                                {ALARM_STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              {statusPending && (
                                <span className="text-xs text-gray-500">
                                  กำลังบันทึก...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}