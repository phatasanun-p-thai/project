"use client";

import { useMemo, useState, useTransition } from "react";
import type { AlarmStatus, AlarmWithMachine, Machine } from "@/types/database";
import {
  changeAlarmStatus,
  deleteAlarm,
} from "@/lib/alarms/actions";
import {
  emptyAlarmFilters,
  filterAlarms,
  isAlarmFilterActive,
  type AlarmFilters,
} from "@/lib/alarms/filter";
import { AlarmFiltersBar } from "./alarm-filters-bar";
import { AlarmStats } from "./alarm-stats";
import { AlarmTable } from "./alarm-table";
import { AlarmEmptyState } from "./alarm-empty-state";
import { AlarmFormModal } from "./alarm-form-modal";
import { AlarmDeleteDialog } from "./alarm-delete-dialog";
import { MachineInfoPanel } from "./machine-info-panel";

interface Props {
  alarms: AlarmWithMachine[];
  machines: Machine[];
  isAdmin: boolean;
}

type Notice = { type: "success" | "error"; text: string } | null;
type ModalState =
  | { mode: "create" }
  | { mode: "edit"; alarm: AlarmWithMachine }
  | null;

export function AlarmManager({ alarms, machines, isAdmin }: Props) {
  const [filters, setFilters] = useState<AlarmFilters>(emptyAlarmFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [alarmToDelete, setAlarmToDelete] =
    useState<AlarmWithMachine | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isPending, startTransition] = useTransition();

  const alarmCodes = useMemo(
    () => Array.from(new Set(alarms.map((a) => a.alarm_code))).sort(),
    [alarms]
  );

  const filtered = useMemo(() => filterAlarms(alarms, filters), [alarms, filters]);

  const selectedMachine = useMemo(
    () =>
      filters.machineId
        ? machines.find((m) => m.id === filters.machineId) ?? null
        : null,
    [filters.machineId, machines]
  );

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const handleStatusChange = (alarmId: string, status: AlarmStatus) => {
    if (isPending) return;
    startTransition(async () => {
      const result = await changeAlarmStatus({ alarmId, status });
      if (result.ok) {
        showNotice("success", "เปลี่ยนสถานะ Alarm เรียบร้อยแล้ว");
      } else {
        showNotice("error", result.error ?? "เปลี่ยนสถานะไม่สำเร็จ");
      }
    });
  };

  const handleDelete = () => {
    if (!alarmToDelete) return;
    startTransition(async () => {
      const result = await deleteAlarm({ alarmId: alarmToDelete.id });
      if (result.ok) {
        if (selectedId === alarmToDelete.id) setSelectedId(null);
        setAlarmToDelete(null);
        showNotice("success", "ลบ Alarm เรียบร้อยแล้ว");
      } else {
        showNotice("error", result.error ?? "ลบ Alarm ไม่สำเร็จ");
      }
    });
  };

  const openCreate = () => setModal({ mode: "create" });

  return (
    <div className="space-y-6">
      {notice && (
        <div
          role="status"
          className={`rounded-md px-4 py-3 text-sm font-medium shadow-sm ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
          }`}
        >
          {notice.text}
        </div>
      )}

      <AlarmStats alarms={alarms} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <AlarmFiltersBar
            filters={filters}
            machines={machines}
            alarmCodes={alarmCodes}
            onChange={setFilters}
            onReset={() => setFilters(emptyAlarmFilters)}
          />
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + เพิ่ม Alarm
          </button>
        )}
      </div>

      {selectedMachine && (
        <MachineInfoPanel machine={selectedMachine} alarms={alarms} />
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          แสดง {filtered.length} / {alarms.length} รายการ
        </span>
        {isAlarmFilterActive(filters) && (
          <span className="text-xs">มีการกรองข้อมูล</span>
        )}
      </div>

      {alarms.length === 0 ? (
        <AlarmEmptyState
          variant="noData"
          isAdmin={isAdmin}
          onCreate={openCreate}
        />
      ) : filtered.length === 0 ? (
        <AlarmEmptyState
          variant="noResult"
          isAdmin={isAdmin}
          onReset={() => setFilters(emptyAlarmFilters)}
        />
      ) : (
        <AlarmTable
          alarms={filtered}
          selectedId={selectedId}
          isAdmin={isAdmin}
          statusPending={isPending}
          onSelect={setSelectedId}
          onStatusChange={handleStatusChange}
          onEdit={(alarm) => setModal({ mode: "edit", alarm })}
          onDelete={(alarm) => setAlarmToDelete(alarm)}
        />
      )}

      {modal && (
        <AlarmFormModal
          key={modal.mode === "edit" ? modal.alarm.id : "create"}
          mode={modal.mode}
          alarm={modal.mode === "edit" ? modal.alarm : null}
          machines={machines}
          onClose={() => setModal(null)}
          onSaved={(message) => {
            setModal(null);
            showNotice("success", message);
          }}
        />
      )}

      {alarmToDelete && (
        <AlarmDeleteDialog
          alarm={alarmToDelete}
          pending={isPending}
          onClose={() => setAlarmToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}