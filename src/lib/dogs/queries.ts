import { birthDateBounds, todayInTurkey } from "@/lib/dogs/age";
import type { DogFilters } from "@/lib/dogs/filters";
import type { DogCardData } from "@/lib/dogs/types";
import { createClient } from "@/lib/supabase/server";

export const PAGE_SIZE = 24;

// PostgREST error when the requested range starts past the last row.
const RANGE_NOT_SATISFIABLE = "PGRST103";

export type DogPage = {
  dogs: DogCardData[];
  total: number;
  totalPages: number;
};

export async function getAvailableDogs(filters: DogFilters, page: number): Promise<DogPage> {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("dogs")
    .select(
      "id, name, sex, size, estimated_birth_date, shelters!inner(name, city), dog_photos(url, sort_order)",
      { count: "exact" },
    )
    // RLS already hides non-available dogs; this is defense in depth.
    .eq("status", "available");

  if (filters.city) query = query.eq("shelters.city", filters.city);
  if (filters.size) query = query.eq("size", filters.size);
  if (filters.sex) query = query.eq("sex", filters.sex);
  if (filters.age) {
    const { bornAfter, bornOnOrBefore } = birthDateBounds(filters.age, todayInTurkey());
    if (bornAfter) query = query.gt("estimated_birth_date", bornAfter);
    if (bornOnOrBefore) query = query.lte("estimated_birth_date", bornOnOrBefore);
  }

  const { data, count, error } = await query
    .order("sort_order", { referencedTable: "dog_photos" })
    .limit(1, { referencedTable: "dog_photos" })
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);

  // Page past the end: PostgREST returns no count here, so report an empty page.
  if (error?.code === RANGE_NOT_SATISFIABLE) {
    return { dogs: [], total: 0, totalPages: 1 };
  }
  if (error) throw new Error(`Failed to load dogs: ${error.message}`);

  const total = count ?? 0;
  return {
    total,
    totalPages: pageCount(total),
    dogs: data.map((dog) => ({
      id: dog.id,
      name: dog.name,
      sex: dog.sex,
      size: dog.size,
      estimatedBirthDate: dog.estimated_birth_date,
      shelterName: dog.shelters.name,
      city: dog.shelters.city,
      photoUrl: dog.dog_photos[0]?.url ?? null,
    })),
  };
}

/** Distinct shelter cities, sorted alphabetically in Turkish. */
export async function getCities(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("shelters").select("city");
  if (error) throw new Error(`Failed to load cities: ${error.message}`);

  return [...new Set(data.map((s) => s.city))].sort((a, b) => a.localeCompare(b, "tr"));
}

function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}
