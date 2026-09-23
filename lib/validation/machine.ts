import { z } from "zod";

export const machineStatusOptions = [
  "Running",
  "Stop",
  "Alarm",
  "Maintenance",
] as const;

export const machineSchema = z.object({
  machine_id: z
    .string()
    .trim()
    .min(1, "กรุณากรอกรหัสเครื่องจักร")
    .max(50, "รหัสเครื่องจักรต้องไม่เกิน 50 ตัวอักษร")
    .regex(
      /^[A-Za-z0-9._-]+$/,
      "รหัสเครื่องจักรใช้ตัวอักษร ตัวเลข และ . _ - เท่านั้น"
    ),
  machine_name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อเครื่องจักร")
    .max(100, "ชื่อเครื่องจักรต้องไม่เกิน 100 ตัวอักษร"),
  machine_type: z
    .string()
    .trim()
    .min(1, "กรุณากรอกประเภทเครื่องจักร")
    .max(100, "ประเภทต้องไม่เกิน 100 ตัวอักษร"),
  location: z
    .string()
    .trim()
    .min(1, "กรุณากรอกตำแหน่งที่ตั้ง")
    .max(200, "ตำแหน่งต้องไม่เกิน 200 ตัวอักษร"),
  status: z.enum(machineStatusOptions).default("Running"),
});

export type MachineInput = z.infer<typeof machineSchema>;

export const machineDeleteSchema = z.object({
  machineId: z.string().min(1, "ไม่พบเครื่องจักร"),
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