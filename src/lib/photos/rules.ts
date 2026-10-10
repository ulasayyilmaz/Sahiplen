// Photo rules shared by the browser (resize/validate) and the server (actions).

export const PHOTO_BUCKET = "dog-photos";
export const MAX_PHOTOS_PER_DOG = 3;

/** Longest side after resizing, in pixels. */
export const MAX_PHOTO_DIMENSION = 1200;
/** Shortest side we accept from the original, in pixels. */
export const MIN_PHOTO_DIMENSION = 300;
/** Widest (2:1) and tallest (1:2) shapes we accept, as width / height. */
export const MAX_ASPECT_RATIO = 2;
/** Originals above this are rejected before decoding (phone photos are ~3–12 MB). */
export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

/** Storage path: <shelter_id>/<dog_id>/<random uuid>.<webp|jpg> */
export function photoPathPattern(shelterId: string, dogId: string): RegExp {
  return new RegExp(`^${shelterId}/${dogId}/[0-9a-f-]{36}\\.(webp|jpg)$`);
}

const PUBLIC_PATH_MARKER = `/storage/v1/object/public/${PHOTO_BUCKET}/`;

/** Storage path of an uploaded photo URL, or null for other URLs (e.g. seed placeholders). */
export function storagePathFromUrl(url: string): string | null {
  const index = url.indexOf(PUBLIC_PATH_MARKER);
  return index === -1 ? null : url.slice(index + PUBLIC_PATH_MARKER.length);
}
