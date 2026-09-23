"use client";

import type { AlarmWithMachine } from "@/types/database";
import { formatDateTime } from "@/lib/alarms/format";

interface Props {
  alarm: AlarmWithMachine;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AlarmDeleteDialog({
  alarm,
  pending,
  onClose,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-alarm-title"
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
              id="delete-alarm-title"
              className="text-lg font-semibold text-gray-900"
            >
              ยืนยันการลบ Alarm
            </h2>
            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
              <div className="font-mono font-semibold text-gray-900">
                {alarm.alarm_code}
              </div>
              <div className="mt-1 break-words text-gray-700">
                {alarm.alarm_description}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {alarm.machines
                  ? `${alarm.machines.machine_name} (${alarm.machines.machine_id})`
                  : "ไม่พบเครื่องจักร"}
                {" · "}
                {formatDateTime(alarm.occurred_at)}
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              ข้อมูลที่ลบจะกู้คืนไม่ได้
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
            {pending ? "กำลังลบ..." : "ลบ Alarm"}
          </button>
        </div>
      </div>
    </div>
  );
}