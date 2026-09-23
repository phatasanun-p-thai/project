"use client";

import { Fragment } from "react";
import type { MaintenanceStatus, MaintenanceWithRelations } from "@/types/database";
import {
  MAINTENANCE_STATUS_OPTIONS,
  formatDate,
  formatDateTime,
} from "@/lib/maintenance/format";
import { MaintenanceStatusBadge } from "./maintenance-status-badge";

const HEADERS = [
  "เครื่องจักร",
  "ประเภทการบำรุงรักษา",
  "ปัญหา",
  "ช่างเทคนิค",
  "วันที่",
  "สถานะ",
  "การจัดการ",
];

const selectClass =
  "rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50";
const buttonClass =
  "rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50";

interface Props {
  records: MaintenanceWithRelations[];
  selectedId: string | null;
  isAdmin: boolean;
  currentProfileId: string;
  statusPending: boolean;
  onSelect: (id: string | null) => void;
  onStatusChange: (id: string, status: MaintenanceStatus) => void;
  onEdit: (record: MaintenanceWithRelations) => void;
  onDelete: (record: MaintenanceWithRelations) => void;
}

export function MaintenanceTable({
  records,
  selectedId,
  isAdmin,
  currentProfileId,
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
            {records.map((record) => {
              const expanded = selectedId === record.id;
              const canManage =
                isAdmin || record.technician_id === currentProfileId;
              return (
                <Fragment key={record.id}>
                  <tr
                    onClick={() => onSelect(expanded ? null : record.id)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      expanded ? "bg-blue-50/70" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {record.machines?.machine_name ?? "ไม่พบเครื่องจักร"}
                      </div>
                      <div className="font-mono text-xs text-gray-500">
                        {record.machines?.machine_id ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
                        {record.maintenance_type}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-4 py-3">
                      <div className="truncate text-gray-700">
                        {record.problem}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {record.technician?.full_name ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-3">
                      <MaintenanceStatusBadge status={record.status} />
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(record)}
                            className={`${buttonClass} border-gray-300 text-gray-700 hover:bg-gray-100`}
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(record)}
                            className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50`}
                          >
                            ลบ
                          </button>
                        </div>
                      ) : canManage ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(record)}
                            className={`${buttonClass} border-gray-300 text-gray-700 hover:bg-gray-100`}
                          >
                            แก้ไข
                          </button>
                          <select
                            aria-label={`เปลี่ยนสถานะ ${record.problem}`}
                            value={record.status}
                            disabled={statusPending}
                            onChange={(e) =>
                              onStatusChange(
                                record.id,
                                e.target.value as MaintenanceStatus
                              )
                            }
                            className={selectClass}
                          >
                            {MAINTENANCE_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          อ่านอย่างเดียว
                        </span>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="border-t-2 border-blue-200 bg-blue-50/50">
                      <td colSpan={HEADERS.length} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                          <div className="rounded-md border border-gray-200 bg-white p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              ข้อมูลเครื่องจักร
                            </div>
                            {record.machines ? (
                              <dl className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between gap-3">
                                  <dt className="text-gray-500">ชื่อ</dt>
                                  <dd className="text-right font-medium text-gray-900">
                                    {record.machines.machine_name}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-gray-500">รหัส</dt>
                                  <dd className="font-mono text-gray-900">
                                    {record.machines.machine_id}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-gray-500">ประเภท</dt>
                                  <dd className="text-right font-medium text-gray-900">
                                    {record.machines.machine_type || "-"}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-gray-500">สถานที่</dt>
                                  <dd className="text-right font-medium text-gray-900">
                                    {record.machines.location || "-"}
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
                              รายละเอียดการบำรุงรักษา
                            </div>
                            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                              <div>
                                <dt className="text-xs text-gray-500">
                                  ประเภทการบำรุงรักษา
                                </dt>
                                <dd className="mt-0.5 font-semibold text-gray-900">
                                  {record.maintenance_type}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-gray-500">
                                  สถานะปัจจุบัน
                                </dt>
                                <dd className="mt-1">
                                  <MaintenanceStatusBadge status={record.status} />
                                </dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-xs text-gray-500">ปัญหา</dt>
                                <dd className="mt-0.5 text-gray-900">
                                  {record.problem}
                                </dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-xs text-gray-500">
                                  การดำเนินการที่ทำ
                                </dt>
                                <dd className="mt-0.5 whitespace-pre-wrap text-gray-700">
                                  {record.action_taken || "-"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-gray-500">
                                  วันที่ทำการบำรุงรักษา
                                </dt>
                                <dd className="mt-0.5 font-mono text-gray-900">
                                  {formatDate(record.date)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-gray-500">
                                  ช่างเทคนิค
                                </dt>
                                <dd className="mt-0.5 text-gray-900">
                                  {record.technician?.full_name ?? "-"}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-gray-500">
                                  สร้างเมื่อ
                                </dt>
                                <dd className="mt-0.5 font-mono text-gray-900">
                                  {formatDateTime(record.created_at)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs text-gray-500">
                                  อัปเดตล่าสุด
                                </dt>
                                <dd className="mt-0.5 font-mono text-gray-900">
                                  {formatDateTime(record.updated_at)}
                                </dd>
                              </div>
                            </dl>

                            {canManage && (
                              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                                <span className="text-xs text-gray-500">
                                  เปลี่ยนสถานะ:
                                </span>
                                <select
                                  aria-label={`เปลี่ยนสถานะ ${record.problem}`}
                                  value={record.status}
                                  disabled={statusPending}
                                  onChange={(e) =>
                                    onStatusChange(
                                      record.id,
                                      e.target.value as MaintenanceStatus
                                    )
                                  }
                                  className={selectClass}
                                >
                                  {MAINTENANCE_STATUS_OPTIONS.map((status) => (
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
                            )}
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