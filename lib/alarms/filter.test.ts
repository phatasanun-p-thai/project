import { describe, expect, it } from "vitest";
import { filterAlarms, isAlarmFilterActive } from "@/lib/alarms/filter";
import type { AlarmWithMachine } from "@/types/database";

const base = {
  id: "1",
  machine_id: "m1",
  alarm_code: "E-101",
  alarm_description: "Over temperature",
  cause: "Sensor",
  occurred_at: "2026-09-20T08:30:00.000Z",
  status: "Open" as const,
  created_at: "2026-09-20T08:30:00.000Z",
  updated_at: "2026-09-20T08:30:00.000Z",
  machines: {
    id: "m1",
    machine_id: "MC-001",
    machine_name: "CNC Machine 1",
    machine_type: "CNC",
    location: "Line 1",
    status: "Alarm" as const,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
};

function make(overrides: Partial<AlarmWithMachine>): AlarmWithMachine {
  return { ...base, ...overrides } as AlarmWithMachine;
}

const alarms: AlarmWithMachine[] = [
  make({
    id: "1",
    alarm_code: "E-101",
    status: "Open",
    occurred_at: "2026-09-20T08:30:00.000Z",
    alarm_description: "Over temperature",
  }),
  make({
    id: "2",
    alarm_code: "E-102",
    status: "In Progress",
    occurred_at: "2026-09-21T10:00:00.000Z",
    alarm_description: "Low pressure",
  }),
  make({
    id: "3",
    alarm_code: "W-500",
    status: "Closed",
    occurred_at: "2026-09-22T12:00:00.000Z",
    alarm_description: "Maintenance due",
  }),
];

const empty = {
  search: "",
  machineId: "",
  alarmCode: "",
  status: "",
  dateFrom: "",
  dateTo: "",
} as const;

describe("filterAlarms", () => {
  it("ส่งคืนทั้งหมดเมื่อไม่มี filter", () => {
    expect(filterAlarms(alarms, empty)).toHaveLength(3);
  });

  it("search ตาม alarm_code / คำอธิบาย / ชื่อเครื่อง", () => {
    expect(filterAlarms(alarms, { ...empty, search: "E-1" })).toHaveLength(2);
    expect(filterAlarms(alarms, { ...empty, search: "over tem" })).toHaveLength(1);
    expect(filterAlarms(alarms, { ...empty, search: "cnc" })).toHaveLength(3);
  });

  it("กรองตาม status", () => {
    expect(filterAlarms(alarms, { ...empty, status: "Open" })).toHaveLength(1);
  });

  it("กรองตาม alarmCode", () => {
    expect(filterAlarms(alarms, { ...empty, alarmCode: "W-500" })).toHaveLength(1);
  });

  it("กรองช่วงวันที่", () => {
    expect(
      filterAlarms(alarms, { ...empty, dateFrom: "2026-09-21" })
    ).toHaveLength(2);
    expect(
      filterAlarms(alarms, { ...empty, dateFrom: "2026-09-21", dateTo: "2026-09-21" })
    ).toHaveLength(1);
  });
});

describe("isAlarmFilterActive", () => {
  it("false เมื่อไม่มี filter", () => expect(isAlarmFilterActive(empty)).toBe(false));
  it("true เมื่อมีอย่างน้อยหนึ่งเงื่อนไข", () =>
    expect(isAlarmFilterActive({ ...empty, status: "Open" })).toBe(true));
});