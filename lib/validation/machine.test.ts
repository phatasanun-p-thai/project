import { describe, expect, it } from "vitest";
import { machineSchema } from "@/lib/validation/machine";

describe("machineSchema", () => {
  const valid = {
    machine_id: "MC-001",
    machine_name: "CNC Machine 1",
    machine_type: "CNC",
    location: "Line 1",
    status: "Running",
  };

  it("รับข้อมูลที่ถูกต้อง", () => {
    const result = machineSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("required fields: รหัส / ชื่อ / ประเภท / ตำแหน่ง", () => {
    const result = machineSchema.safeParse({
      ...valid,
      machine_id: "",
      machine_name: "   ",
      machine_type: "",
      location: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining([
          "machine_id",
          "machine_name",
          "machine_type",
          "location",
        ])
      );
    }
  });

  it("รหัสเครื่องจักรมี format ผิด (มีตัวอักษรไทย/ช่องว่าง/สัญลักษณ์)", () => {
    for (const bad of ["MC 001", "เครื่อง001", "MC@01", "MC/01"]) {
      const result = machineSchema.safeParse({ ...valid, machine_id: bad });
      expect(result.success).toBe(false);
    }
  });

  it("default status เป็น Running ถ้าไม่ส่ง", () => {
    const { machine_id, machine_name, machine_type, location } = valid;
    const result = machineSchema.safeParse({ machine_id, machine_name, machine_type, location });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("Running");
  });

  it("status ที่ไม่ใช่ enum ถูกปฏิเสธ", () => {
    const result = machineSchema.safeParse({ ...valid, status: "Unknown" });
    expect(result.success).toBe(false);
  });
});