"use client";

import type { Machine } from "@/types/database";

interface Props {
  machine: Machine;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function MachineDeleteDialog({
  machine,
  pending,
  onClose,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-machine-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                d="M12 8v5m0 3h.01M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <h2
              id="delete-machine-title"
              className="text-lg font-semibold text-gray-900"
            >
              ยืนยันการลบเครื่องจักร
            </h2>
            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
              <div className="font-mono font-semibold text-gray-900">
                {machine.machine_id}
              </div>
              <div className="mt-1 text-gray-700">{machine.machine_name}</div>
              <div className="mt-2 text-xs text-gray-500">
                {machine.machine_type} · {machine.location}
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              ข้อมูลที่ลบจะกู้คืนไม่ได้ และอาจกระทบข้อมูล Alarm / Maintenance
              ที่อ้างอิงเครื่องนี้
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "กำลังลบ..." : "ลบเครื่องจักร"}
          </button>
        </div>
      </div>
    </div>
  );
}