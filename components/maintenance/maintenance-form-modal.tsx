"use client";

import { useEffect, useActionState } from "react";
import {
  createMaintenance,
  updateMaintenance,
  type MaintenanceFormState,
} from "@/lib/maintenance/actions";
import { MAINTENANCE_STATUS_OPTIONS } from "@/lib/maintenance/format";
import type {
  Machine,
  MaintenanceWithRelations,
  Profile,
} from "@/types/database";

const initialState: MaintenanceFormState = { success: false, message: "" };

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "mt-1 text-xs text-red-600";

interface Props {
  mode: "create" | "edit";
  record: MaintenanceWithRelations | null;
  machines: Machine[];
  technicians: Profile[];
  isAdmin: boolean;
  currentProfile: Profile;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function MaintenanceFormModal({
  mode,
  record,
  machines,
  technicians,
  isAdmin,
  currentProfile,
  onClose,
  onSaved,
}: Props) {
  const [createState, createAction, createPending] = useActionState<
    MaintenanceFormState,
    FormData
  >(createMaintenance, initialState);
  const [editState, editAction, editPending] = useActionState<
    MaintenanceFormState,
    FormData
  >(updateMaintenance, initialState);

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
              {editing ? "แก้ไขรายการ Maintenance" : "เพิ่มรายการ Maintenance"}
            </h2>
            {editing && record && (
              <p className="mt-0.5 text-xs text-gray-500">
                {record.machines?.machine_name ?? "ไม่พบเครื่องจักร"} ·{" "}
                {record.maintenance_type}
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
          {editing && <input type="hidden" name="id" value={record?.id ?? ""} />}

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
            <label htmlFor="maintenance-machine" className={labelClass}>
              เครื่องจักร <span className="text-red-500">*</span>
            </label>
            <select
              id="maintenance-machine"
              name="machine_id"
              defaultValue={record?.machine_id ?? ""}
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
            <label htmlFor="maintenance-type" className={labelClass}>
              ประเภทการบำรุงรักษา <span className="text-red-500">*</span>
            </label>
            <input
              id="maintenance-type"
              name="maintenance_type"
              type="text"
              required
              maxLength={100}
              defaultValue={record?.maintenance_type ?? ""}
              placeholder="เช่น Preventive / Corrective / ตรวจเช็ครายเดือน"
              className={inputClass}
            />
            {errors.maintenance_type && (
              <p className={errorClass}>{errors.maintenance_type}</p>
            )}
          </div>

          <div>
            <label htmlFor="maintenance-problem" className={labelClass}>
              ปัญหาที่พบ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="maintenance-problem"
              name="problem"
              required
              rows={2}
              maxLength={1000}
              defaultValue={record?.problem ?? ""}
              placeholder="เช่น เครื่องมีเสียงดังผิดปกติ"
              className={inputClass}
            />
            {errors.problem && <p className={errorClass}>{errors.problem}</p>}
          </div>

          <div>
            <label htmlFor="maintenance-action" className={labelClass}>
              การดำเนินการที่ทำ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="maintenance-action"
              name="action_taken"
              required
              rows={3}
              maxLength={2000}
              defaultValue={record?.action_taken ?? ""}
              placeholder="เช่น เปลี่ยนสายพานและปรับความตึง"
              className={inputClass}
            />
            {errors.action_taken && (
              <p className={errorClass}>{errors.action_taken}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="maintenance-date" className={labelClass}>
                วันที่ทำการบำรุงรักษา <span className="text-red-500">*</span>
              </label>
              <input
                id="maintenance-date"
                name="date"
                type="date"
                required
                defaultValue={editing && record ? record.date : ""}
                className={`${inputClass} font-mono`}
              />
              {errors.date && <p className={errorClass}>{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="maintenance-status" className={labelClass}>
                สถานะ <span className="text-red-500">*</span>
              </label>
              <select
                id="maintenance-status"
                name="status"
                defaultValue={record?.status ?? "Scheduled"}
                required
                className={inputClass}
              >
                {MAINTENANCE_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && <p className={errorClass}>{errors.status}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="maintenance-technician" className={labelClass}>
              ช่างเทคนิค <span className="text-red-500">*</span>
            </label>
            {isAdmin ? (
              <select
                id="maintenance-technician"
                name="technician_id"
                defaultValue={record?.technician_id ?? ""}
                required
                className={inputClass}
              >
                <option value="">-- เลือกช่างเทคนิค --</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.full_name} ({technician.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1 flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <span className="font-medium">
                  {currentProfile.full_name}
                </span>
                <span className="text-xs text-gray-400">
                  (บันทึกเป็นช่างเทคนิคตามผู้ใช้ที่เข้าสู่ระบบ — เปลี่ยนไม่ได้)
                </span>
              </div>
            )}
            {errors.technician_id && (
              <p className={errorClass}>{errors.technician_id}</p>
            )}
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