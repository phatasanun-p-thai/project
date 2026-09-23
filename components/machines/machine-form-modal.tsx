"use client";

import { useEffect, useActionState } from "react";
import {
  createMachine,
  updateMachine,
  type MachineFormState,
} from "@/lib/machines/actions";
import { MACHINE_STATUS_OPTIONS } from "@/lib/machines/format";
import type { Machine } from "@/types/database";

const initialState: MachineFormState = { success: false, message: "" };

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "mt-1 text-xs text-red-600";

interface Props {
  mode: "create" | "edit";
  machine: Machine | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function MachineFormModal({
  mode,
  machine,
  onClose,
  onSaved,
}: Props) {
  const [createState, createAction, createPending] = useActionState<
    MachineFormState,
    FormData
  >(createMachine, initialState);
  const [editState, editAction, editPending] = useActionState<
    MachineFormState,
    FormData
  >(updateMachine, initialState);

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
              {editing ? "แก้ไขเครื่องจักร" : "เพิ่มเครื่องจักร"}
            </h2>
            {editing && machine && (
              <p className="mt-0.5 font-mono text-xs text-gray-500">
                {machine.machine_id}
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
          {editing && <input type="hidden" name="id" value={machine?.id ?? ""} />}

          {formError && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {formError}
            </p>
          )}

          <div>
            <label htmlFor="machine-id" className={labelClass}>
              รหัสเครื่องจักร <span className="text-red-500">*</span>
            </label>
            <input
              id="machine-id"
              name="machine_id"
              type="text"
              required
              maxLength={50}
              defaultValue={machine?.machine_id ?? ""}
              placeholder="เช่น MC-001"
              className={`${inputClass} font-mono`}
            />
            {errors.machine_id && (
              <p className={errorClass}>{errors.machine_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="machine-name" className={labelClass}>
              ชื่อเครื่องจักร <span className="text-red-500">*</span>
            </label>
            <input
              id="machine-name"
              name="machine_name"
              type="text"
              required
              maxLength={100}
              defaultValue={machine?.machine_name ?? ""}
              placeholder="เช่น CNC Machine 1"
              className={inputClass}
            />
            {errors.machine_name && (
              <p className={errorClass}>{errors.machine_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="machine-type" className={labelClass}>
                ประเภทเครื่องจักร <span className="text-red-500">*</span>
              </label>
              <input
                id="machine-type"
                name="machine_type"
                type="text"
                required
                maxLength={100}
                defaultValue={machine?.machine_type ?? ""}
                placeholder="เช่น CNC, Injection, Conveyor"
                className={inputClass}
              />
              {errors.machine_type && (
                <p className={errorClass}>{errors.machine_type}</p>
              )}
            </div>

            <div>
              <label htmlFor="machine-location" className={labelClass}>
                ตำแหน่งที่ตั้ง <span className="text-red-500">*</span>
              </label>
              <input
                id="machine-location"
                name="location"
                type="text"
                required
                maxLength={200}
                defaultValue={machine?.location ?? ""}
                placeholder="เช่น Line 1 / Zone A"
                className={inputClass}
              />
              {errors.location && (
                <p className={errorClass}>{errors.location}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="machine-status" className={labelClass}>
              สถานะ <span className="text-red-500">*</span>
            </label>
            <select
              id="machine-status"
              name="status"
              defaultValue={machine?.status ?? "Running"}
              required
              className={inputClass}
            >
              {MACHINE_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status && <p className={errorClass}>{errors.status}</p>}
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
              disabled={pending}
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