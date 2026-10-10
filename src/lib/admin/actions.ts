"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { SHELTER_FIELDS, shelterSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/session";
import { fieldErrorsFrom, formValues, type FormState } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";
import { createClient } from "@/lib/supabase/server";

// requireAdmin() here is only for a friendly redirect; the database functions
// and RLS policies reject non-admins regardless.

const uuid = z.uuid();

function readUuid(formData: FormData, name: string): string {
  const parsed = uuid.safeParse(formData.get(name));
  if (!parsed.success) throw new Error(tr.admin.actionFailed);
  return parsed.data;
}

async function setStaff(userId: string, approved: boolean, shelterId: string | null) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_staff", {
    target_user: userId,
    set_approved: approved,
    // The generated type says string, but the function accepts null.
    set_shelter_id: shelterId as string,
  });
  if (error) {
    console.error("admin_set_staff failed", error.code, error.message);
    throw new Error(tr.admin.actionFailed);
  }
  revalidatePath("/yonetim");
}

/** Approves a pending account, or moves approved staff to another shelter. */
export async function approveStaff(formData: FormData): Promise<void> {
  await setStaff(readUuid(formData, "userId"), true, readUuid(formData, "shelterId"));
}

/** Back to pending; the shelter is kept so re-approving is one click. */
export async function revokeStaff(formData: FormData): Promise<void> {
  const shelter = z
    .uuid()
    .nullable()
    .safeParse(formData.get("shelterId") || null);
  await setStaff(readUuid(formData, "userId"), false, shelter.success ? shelter.data : null);
}

export async function rejectStaff(formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_reject_staff", {
    target_user: readUuid(formData, "userId"),
  });
  if (error) {
    console.error("admin_reject_staff failed", error.code, error.message);
    throw new Error(tr.admin.actionFailed);
  }
  revalidatePath("/yonetim");
}

export async function saveShelter(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData, [...SHELTER_FIELDS]);
  const parsed = shelterSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: tr.form.fixErrors,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const { visitingHours, ...rest } = parsed.data;
  const row = { ...rest, visiting_hours: visitingHours };
  const id = formData.get("id");
  const supabase = await createClient();

  const { error } =
    typeof id === "string" && id
      ? await supabase.from("shelters").update(row).eq("id", readUuid(formData, "id"))
      : await supabase.from("shelters").insert(row);
  if (error) {
    console.error("Saving shelter failed", error.code, error.message);
    return { status: "error", message: tr.form.genericError, values };
  }

  revalidatePath("/yonetim");
  revalidatePath("/");
  redirect("/yonetim");
}
