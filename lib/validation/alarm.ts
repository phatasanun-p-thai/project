import { z } from "zod";

export const alarmStatusOptions = ["Open", "In Progress", "Closed"] as const;

export const alarmSchema = z.object({
  machine_id: z.string().min(1, "กรุณาเลือกเครื่องจักร"),
  alarm_code: z
    .string()
    .trim()
    .min(1, "กรุณากรอก Alarm Code")
    .max(32, "Alarm Code ต้องไม่เกิน 32 ตัวอักษร"),
  alarm_description: z
    .string()
    .trim()
    .min(1, "กรุณากรอกคำอธิบาย Alarm")
    .max(500, "คำอธิบายต้องไม่เกิน 500 ตัวอักษร"),
  cause: z
    .string()
    .trim()
    .max(1000, "สาเหตุต้องไม่เกิน 1,000 ตัวอักษร")
    .optional()
    .or(z.literal("")),
  occurred_at: z.string().min(1, "กรุณาระบุวันที่/เวลา"),
  status: z.enum(alarmStatusOptions).default("Open"),
});

export type AlarmInput = z.infer<typeof alarmSchema>;

export const alarmStatusSchema = z.object({
  alarmId: z.string().min(1, "ไม่พบ Alarm"),
  status: z.enum(alarmStatusOptions),
});

export type AlarmStatusInput = z.infer<typeof alarmStatusSchema>;

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