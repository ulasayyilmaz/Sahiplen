// Gallery filter state lives in the URL. This module parses untrusted search
// params into typed filters and builds canonical URLs back from them.
// Pure functions: safe to use on the server and in client components.

import { AGE_GROUPS, type AgeGroup } from "@/lib/dogs/age";
import { DOG_SEXES, DOG_SIZES, type DogSex, type DogSize } from "@/lib/dogs/types";

export type DogFilters = {
  city?: string;
  size?: DogSize;
  sex?: DogSex;
  age?: AgeGroup;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const MAX_PAGE = 10_000;
const MAX_CITY_LENGTH = 100;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  const trimmed = v?.trim();
  return trimmed ? trimmed : undefined;
}

function oneOf<T extends string>(allowed: readonly T[], value: string | undefined): T | undefined {
  return allowed.find((a) => a === value);
}

/** Invalid or unknown values are dropped rather than causing errors. */
export function parseSearchParams(params: SearchParams): { filters: DogFilters; page: number } {
  const city = first(params.city);
  const pageNumber = Number.parseInt(first(params.page) ?? "", 10);

  return {
    filters: {
      city: city && city.length <= MAX_CITY_LENGTH ? city : undefined,
      size: oneOf(DOG_SIZES, first(params.size)),
      sex: oneOf(DOG_SEXES, first(params.sex)),
      age: oneOf(AGE_GROUPS, first(params.age)),
    },
    page: Number.isFinite(pageNumber) ? Math.min(Math.max(pageNumber, 1), MAX_PAGE) : 1,
  };
}

/** Canonical gallery URL: empty filters and page 1 are omitted. */
export function galleryHref(filters: DogFilters, page = 1): string {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.size) params.set("size", filters.size);
  if (filters.sex) params.set("sex", filters.sex);
  if (filters.age) params.set("age", filters.age);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function hasActiveFilters(filters: DogFilters): boolean {
  return Boolean(filters.city || filters.size || filters.sex || filters.age);
}
