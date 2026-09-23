"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  alarmSchema,
  alarmStatusSchema,
  zodToFieldErrors,
} from "@/lib/validation/alarm";
import type { AlarmStatus, Role } from "@/types/database";

export type AlarmFormState =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string>;
    };

/** RBAC ชั้น server — ทุก action ต้องเรียกก่อนแตะฐานข้อมูล */
async function requireRole(allowed: Role[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    redirect("/forbidden");
  }
  return profile;
}

function parseAlarmForm(formData: FormData) {
  return alarmSchema.safeParse({
    machine_id: String(formData.get("machine_id") ?? ""),
    alarm_code: String(formData.get("alarm_code") ?? ""),
    alarm_description: String(formData.get("alarm_description") ?? ""),
    cause: String(formData.get("cause") ?? ""),
    occurred_at: String(formData.get("occurred_at") ?? ""),
    status: String(formData.get("status") ?? "Open"),
  });
}

export async function createAlarm(
  _prev: AlarmFormState,
  formData: FormData
): Promise<AlarmFormState> {
  await requireRole(["admin"]);

  const parsed = parseAlarmForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }

  const { cause, occurred_at, ...rest } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.from("alarms").insert({
    ...rest,
    cause: cause ? cause : null,
    occurred_at: new Date(occurred_at).toISOString(),
  });

  if (error) {
    return {
      success: false,
      message: `เพิ่ม Alarm ไม่สำเร็จ: ${error.message}`,
    };
  }

  revalidatePath("/alarms");
  return { success: true, message: "เพิ่ม Alarm เรียบร้อยแล้ว" };
}

export async function updateAlarm(
  _prev: AlarmFormState,
  formData: FormData
): Promise<AlarmFormState> {
  await requireRole(["admin"]);

  const alarmId = String(formData.get("id") ?? "");
  if (!alarmId) {
    return { success: false, message: "ไม่พบ Alarm ที่ต้องการแก้ไข" };
  }

  const parsed = parseAlarmForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }

  const { cause, occurred_at, ...rest } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("alarms")
    .update({
      ...rest,
      cause: cause ? cause : null,
      occurred_at: new Date(occurred_at).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", alarmId);

  if (error) {
    return {
      success: false,
      message: `แก้ไข Alarm ไม่สำเร็จ: ${error.message}`,
    };
  }

  revalidatePath("/alarms");
  return { success: true, message: "แก้ไข Alarm เรียบร้อยแล้ว" };
}

export async function changeAlarmStatus(input: {
  alarmId: string;
  status: AlarmStatus;
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin", "technician"]);

  const parsed = alarmStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลสถานะไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("alarms")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.alarmId);

  if (error) {
    return { ok: false, error: `เปลี่ยนสถานะไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/alarms");
  return { ok: true };
}

export async function deleteAlarm(input: {
  alarmId: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);

  if (!input.alarmId) {
    return { ok: false, error: "ไม่พบ Alarm ที่ต้องการลบ" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("alarms")
    .delete()
    .eq("id", input.alarmId);

  if (error) {
    return { ok: false, error: `ลบ Alarm ไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/alarms");
  return { ok: true };
}