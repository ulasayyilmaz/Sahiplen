// Data access for the staff panel. Every query filters by the staff member's
// shelter explicitly: RLS also lets anyone read *available* dogs of other
// shelters, so relying on RLS alone would mix those in.

import type { DogSex, DogSize, DogStatus } from "@/lib/dogs/types";
import { createClient } from "@/lib/supabase/server";

export type StaffDogRow = {
  id: string;
  name: string;
  sex: DogSex;
  size: DogSize;
  status: DogStatus;
  estimatedBirthDate: string;
  updatedAt: string;
  photoUrl: string | null;
};

export async function getShelterDogs(
  shelterId: string,
  status?: DogStatus,
): Promise<StaffDogRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("dogs")
    .select(
      "id, name, sex, size, status, estimated_birth_date, updated_at, dog_photos(url, sort_order)",
    )
    .eq("shelter_id", shelterId)
    .order("updated_at", { ascending: false })
    .order("sort_order", { referencedTable: "dog_photos" })
    .limit(1, { referencedTable: "dog_photos" });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load shelter dogs: ${error.message}`);

  return data.map((d) => ({
    id: d.id,
    name: d.name,
    sex: d.sex,
    size: d.size,
    status: d.status,
    estimatedBirthDate: d.estimated_birth_date,
    updatedAt: d.updated_at,
    photoUrl: d.dog_photos[0]?.url ?? null,
  }));
}

export type DogPhoto = { id: string; url: string; sortOrder: number };

export type EditableDog = {
  id: string;
  shelterId: string;
  name: string;
  sex: DogSex;
  size: DogSize;
  color: string | null;
  estimatedBirthDate: string;
  neutered: boolean;
  vaccinated: boolean;
  goodWithKids: boolean | null;
  goodWithDogs: boolean | null;
  goodWithCats: boolean | null;
  energyLevel: number | null;
  healthNotes: string | null;
  description: string | null;
  microchipNumber: string | null;
  captureDistrict: string | null;
  status: DogStatus;
  photos: DogPhoto[];
};

/** A dog of the given shelter, or null (also for other shelters' dogs). */
export async function getShelterDog(shelterId: string, dogId: string): Promise<EditableDog | null> {
  const supabase = await createClient();
  const { data: d, error } = await supabase
    .from("dogs")
    .select(
      "id, shelter_id, name, sex, size, color, estimated_birth_date, neutered, vaccinated, good_with_kids, good_with_dogs, good_with_cats, energy_level, health_notes, description, microchip_number, capture_district, status, dog_photos(id, url, sort_order)",
    )
    .eq("id", dogId)
    .eq("shelter_id", shelterId)
    .order("sort_order", { referencedTable: "dog_photos" })
    .maybeSingle();
  if (error) throw new Error(`Failed to load dog: ${error.message}`);
  if (!d) return null;

  return {
    id: d.id,
    shelterId: d.shelter_id,
    name: d.name,
    sex: d.sex,
    size: d.size,
    color: d.color,
    estimatedBirthDate: d.estimated_birth_date,
    neutered: d.neutered,
    vaccinated: d.vaccinated,
    goodWithKids: d.good_with_kids,
    goodWithDogs: d.good_with_dogs,
    goodWithCats: d.good_with_cats,
    energyLevel: d.energy_level,
    healthNotes: d.health_notes,
    description: d.description,
    microchipNumber: d.microchip_number,
    captureDistrict: d.capture_district,
    status: d.status,
    photos: d.dog_photos.map((p) => ({ id: p.id, url: p.url, sortOrder: p.sort_order })),
  };
}
