import { z } from "zod";

import { DOG_SEXES, DOG_SIZES, DOG_STATUSES } from "@/lib/dogs/types";
import { tr } from "@/lib/strings/tr";

const e = tr.dogForm.errors;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: e.tooLong })
    .transform((v) => (v === "" ? null : v));

/** Select with "" = unknown, "yes", "no" → null / true / false. */
const triState = z.enum(["", "yes", "no"]).transform((v) => (v === "" ? null : v === "yes"));

/** Checkbox: present ("on") when ticked, missing otherwise. */
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

const wholeNumber = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,2}$/, { error: message })
    .transform(Number)
    .refine((n) => n >= min && n <= max, { error: message });

export const dogSchema = z.object({
  name: z.string().trim().min(1, { error: e.name }).max(100, { error: e.tooLong }),
  sex: z.enum(DOG_SEXES, { error: e.sex }),
  size: z.enum(DOG_SIZES, { error: e.size }),
  color: optionalText(100),
  ageYears: wholeNumber(0, 25, e.ageYears),
  ageMonths: wholeNumber(0, 11, e.ageMonths),
  neutered: checkbox,
  vaccinated: checkbox,
  healthNotes: optionalText(2000),
  goodWithKids: triState,
  goodWithDogs: triState,
  goodWithCats: triState,
  energyLevel: z.enum(["", "1", "2", "3"]).transform((v) => (v === "" ? null : Number(v))),
  description: optionalText(3000),
  microchipNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ""))
    .refine((v) => v === "" || /^\d{9,15}$/.test(v), { error: e.microchip })
    .transform((v) => (v === "" ? null : v)),
  captureDistrict: optionalText(100),
  status: z.enum(DOG_STATUSES, { error: e.status }),
});

export type DogFormData = z.output<typeof dogSchema>;

/** Form field names, read from FormData and echoed back after a validation error. */
export const DOG_FORM_FIELDS = [
  "name",
  "sex",
  "size",
  "color",
  "ageYears",
  "ageMonths",
  "healthNotes",
  "goodWithKids",
  "goodWithDogs",
  "goodWithCats",
  "energyLevel",
  "description",
  "microchipNumber",
  "captureDistrict",
  "status",
  "neutered",
  "vaccinated",
] as const;
