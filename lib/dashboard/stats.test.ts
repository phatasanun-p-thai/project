import { describe, expect, it } from "vitest";
import {
  summarizeMachines,
  summarizeAlarms,
  summarizeMaintenance,
} from "@/lib/dashboard/stats";
import type {
  Alarm,
  Machine,
  MachineStatus,
  MaintenanceRecord,
} from "@/types/database";

describe("summarizeMachines", () => {
  function machine(status: MachineStatus, id = status + "x"): Machine {
    return {
      id,
      machine_id: id,
      machine_name: id,
      machine_type: "CNC",
      location: "L",
      status,
      created_at: "",
      updated_at: "",
    };
  }

  it("นับ total และแยกสถานะได้ถูกต้อง", () => {
    const result = summarizeMachines([
      machine("Running"),
      machine("Running"),
      machine("Stop"),
      machine("Alarm"),
      machine("Maintenance"),
    ]);
    expect(result).toEqual({
      total: 5,
      Running: 2,
      Stop: 1,
      Alarm: 1,
      Maintenance: 1,
    });
  });

  it("ค่าว่าง = 0 ทั้งหมด", () => {
    expect(summarizeMachines([])).toEqual({
      total: 0,
      Running: 0,
      Stop: 0,
      Alarm: 0,
      Maintenance: 0,
    });
  });
});

describe("summarizeAlarms", () => {
  function alarm(status: Alarm["status"], id = "x"): Alarm {
    return {
      id,
      machine_id: "m",
      alarm_code: id,
      alarm_description: "d",
      cause: null,
      occurred_at: "",
      status,
      created_at: "",
      updated_at: "",
    };
  }

  it("นับ total และแยกสถานะ alarm", () => {
    const result = summarizeAlarms([
      alarm("Open"),
      alarm("Open"),
      alarm("In Progress"),
      alarm("Closed"),
    ]);
    expect(result).toEqual({ total: 4, Open: 2, "In Progress": 1, Closed: 1 });
  });
});

describe("summarizeMaintenance", () => {
  function record(status: MaintenanceRecord["status"], id = "x"): MaintenanceRecord {
    return {
      id,
      machine_id: "m",
      maintenance_type: "t",
      problem: "p",
      action_taken: "a",
      technician_id: null,
      date: "2026-01-01",
      status,
      created_at: "",
      updated_at: "",
    };
  }

  it("นับ total และแยกสถานะ maintenance", () => {
    const result = summarizeMaintenance([
      record("Scheduled"),
      record("In Progress"),
      record("Completed"),
      record("Cancelled"),
    ]);
    expect(result).toEqual({
      total: 4,
      Scheduled: 1,
      "In Progress": 1,
      Completed: 1,
      Cancelled: 1,
    });
  });
});