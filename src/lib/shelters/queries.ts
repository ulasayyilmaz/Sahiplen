import { createClient } from "@/lib/supabase/server";

export type ShelterOption = { value: string; label: string };

/** All shelters as select options ("City — Name"), sorted in Turkish order. */
export async function getShelterOptions(): Promise<ShelterOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("shelters").select("id, name, city");
  if (error) throw new Error(`Failed to load shelters: ${error.message}`);

  return data
    .map((s) => ({ value: s.id, label: `${s.city} — ${s.name}` }))
    .sort((a, b) => a.label.localeCompare(b.label, "tr"));
}
