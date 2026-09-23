import { describe, expect, it } from "vitest";
import { filterMachines, isMachineFilterActive } from "@/lib/machines/filter";
import type { Machine } from "@/types/database";

const base: Machine = {
  id: "1",
  machine_id: "MC-001",
  machine_name: "CNC Machine 1",
  machine_type: "CNC",
  location: "Line 1 / Zone A",
  status: "Running",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function make(overrides: Partial<Machine>): Machine {
  return { ...base, ...overrides };
}

const machines = [
  make({ id: "1", machine_id: "MC-001", status: "Running", machine_type: "CNC" }),
  make({ id: "2", machine_id: "MC-002", machine_name: "Injection 1", machine_type: "Injection", status: "Stop" }),
  make({
    id: "3",
    machine_id: "CV-010",
    machine_name: "Conveyor A",
    machine_type: "Conveyor",
    status: "Alarm",
    location: "Line 2 / Zone B",
  }),
  make({
    id: "4",
    machine_id: "MC-003",
    machine_name: "CNC Machine 2",
    machine_type: "CNC",
    status: "Maintenance",
  }),
];

describe("filterMachines", () => {
  it("ส่งคืนรายการทั้งหมดเมื่อ filter ว่าง", () => {
    const result = filterMachines(machines, {
      search: "",
      status: "",
      machineType: "",
    });
    expect(result).toHaveLength(4);
  });

  it("ค้นหาตามรหัส / ชื่อ / ประเภท / ที่ตั้ง (case-insensitive)", () => {
    expect(filterMachines(machines, { search: "mc-", status: "", machineType: "" })).toHaveLength(3);
    expect(filterMachines(machines, { search: "conveyor", status: "", machineType: "" })).toHaveLength(1);
    expect(filterMachines(machines, { search: "zone b", status: "", machineType: "" })).toHaveLength(1);
    expect(filterMachines(machines, { search: "injection", status: "", machineType: "" })).toHaveLength(1);
  });

  it("กรองตามสถานะ", () => {
    const result = filterMachines(machines, {
      search: "",
      status: "Running",
      machineType: "",
    });
    expect(result.map((m) => m.machine_id)).toEqual(["MC-001"]);
  });

  it("กรองตามประเภทเครื่องจักร", () => {
    const result = filterMachines(machines, {
      search: "",
      status: "",
      machineType: "CNC",
    });
    expect(result).toHaveLength(2);
  });

  it("รวมเงื่อนไขหลายตัว (search + status + type)", () => {
    const result = filterMachines(machines, {
      search: "cnc",
      status: "Running",
      machineType: "CNC",
    });
    expect(result.map((m) => m.machine_id)).toEqual(["MC-001"]);
  });

  it("ไม่พบผลลัพธ์เมื่อเงื่อนไขไม่ตรง", () => {
    const result = filterMachines(machines, {
      search: "does-not-exist",
      status: "",
      machineType: "",
    });
    expect(result).toHaveLength(0);
  });
});

describe("isMachineFilterActive", () => {
  it("false เมื่อ filter ว่างทั้งหมด", () => {
    expect(
      isMachineFilterActive({ search: "", status: "", machineType: "" })
    ).toBe(false);
  });

  it("true เมื่อมีการกรองอย่างน้อยหนึ่งเงื่อนไข", () => {
    expect(
      isMachineFilterActive({ search: "x", status: "", machineType: "" })
    ).toBe(true);
    expect(
      isMachineFilterActive({ search: "", status: "Stop", machineType: "" })
    ).toBe(true);
    expect(
      isMachineFilterActive({ search: "", status: "", machineType: "CNC" })
    ).toBe(true);
  });
});