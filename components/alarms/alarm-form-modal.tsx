"use client";

import { useEffect, useActionState } from "react";
import {
  createAlarm,
  updateAlarm,
  type AlarmFormState,
} from "@/lib/alarms/actions";
import { ALARM_STATUS_OPTIONS, toLocalDatetimeInput } from "@/lib/alarms/format";
import type { AlarmWithMachine, Machine } from "@/types/database";

const initialState: AlarmFormState = { success: false, message: "" };

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "mt-1 text-xs text-red-600";

interface Props {
  mode: "create" | "edit";
  alarm: AlarmWithMachine | null;
  machines: Machine[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function AlarmFormModal({
  mode,
  alarm,
  machines,
  onClose,
  onSaved,
}: Props) {
  const [createState, createAction, createPending] = useActionState<
    AlarmFormState,
    FormData
  >(createAlarm, initialState);
  const [editState, editAction, editPending] = useActionState<
    AlarmFormState,
    FormData
  >(updateAlarm, initialState);

  const editing = mode === "edit";
  const state = editing ? editState : createState;
  const formAction = editing ? editAction : createAction;
  const pending = editing ? editPending : createPending;

  useEffect(() => {
    if (state.success) onSaved(state.message);
  }, [state, onSaved]);

  const errors = state.success ? {} : (state.fieldErrors ?? {});
  const formError = state.success ? "" : state.message;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/40 p-4 sm:items-center">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? "แก้ไข Alarm" : "เพิ่ม Alarm"}
            </h2>
            {editing && alarm && (
              <p className="mt-0.5 font-mono text-xs text-gray-500">
                {alarm.alarm_code}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form action={formAction} className="space-y-4 px-6 py-5">
          {editing && <input type="hidden" name="id" value={alarm?.id ?? ""} />}

          {formError && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {formError}
            </p>
          )}

          {machines.length === 0 && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              ยังไม่มีเครื่องจักรในระบบ — เพิ่มข้อมูลเครื่องจักรก่อน
            </p>
          )}

          <div>
            <label htmlFor="alarm-machine" className={labelClass}>
              เครื่องจักร <span className="text-red-500">*</span>
            </label>
            <select
              id="alarm-machine"
              name="machine_id"
              defaultValue={alarm?.machine_id ?? ""}
              required
              className={inputClass}
            >
              <option value="">-- เลือกเครื่องจักร --</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.machine_name} ({machine.machine_id})
                </option>
              ))}
            </select>
            {errors.machine_id && (
              <p className={errorClass}>{errors.machine_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="alarm-code" className={labelClass}>
              Alarm Code <span className="text-red-500">*</span>
            </label>
            <input
              id="alarm-code"
              name="alarm_code"
              type="text"
              required
              maxLength={32}
              defaultValue={alarm?.alarm_code ?? ""}
              placeholder="เช่น E-101"
              className={`${inputClass} font-mono`}
            />
            {errors.alarm_code && (
              <p className={errorClass}>{errors.alarm_code}</p>
            )}
          </div>

          <div>
            <label htmlFor="alarm-description" className={labelClass}>
              คำอธิบาย Alarm <span className="text-red-500">*</span>
            </label>
            <textarea
              id="alarm-description"
              name="alarm_description"
              required
              rows={3}
              maxLength={500}
              defaultValue={alarm?.alarm_description ?? ""}
              placeholder="อธิบายสิ่งที่เกิดขึ้น"
              className={inputClass}
            />
            {errors.alarm_description && (
              <p className={errorClass}>{errors.alarm_description}</p>
            )}
          </div>

          <div>
            <label htmlFor="alarm-cause" className={labelClass}>
              สาเหตุ (ถ้ามี)
            </label>
            <textarea
              id="alarm-cause"
              name="cause"
              rows={2}
              maxLength={1000}
              defaultValue={alarm?.cause ?? ""}
              placeholder="เช่น Sensor หลวม"
              className={inputClass}
            />
            {errors.cause && <p className={errorClass}>{errors.cause}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="alarm-occurred" className={labelClass}>
                วันที่/เวลาที่เกิด <span className="text-red-500">*</span>
              </label>
              <input
                id="alarm-occurred"
                name="occurred_at"
                type="datetime-local"
                required
                defaultValue={
                  editing && alarm ? toLocalDatetimeInput(alarm.occurred_at) : ""
                }
                className={`${inputClass} font-mono`}
              />
              {errors.occurred_at && (
                <p className={errorClass}>{errors.occurred_at}</p>
              )}
            </div>

            <div>
              <label htmlFor="alarm-status" className={labelClass}>
                สถานะ <span className="text-red-500">*</span>
              </label>
              <select
                id="alarm-status"
                name="status"
                defaultValue={alarm?.status ?? "Open"}
                required
                className={inputClass}
              >
                {ALARM_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && <p className={errorClass}>{errors.status}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={pending || machines.length === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}