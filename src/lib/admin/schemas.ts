import { z } from "zod";

import { tr } from "@/lib/strings/tr";

const e = tr.admin.shelters.errors;

/** Optional text: empty becomes null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: e.tooLong })
    .transform((v) => (v === "" ? null : v));

/** Optional coordinate: empty becomes null; accepts "41,0082" as well as "41.0082". */
const optionalCoordinate = (limit: number, message: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((v) => v === null || (Number.isFinite(v) && Math.abs(v) <= limit), {
      error: message,
    });

export const shelterSchema = z.object({
  name: z.string().trim().min(2, { error: e.name }).max(200, { error: e.tooLong }),
  city: z.string().trim().min(2, { error: e.city }).max(100, { error: e.tooLong }),
  district: z.string().trim().min(2, { error: e.district }).max(100, { error: e.tooLong }),
  phone: optionalText(40),
  address: optionalText(500),
  visitingHours: optionalText(300),
  latitude: optionalCoordinate(90, e.latitude),
  longitude: optionalCoordinate(180, e.longitude),
});

export const SHELTER_FIELDS = [
  "name",
  "city",
  "district",
  "phone",
  "address",
  "visitingHours",
  "latitude",
  "longitude",
] as const;
