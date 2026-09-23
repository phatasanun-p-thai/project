"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  maintenanceSchema,
  maintenanceStatusSchema,
  maintenanceTechnicianSchema,
  zodToFieldErrors,
} from "@/lib/validation/maintenance";
import type {
  MaintenanceStatus,
  Profile,
  Role,
} from "@/types/database";

export type MaintenanceFormState =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string>;
    };

/** RBAC ชั้น server — ทุก action ต้องเรียกก่อนแตะฐานข้อมูล */
async function requireServerRole(allowed: Role[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    redirect("/forbidden");
  }
  return profile;
}

/** ตรวจสอบว่า id เป็น profile ที่มี role technician จริง (กันการปลอมเป็น user อื่น) */
async function findTechnician(
  technicianId: string
): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", technicianId)
    .eq("role", "technician")
    .maybeSingle();
  return error ? null : (data ?? null);
}

function parseMaintenanceForm(formData: FormData) {
  return maintenanceSchema.safeParse({
    machine_id: String(formData.get("machine_id") ?? ""),
    maintenance_type: String(formData.get("maintenance_type") ?? ""),
    problem: String(formData.get("problem") ?? ""),
    action_taken: String(formData.get("action_taken") ?? ""),
    date: String(formData.get("date") ?? ""),
    status: String(formData.get("status") ?? "Scheduled"),
  });
}

export async function createMaintenance(
  _prev: MaintenanceFormState,
  formData: FormData
): Promise<MaintenanceFormState> {
  const profile = await requireServerRole(["admin", "technician"]);

  const parsed = parseMaintenanceForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  // ช่างเทคนิคถูกกำหนดฝั่ง server ไม่รับจาก frontend
  // - admin: เลือกจากรายชื่อช่างเทคนิค (ตรวจ role จริง)
  // - technician: ใช้ตัวตนจาก session เสมอ ห้ามปลอมเป็นคนอื่น
  let technician_id: string;
  if (profile.role === "admin") {
    const techParsed = maintenanceTechnicianSchema.safeParse({
      technician_id: String(formData.get("technician_id") ?? ""),
    });
    if (!techParsed.success) {
      return {
        success: false,
        message: "กรุณาตรวจสอบข้อมูลที่กรอก",
        fieldErrors: zodToFieldErrors(techParsed.error),
      };
    }
    const technician = await findTechnician(techParsed.data.technician_id);
    if (!technician) {
      return {
        success: false,
        message: "ช่างเทคนิคที่เลือกไม่ถูกต้อง",
        fieldErrors: { technician_id: "ช่างเทคนิคที่เลือกไม่ถูกต้อง" },
      };
    }
    technician_id = technician.id;
  } else {
    technician_id = profile.id;
  }

  const { error } = await supabase.from("maintenance_records").insert({
    ...parsed.data,
    technician_id,
  });

  if (error) {
    return {
      success: false,
      message: `เพิ่มรายการบำรุงรักษาไม่สำเร็จ: ${error.message}`,
    };
  }

  revalidatePath("/maintenance");
  return { success: true, message: "เพิ่มรายการบำรุงรักษาเรียบร้อยแล้ว" };
}

export async function updateMaintenance(
  _prev: MaintenanceFormState,
  formData: FormData
): Promise<MaintenanceFormState> {
  const profile = await requireServerRole(["admin", "technician"]);

  const recordId = String(formData.get("id") ?? "");
  if (!recordId) {
    return { success: false, message: "ไม่พบรายการที่ต้องการแก้ไข" };
  }

  const parsed = parseMaintenanceForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  // technician แก้ได้เฉพาะรายการที่ตัวเองรับผิดชอบ และไม่สามารถเปลี่ยน technician_id ได้
  if (profile.role === "technician") {
    const { data: existing, error: fetchError } = await supabase
      .from("maintenance_records")
      .select("technician_id")
      .eq("id", recordId)
      .maybeSingle();
    if (fetchError || !existing || existing.technician_id !== profile.id) {
      return {
        success: false,
        message: "คุณไม่มีสิทธิ์แก้ไขรายการนี้",
      };
    }
  }

  const updatePayload: {
    machine_id: string;
    maintenance_type: string;
    problem: string;
    action_taken: string;
    date: string;
    status: MaintenanceStatus;
    updated_at: string;
    technician_id?: string;
  } = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  if (profile.role === "admin") {
    const techParsed = maintenanceTechnicianSchema.safeParse({
      technician_id: String(formData.get("technician_id") ?? ""),
    });
    if (!techParsed.success) {
      return {
        success: false,
        message: "กรุณาตรวจสอบข้อมูลที่กรอก",
        fieldErrors: zodToFieldErrors(techParsed.error),
      };
    }
    const technician = await findTechnician(techParsed.data.technician_id);
    if (!technician) {
      return {
        success: false,
        message: "ช่างเทคนิคที่เลือกไม่ถูกต้อง",
        fieldErrors: { technician_id: "ช่างเทคนิคที่เลือกไม่ถูกต้อง" },
      };
    }
    updatePayload.technician_id = technician.id;
  }

  const { error } = await supabase
    .from("maintenance_records")
    .update(updatePayload)
    .eq("id", recordId);

  if (error) {
    return {
      success: false,
      message: `แก้ไขรายการบำรุงรักษาไม่สำเร็จ: ${error.message}`,
    };
  }

  revalidatePath("/maintenance");
  return { success: true, message: "แก้ไขรายการบำรุงรักษาเรียบร้อยแล้ว" };
}

export async function changeMaintenanceStatus(input: {
  recordId: string;
  status: MaintenanceStatus;
}): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireServerRole(["admin", "technician"]);

  const parsed = maintenanceStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลสถานะไม่ถูกต้อง" };
  }

  const supabase = await createClient();

  if (profile.role === "technician") {
    const { data: existing, error: fetchError } = await supabase
      .from("maintenance_records")
      .select("technician_id")
      .eq("id", parsed.data.recordId)
      .maybeSingle();
    if (fetchError || !existing || existing.technician_id !== profile.id) {
      return { ok: false, error: "คุณไม่มีสิทธิ์เปลี่ยนสถานะรายการนี้" };
    }
  }

  const { error } = await supabase
    .from("maintenance_records")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.recordId);

  if (error) {
    return {
      ok: false,
      error: `เปลี่ยนสถานะไม่สำเร็จ: ${error.message}`,
    };
  }

  revalidatePath("/maintenance");
  return { ok: true };
}

export async function deleteMaintenance(input: {
  recordId: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireServerRole(["admin"]);

  if (!input.recordId) {
    return { ok: false, error: "ไม่พบรายการที่ต้องการลบ" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("maintenance_records")
    .delete()
    .eq("id", input.recordId);

  if (error) {
    return { ok: false, error: `ลบรายการไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/maintenance");
  return { ok: true };
}