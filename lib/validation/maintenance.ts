import { z } from "zod";

export const maintenanceStatusOptions = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
] as const;

export const maintenanceSchema = z.object({
  machine_id: z.string().min(1, "กรุณาเลือกเครื่องจักร"),
  maintenance_type: z
    .string()
    .trim()
    .min(1, "กรุณากรอกประเภทการบำรุงรักษา")
    .max(100, "ประเภทต้องไม่เกิน 100 ตัวอักษร"),
  problem: z
    .string()
    .trim()
    .min(1, "กรุณากรอกปัญหาที่พบ")
    .max(1000, "ปัญหาต้องไม่เกิน 1,000 ตัวอักษร"),
  action_taken: z
    .string()
    .trim()
    .min(1, "กรุณากรอกการดำเนินการที่ทำ")
    .max(2000, "การดำเนินการต้องไม่เกิน 2,000 ตัวอักษร"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง"),
  status: z.enum(maintenanceStatusOptions).default("Scheduled"),
});

export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

/** ใช้เฉพาะ admin — ผู้ใช้ที่เลือกจะถูกตรวจสอบด้วยว่าเป็น role technician ฝั่ง server */
export const maintenanceTechnicianSchema = z.object({
  technician_id: z.string().min(1, "กรุณาเลือกช่างเทคนิค"),
});

export const maintenanceStatusSchema = z.object({
  recordId: z.string().min(1, "ไม่พบรายการ"),
  status: z.enum(maintenanceStatusOptions),
});

/** แปลง ZodError เป็น field error map สำหรับแสดงผลใต้ input */
export function zodToFieldErrors(
  error: z.ZodError
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}