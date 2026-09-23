"use client";

import { useMemo, useState, useTransition } from "react";
import type {
  MaintenanceStatus,
  MaintenanceWithRelations,
  Machine,
  Profile,
} from "@/types/database";
import {
  changeMaintenanceStatus,
  deleteMaintenance,
} from "@/lib/maintenance/actions";
import {
  emptyMaintenanceFilters,
  filterMaintenance,
  isMaintenanceFilterActive,
  type MaintenanceFilters,
} from "@/lib/maintenance/filter";
import { MaintenanceFiltersBar } from "./maintenance-filters-bar";
import { MaintenanceStats } from "./maintenance-stats";
import { MaintenanceTable } from "./maintenance-table";
import { MaintenanceEmptyState } from "./maintenance-empty-state";
import { MaintenanceFormModal } from "./maintenance-form-modal";
import { MaintenanceDeleteDialog } from "./maintenance-delete-dialog";

interface Props {
  records: MaintenanceWithRelations[];
  machines: Machine[];
  technicians: Profile[];
  isAdmin: boolean;
  currentProfile: Profile;
}

type Notice = { type: "success" | "error"; text: string } | null;
type ModalState =
  | { mode: "create" }
  | { mode: "edit"; record: MaintenanceWithRelations }
  | null;

export function MaintenanceManager({
  records,
  machines,
  technicians,
  isAdmin,
  currentProfile,
}: Props) {
  const [filters, setFilters] = useState<MaintenanceFilters>(
    emptyMaintenanceFilters
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [recordToDelete, setRecordToDelete] =
    useState<MaintenanceWithRelations | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => filterMaintenance(records, filters),
    [records, filters]
  );

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const handleStatusChange = (
    recordId: string,
    status: MaintenanceStatus
  ) => {
    if (isPending) return;
    startTransition(async () => {
      const result = await changeMaintenanceStatus({ recordId, status });
      if (result.ok) {
        showNotice("success", "เปลี่ยนสถานะ Maintenance เรียบร้อยแล้ว");
      } else {
        showNotice("error", result.error ?? "เปลี่ยนสถานะไม่สำเร็จ");
      }
    });
  };

  const handleDelete = () => {
    if (!recordToDelete) return;
    startTransition(async () => {
      const result = await deleteMaintenance({
        recordId: recordToDelete.id,
      });
      if (result.ok) {
        if (selectedId === recordToDelete.id) setSelectedId(null);
        setRecordToDelete(null);
        showNotice("success", "ลบรายการ Maintenance เรียบร้อยแล้ว");
      } else {
        showNotice("error", result.error ?? "ลบรายการไม่สำเร็จ");
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

      <MaintenanceStats records={records} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <MaintenanceFiltersBar
            filters={filters}
            machines={machines}
            technicians={technicians}
            onChange={setFilters}
            onReset={() => setFilters(emptyMaintenanceFilters)}
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          + เพิ่ม Maintenance
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          แสดง {filtered.length} / {records.length} รายการ
        </span>
        {isMaintenanceFilterActive(filters) && (
          <span className="text-xs">มีการกรองข้อมูล</span>
        )}
      </div>

      {records.length === 0 ? (
        <MaintenanceEmptyState variant="noData" onCreate={openCreate} />
      ) : filtered.length === 0 ? (
        <MaintenanceEmptyState
          variant="noResult"
          onReset={() => setFilters(emptyMaintenanceFilters)}
        />
      ) : (
        <MaintenanceTable
          records={filtered}
          selectedId={selectedId}
          isAdmin={isAdmin}
          currentProfileId={currentProfile.id}
          statusPending={isPending}
          onSelect={setSelectedId}
          onStatusChange={handleStatusChange}
          onEdit={(record) => setModal({ mode: "edit", record })}
          onDelete={(record) => setRecordToDelete(record)}
        />
      )}

      {modal && (
        <MaintenanceFormModal
          key={modal.mode === "edit" ? modal.record.id : "create"}
          mode={modal.mode}
          record={modal.mode === "edit" ? modal.record : null}
          machines={machines}
          technicians={technicians}
          isAdmin={isAdmin}
          currentProfile={currentProfile}
          onClose={() => setModal(null)}
          onSaved={(message) => {
            setModal(null);
            showNotice("success", message);
          }}
        />
      )}

      {recordToDelete && (
        <MaintenanceDeleteDialog
          record={recordToDelete}
          pending={isPending}
          onClose={() => setRecordToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}