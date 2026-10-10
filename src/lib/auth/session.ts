import { redirect } from "next/navigation";
import { cache } from "react";

import type { Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = Enums<"staff_role">;

export type CurrentUser = {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: StaffRole;
  approved: boolean;
  shelterId: string | null;
  shelterName: string | null;
};

/**
 * The logged-in user and their profile, or null. Cached per request.
 * Identity comes from the verified JWT (getClaims), never from cookies alone.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const claims = auth?.claims;
  if (!claims) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, phone, role, approved, shelter_id, shelters(name)")
    .eq("user_id", claims.sub)
    .maybeSingle();
  if (error) throw new Error(`Failed to load profile: ${error.message}`);
  if (!profile) return null;

  return {
    userId: claims.sub,
    email: claims.email ?? "",
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role,
    approved: profile.approved,
    shelterId: profile.shelter_id,
    shelterName: profile.shelters?.name ?? null,
  };
});

export function isPlatformAdmin(user: CurrentUser | null): boolean {
  return Boolean(user?.approved && user.role === "platform_admin");
}

/** Any logged-in user (approved or not); otherwise to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  return user;
}

/** Approved staff with a shelter; pending users go to the panel's waiting screen. */
export async function requireApprovedStaff(): Promise<CurrentUser & { shelterId: string }> {
  const user = await requireUser();
  if (!user.approved || !user.shelterId) redirect("/panel");
  return { ...user, shelterId: user.shelterId };
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!isPlatformAdmin(user)) redirect("/panel");
  return user;
}
