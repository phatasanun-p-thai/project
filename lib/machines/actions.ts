"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  machineSchema,
  machineDeleteSchema,
  zodToFieldErrors,
} from "@/lib/validation/machine";
import type { Profile } from "@/types/database";

export type MachineFormState =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string>;
    };

/** RBAC ชั้น server — การจัดการเครื่องจักร อนุญาตเฉพาะ admin */
async function requireMachineRole(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/forbidden");
  }
  return profile;
}

function parseMachineForm(formData: FormData) {
  return machineSchema.safeParse({
    machine_id: String(formData.get("machine_id") ?? ""),
    machine_name: String(formData.get("machine_name") ?? ""),
    machine_type: String(formData.get("machine_type") ?? ""),
    location: String(formData.get("location") ?? ""),
    status: String(formData.get("status") ?? "Running"),
  });
}

async function isMachineIdDuplicate(
  machineId: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("machines")
    .select("id")
    .eq("machine_id", machineId);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}

export async function createMachine(
  _prev: MachineFormState,
  formData: FormData
): Promise<MachineFormState> {
  await requireMachineRole();

  const parsed = parseMachineForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }

  const duplicate = await isMachineIdDuplicate(parsed.data.machine_id);
  if (duplicate) {
    return {
      success: false,
      message: "มีเครื่องจักรที่ใช้รหัสนี้อยู่แล้ว",
      fieldErrors: { machine_id: "รหัสเครื่องจักรนี้มีอยู่แล้วในระบบ" },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("machines").insert(parsed.data);

  if (error) {
    const message =
      error.message.toLowerCase().includes("duplicate key value") ||
      error.message.includes("unique constraint")
        ? "มีเครื่องจักรที่ใช้รหัสนี้อยู่แล้ว"
        : `เพิ่มเครื่องจักรไม่สำเร็จ: ${error.message}`;
    return { success: false, message };
  }

  revalidatePath("/machines");
  revalidatePath("/alarms");
  revalidatePath("/maintenance");
  return { success: true, message: "เพิ่มเครื่องจักรเรียบร้อยแล้ว" };
}

export async function updateMachine(
  _prev: MachineFormState,
  formData: FormData
): Promise<MachineFormState> {
  await requireMachineRole();

  const machineId = String(formData.get("id") ?? "");
  if (!machineId) {
    return { success: false, message: "ไม่พบเครื่องจักรที่ต้องการแก้ไข" };
  }

  const parsed = parseMachineForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }

  const duplicate = await isMachineIdDuplicate(parsed.data.machine_id, machineId);
  if (duplicate) {
    return {
      success: false,
      message: "มีเครื่องจักรที่ใช้รหัสนี้อยู่แล้ว",
      fieldErrors: { machine_id: "รหัสเครื่องจักรนี้มีอยู่แล้วในระบบ" },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("machines")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", machineId);

  if (error) {
    const message =
      error.message.toLowerCase().includes("duplicate key value") ||
      error.message.includes("unique constraint")
        ? "มีเครื่องจักรที่ใช้รหัสนี้อยู่แล้ว"
        : `แก้ไขเครื่องจักรไม่สำเร็จ: ${error.message}`;
    return { success: false, message };
  }

  revalidatePath("/machines");
  revalidatePath("/alarms");
  revalidatePath("/maintenance");
  return { success: true, message: "แก้ไขเครื่องจักรเรียบร้อยแล้ว" };
}

export async function deleteMachine(input: {
  machineId: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireMachineRole();

  const parsed = machineDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("machines")
    .delete()
    .eq("id", parsed.data.machineId);

  if (error) {
    return { ok: false, error: `ลบเครื่องจักรไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/machines");
  revalidatePath("/alarms");
  revalidatePath("/maintenance");
  return { ok: true };
}