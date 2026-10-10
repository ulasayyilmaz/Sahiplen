import type { StaffRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type StaffMember = {
  userId: string;
  fullName: string;
  phone: string | null;
  email: string;
  emailConfirmed: boolean;
  role: StaffRole;
  approved: boolean;
  shelterId: string | null;
  createdAt: string;
};

/** Every account with email (admin only; the database function enforces it). */
export async function getStaff(): Promise<StaffMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_staff");
  if (error) throw new Error(`Failed to load staff: ${error.message}`);

  return data.map((s) => ({
    userId: s.user_id,
    fullName: s.full_name,
    phone: s.phone,
    email: s.email,
    emailConfirmed: s.email_confirmed,
    role: s.role,
    approved: s.approved,
    shelterId: s.shelter_id,
    createdAt: s.created_at,
  }));
}

export type ShelterRow = {
  id: string;
  name: string;
  city: string;
  district: string;
  phone: string | null;
  address: string | null;
  visitingHours: string | null;
  latitude: number | null;
  longitude: number | null;
};

const SHELTER_COLUMNS =
  "id, name, city, district, phone, address, visiting_hours, latitude, longitude";

function toShelterRow(s: {
  id: string;
  name: string;
  city: string;
  district: string;
  phone: string | null;
  address: string | null;
  visiting_hours: string | null;
  latitude: number | null;
  longitude: number | null;
}): ShelterRow {
  return {
    id: s.id,
    name: s.name,
    city: s.city,
    district: s.district,
    phone: s.phone,
    address: s.address,
    visitingHours: s.visiting_hours,
    latitude: s.latitude,
    longitude: s.longitude,
  };
}

/** All shelters sorted by city, then name (Turkish collation). */
export async function getShelters(): Promise<ShelterRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("shelters").select(SHELTER_COLUMNS);
  if (error) throw new Error(`Failed to load shelters: ${error.message}`);

  return data
    .map(toShelterRow)
    .sort((a, b) => a.city.localeCompare(b.city, "tr") || a.name.localeCompare(b.name, "tr"));
}

export async function getShelter(id: string): Promise<ShelterRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shelters")
    .select(SHELTER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load shelter: ${error.message}`);
  return data ? toShelterRow(data) : null;
}
