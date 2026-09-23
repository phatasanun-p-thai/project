"use client";

import { useMemo, useState, useTransition } from "react";
import type { Machine } from "@/types/database";
import { deleteMachine } from "@/lib/machines/actions";
import {
  emptyMachineFilters,
  filterMachines,
  isMachineFilterActive,
  type MachineFilters,
} from "@/lib/machines/filter";
import { MachineFiltersBar } from "./machine-filters-bar";
import { MachineStats } from "./machine-stats";
import { MachineTable } from "./machine-table";
import { MachineEmptyState } from "./machine-empty-state";
import { MachineFormModal } from "./machine-form-modal";
import { MachineDeleteDialog } from "./machine-delete-dialog";

interface Props {
  machines: Machine[];
  isAdmin: boolean;
}

type Notice = { type: "success" | "error"; text: string } | null;
type ModalState =
  | { mode: "create" }
  | { mode: "edit"; machine: Machine }
  | null;

export function MachineManager({ machines, isAdmin }: Props) {
  const [filters, setFilters] = useState<MachineFilters>(emptyMachineFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isPending, startTransition] = useTransition();

  const machineTypes = useMemo(
    () =>
      Array.from(new Set(machines.map((m) => m.machine_type).filter(Boolean)))
        .sort()
        .map((t) => t as string),
    [machines]
  );

  const filtered = useMemo(
    () => filterMachines(machines, filters),
    [machines, filters]
  );

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const handleDelete = () => {
    if (!machineToDelete) return;
    startTransition(async () => {
      const result = await deleteMachine({ machineId: machineToDelete.id });
      if (result.ok) {
        if (selectedId === machineToDelete.id) setSelectedId(null);
        setMachineToDelete(null);
        showNotice("success", "ลบเครื่องจักรเรียบร้อยแล้ว");
      } else {
        showNotice("error", result.error ?? "ลบเครื่องจักรไม่สำเร็จ");
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

      <MachineStats machines={machines} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <MachineFiltersBar
            filters={filters}
            machineTypes={machineTypes}
            onChange={setFilters}
            onReset={() => setFilters(emptyMachineFilters)}
          />
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + เพิ่มเครื่องจักร
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          แสดง {filtered.length} / {machines.length} รายการ
        </span>
        {isMachineFilterActive(filters) && (
          <span className="text-xs">มีการกรองข้อมูล</span>
        )}
      </div>

      {machines.length === 0 ? (
        <MachineEmptyState
          variant="noData"
          isAdmin={isAdmin}
          onCreate={openCreate}
        />
      ) : filtered.length === 0 ? (
        <MachineEmptyState
          variant="noResult"
          isAdmin={isAdmin}
          onReset={() => setFilters(emptyMachineFilters)}
        />
      ) : (
        <MachineTable
          machines={filtered}
          selectedId={selectedId}
          isAdmin={isAdmin}
          onSelect={setSelectedId}
          onEdit={(machine) => setModal({ mode: "edit", machine })}
          onDelete={(machine) => setMachineToDelete(machine)}
        />
      )}

      {modal && (
        <MachineFormModal
          key={modal.mode === "edit" ? modal.machine.id : "create"}
          mode={modal.mode}
          machine={modal.mode === "edit" ? modal.machine : null}
          onClose={() => setModal(null)}
          onSaved={(message) => {
            setModal(null);
            showNotice("success", message);
          }}
        />
      )}

      {machineToDelete && (
        <MachineDeleteDialog
          machine={machineToDelete}
          pending={isPending}
          onClose={() => setMachineToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}