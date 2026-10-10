"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireApprovedStaff } from "@/lib/auth/session";
import { birthDateFromAgeInMonths, todayInTurkey } from "@/lib/dogs/age";
import { DOG_FORM_FIELDS, dogSchema } from "@/lib/dogs/schemas";
import { fieldErrorsFrom, formValues, type FormState } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";
import { createClient } from "@/lib/supabase/server";

const UNIQUE_VIOLATION = "23505";
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Creates a dog for the staff member's shelter, or updates one of its dogs. */
export async function saveDog(_prev: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireApprovedStaff();
  const values = formValues(formData, [...DOG_FORM_FIELDS]);
  const parsed = dogSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: tr.form.fixErrors,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }
  const d = parsed.data;
  const dogId = z.uuid().safeParse(formData.get("id")).data;

  // Keep the stored birth date if the age wasn't touched; recomputing it from
  // whole months would shift it by up to a month on every save.
  const ageInMonths = d.ageYears * 12 + d.ageMonths;
  const originalBirthDate = isoDate.safeParse(formData.get("originalBirthDate")).data;
  const ageUnchanged =
    originalBirthDate !== undefined && Number(formData.get("originalAgeMonths")) === ageInMonths;
  const estimatedBirthDate = ageUnchanged
    ? originalBirthDate
    : birthDateFromAgeInMonths(ageInMonths, todayInTurkey());

  const row = {
    name: d.name,
    sex: d.sex,
    size: d.size,
    color: d.color,
    estimated_birth_date: estimatedBirthDate,
    neutered: d.neutered,
    vaccinated: d.vaccinated,
    good_with_kids: d.goodWithKids,
    good_with_dogs: d.goodWithDogs,
    good_with_cats: d.goodWithCats,
    energy_level: d.energyLevel,
    health_notes: d.healthNotes,
    description: d.description,
    microchip_number: d.microchipNumber,
    capture_district: d.captureDistrict,
    status: d.status,
    // Saving the form counts as staff confirming the details are current.
    last_verified_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const result = dogId
    ? await supabase
        .from("dogs")
        .update(row)
        .eq("id", dogId)
        .eq("shelter_id", staff.shelterId)
        .select("id")
    : await supabase
        .from("dogs")
        .insert({ ...row, shelter_id: staff.shelterId })
        .select("id");

  if (result.error?.code === UNIQUE_VIOLATION) {
    return {
      status: "error",
      message: tr.form.fixErrors,
      fieldErrors: { microchipNumber: tr.dogForm.errors.microchipTaken },
      values,
    };
  }
  if (result.error) {
    console.error("Saving dog failed", result.error.code, result.error.message);
    return { status: "error", message: tr.form.genericError, values };
  }
  const savedId = result.data[0]?.id;
  if (!savedId) return { status: "error", message: tr.dogForm.errors.notFound, values };

  revalidatePath("/");
  revalidatePath("/panel", "layout");
  if (!dogId) redirect(`/panel/kopekler/${savedId}?yeni=1`);
  return { status: "success", message: tr.dogForm.saved };
}
