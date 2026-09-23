"use client";

import { Fragment } from "react";
import type { Machine } from "@/types/database";
import { formatDateTime } from "@/lib/alarms/format";
import { MachineStatusBadge } from "./machine-status-badge";

const HEADERS = [
  "รหัสเครื่องจักร",
  "ชื่อเครื่อง",
  "ประเภท",
  "ตำแหน่ง",
  "สถานะ",
  "การจัดการ",
];

const buttonClass =
  "rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50";

interface Props {
  machines: Machine[];
  selectedId: string | null;
  isAdmin: boolean;
  onSelect: (id: string | null) => void;
  onEdit: (machine: Machine) => void;
  onDelete: (machine: Machine) => void;
}

export function MachineTable({
  machines,
  selectedId,
  isAdmin,
  onSelect,
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
            {machines.map((machine) => {
              const expanded = selectedId === machine.id;
              return (
                <Fragment key={machine.id}>
                  <tr
                    onClick={() => onSelect(expanded ? null : machine.id)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      expanded ? "bg-blue-50/70" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                      {machine.machine_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {machine.machine_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {machine.machine_type || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {machine.location || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <MachineStatusBadge status={machine.status} />
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(machine)}
                            className={`${buttonClass} border-gray-300 text-gray-700 hover:bg-gray-100`}
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(machine)}
                            className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50`}
                          >
                            ลบ
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          ดูรายละเอียด
                        </span>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="border-t-2 border-blue-200 bg-blue-50/50">
                      <td colSpan={HEADERS.length} className="px-4 py-4">
                        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                          <div>
                            <dt className="text-xs text-gray-500">
                              รหัสเครื่องจักร
                            </dt>
                            <dd className="mt-0.5 font-mono font-semibold text-gray-900">
                              {machine.machine_id}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">
                              ชื่อเครื่องจักร
                            </dt>
                            <dd className="mt-0.5 text-gray-900">
                              {machine.machine_name}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">
                              ประเภทเครื่องจักร
                            </dt>
                            <dd className="mt-0.5 text-gray-900">
                              {machine.machine_type || "-"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">
                              ตำแหน่งที่ตั้ง
                            </dt>
                            <dd className="mt-0.5 text-gray-900">
                              {machine.location || "-"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">สถานะ</dt>
                            <dd className="mt-1">
                              <MachineStatusBadge status={machine.status} />
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">
                              วันที่เพิ่ม
                            </dt>
                            <dd className="mt-0.5 font-mono text-gray-900">
                              {formatDateTime(machine.created_at)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500">
                              อัปเดตล่าสุด
                            </dt>
                            <dd className="mt-0.5 font-mono text-gray-900">
                              {formatDateTime(machine.updated_at)}
                            </dd>
                          </div>
                        </dl>
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