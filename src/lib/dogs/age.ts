// Ages are always derived from estimated_birth_date, using today's date in Turkey.
// Dates are handled as ISO "YYYY-MM-DD" strings to avoid timezone drift.

import { tr } from "@/lib/strings/tr";

export const AGE_GROUPS = ["puppy", "young", "adult", "senior"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

// [minYears, maxYears) per group; null = open-ended.
const AGE_GROUP_YEARS: Record<AgeGroup, [number, number | null]> = {
  puppy: [0, 1],
  young: [1, 3],
  adult: [3, 8],
  senior: [8, null],
};

const TIME_ZONE = "Europe/Istanbul";

/** Today's date in Turkey as "YYYY-MM-DD". */
export function todayInTurkey(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

function parseIsoDate(iso: string): [number, number, number] {
  const [year, month, day] = iso.split("-").map(Number);
  return [year, month, day];
}

function subtractYears(iso: string, years: number): string {
  const [year, month, day] = parseIsoDate(iso);
  // Date.UTC rolls Feb 29 over to Mar 1 in non-leap years, which is fine here.
  return new Date(Date.UTC(year - years, month - 1, day)).toISOString().slice(0, 10);
}

/**
 * Birth-date bounds for an age group: a dog is in the group when
 * `bornAfter < estimated_birth_date <= bornOnOrBefore` (either bound may be absent).
 */
export function birthDateBounds(
  group: AgeGroup,
  today: string,
): { bornAfter?: string; bornOnOrBefore?: string } {
  const [minYears, maxYears] = AGE_GROUP_YEARS[group];
  return {
    bornAfter: maxYears === null ? undefined : subtractYears(today, maxYears),
    bornOnOrBefore: minYears === 0 ? undefined : subtractYears(today, minYears),
  };
}

/** Whole months between birth date and today (never negative). */
export function ageInMonths(birthDate: string, today: string): number {
  const [by, bm, bd] = parseIsoDate(birthDate);
  const [ty, tm, td] = parseIsoDate(today);
  const months = (ty - by) * 12 + (tm - bm) - (td < bd ? 1 : 0);
  return Math.max(0, months);
}

/** Turkish age wording, e.g. "5 aylık" or "3 yaşında". */
export function formatAge(birthDate: string, today: string): string {
  const months = ageInMonths(birthDate, today);
  if (months < 1) return tr.dog.age.newborn;
  if (months < 12) return tr.dog.age.months(months);
  return tr.dog.age.years(Math.floor(months / 12));
}
