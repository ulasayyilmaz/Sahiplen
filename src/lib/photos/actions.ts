"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireApprovedStaff } from "@/lib/auth/session";
import {
  MAX_PHOTOS_PER_DOG,
  PHOTO_BUCKET,
  photoPathPattern,
  storagePathFromUrl,
} from "@/lib/photos/rules";
import { tr } from "@/lib/strings/tr";
import { createClient } from "@/lib/supabase/server";

// RLS and storage policies are the real guard (own shelter only, max 3 photos);
// these actions add friendly errors and keep storage and rows in sync.

export type PhotoActionResult = { ok: true } | { ok: false; error: string };

const e = tr.photos.errors;

function revalidate(dogId: string) {
  revalidatePath(`/panel/kopekler/${dogId}`);
  revalidatePath("/panel");
  revalidatePath("/");
}

/** Records a photo the browser has just uploaded to storage. */
export async function addDogPhoto(dogId: string, path: string): Promise<PhotoActionResult> {
  const staff = await requireApprovedStaff();
  const supabase = await createClient();
  const removeUpload = () => supabase.storage.from(PHOTO_BUCKET).remove([path]);

  if (!z.uuid().safeParse(dogId).success || !photoPathPattern(staff.shelterId, dogId).test(path)) {
    return { ok: false, error: e.actionFailed };
  }

  const { data: photos, error: listError } = await supabase
    .from("dog_photos")
    .select("sort_order, dogs!inner(shelter_id)")
    .eq("dog_id", dogId)
    .eq("dogs.shelter_id", staff.shelterId);
  if (listError) {
    await removeUpload();
    return { ok: false, error: e.actionFailed };
  }
  if (photos.length >= MAX_PHOTOS_PER_DOG) {
    await removeUpload();
    return { ok: false, error: e.limit };
  }

  const url = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
  const sortOrder = Math.max(-1, ...photos.map((p) => p.sort_order)) + 1;
  const { error } = await supabase
    .from("dog_photos")
    .insert({ dog_id: dogId, url, sort_order: sortOrder });
  if (error) {
    console.error("Adding photo failed", error.code, error.message);
    await removeUpload();
    return { ok: false, error: error.code === "23514" ? e.limit : e.actionFailed };
  }

  revalidate(dogId);
  return { ok: true };
}

async function getOwnPhoto(photoId: string) {
  const staff = await requireApprovedStaff();
  if (!z.uuid().safeParse(photoId).success) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("dog_photos")
    .select("id, dog_id, url, dogs!inner(shelter_id)")
    .eq("id", photoId)
    .eq("dogs.shelter_id", staff.shelterId)
    .maybeSingle();
  return data ? { supabase, photo: data } : null;
}

export async function deleteDogPhoto(photoId: string): Promise<PhotoActionResult> {
  const own = await getOwnPhoto(photoId);
  if (!own) return { ok: false, error: e.actionFailed };
  const { supabase, photo } = own;

  const { error } = await supabase.from("dog_photos").delete().eq("id", photo.id);
  if (error) {
    console.error("Deleting photo failed", error.code, error.message);
    return { ok: false, error: e.actionFailed };
  }
  // Seed placeholders aren't in storage; uploaded files are removed too.
  const path = storagePathFromUrl(photo.url);
  if (path) {
    const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove([path]);
    if (storageError) console.error("Removing photo file failed", storageError.message);
  }

  revalidate(photo.dog_id);
  return { ok: true };
}

/** Moves a photo to the front; the others keep their relative order. */
export async function makeCoverPhoto(photoId: string): Promise<PhotoActionResult> {
  const own = await getOwnPhoto(photoId);
  if (!own) return { ok: false, error: e.actionFailed };
  const { supabase, photo } = own;

  const { data: photos, error } = await supabase
    .from("dog_photos")
    .select("id, sort_order")
    .eq("dog_id", photo.dog_id)
    .order("sort_order");
  if (error) return { ok: false, error: e.actionFailed };

  const ordered = [photo.id, ...photos.map((p) => p.id).filter((id) => id !== photo.id)];
  for (const [index, id] of ordered.entries()) {
    const { error: updateError } = await supabase
      .from("dog_photos")
      .update({ sort_order: index })
      .eq("id", id);
    if (updateError) return { ok: false, error: e.actionFailed };
  }

  revalidate(photo.dog_id);
  return { ok: true };
}
