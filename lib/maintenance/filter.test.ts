import { describe, expect, it } from "vitest";
import { filterMaintenance, isMaintenanceFilterActive } from "@/lib/maintenance/filter";
import type { MaintenanceWithRelations } from "@/types/database";

const base = {
  id: "1",
  machine_id: "m1",
  maintenance_type: "Preventive",
  problem: "Bearing noise",
  action_taken: "Replaced bearing",
  technician_id: "t1",
  date: "2026-09-20",
  status: "Completed" as const,
  created_at: "2026-09-20T08:30:00.000Z",
  updated_at: "2026-09-20T08:30:00.000Z",
  machines: {
    id: "m1",
    machine_id: "MC-001",
    machine_name: "CNC Machine 1",
    machine_type: "CNC",
    location: "Line 1",
    status: "Running" as const,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  technician: {
    id: "t1",
    email: "tech@example.com",
    full_name: "สมชาย ช่าง",
    role: "technician" as const,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
};

function make(overrides: Partial<MaintenanceWithRelations>): MaintenanceWithRelations {
  return { ...base, ...overrides } as MaintenanceWithRelations;
}

const records: MaintenanceWithRelations[] = [
  make({
    id: "1",
    status: "Completed",
    date: "2026-09-20",
    technician_id: "t1",
    problem: "Bearing noise",
  }),
  make({
    id: "2",
    status: "Scheduled",
    date: "2026-09-25",
    technician_id: "t2",
    problem: "Hydraulic leak",
    action_taken: "Tightened fittings",
    technician: {
      ...base.technician,
      id: "t2",
      full_name: "สุนทร ช่าง",
    },
  }),
  make({
    id: "3",
    status: "In Progress",
    date: "2026-09-22",
    technician_id: "t1",
    problem: "Gear wear",
    action_taken: "Replaced gear",
  }),
];

const empty = {
  search: "",
  machineId: "",
  technicianId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
} as const;

describe("filterMaintenance", () => {
  it("ส่งคืนทั้งหมดเมื่อไม่มี filter", () => {
    expect(filterMaintenance(records, empty)).toHaveLength(3);
  });

  it("search ตาม type/problem/action/ชื่อเครื่อง/ชื่อช่าง", () => {
    expect(filterMaintenance(records, { ...empty, search: "bearing" })).toHaveLength(1);
    expect(filterMaintenance(records, { ...empty, search: "สมชาย" })).toHaveLength(2);
    expect(filterMaintenance(records, { ...empty, search: "cnc" })).toHaveLength(3);
  });

  it("กรองตาม technicianId", () => {
    expect(filterMaintenance(records, { ...empty, technicianId: "t1" })).toHaveLength(2);
  });

  it("กรองตาม status", () => {
    expect(filterMaintenance(records, { ...empty, status: "Scheduled" })).toHaveLength(1);
  });

  it("กรองช่วงวันที่", () => {
    expect(filterMaintenance(records, { ...empty, dateFrom: "2026-09-21" })).toHaveLength(2);
    expect(
      filterMaintenance(records, { ...empty, dateFrom: "2026-09-22", dateTo: "2026-09-22" })
    ).toHaveLength(1);
  });
});

describe("isMaintenanceFilterActive", () => {
  it("false เมื่อไม่มี filter", () =>
    expect(isMaintenanceFilterActive(empty)).toBe(false));
  it("true เมื่อมีอย่างน้อยหนึ่งเงื่อนไข", () =>
    expect(isMaintenanceFilterActive({ ...empty, status: "Completed" })).toBe(true));
});