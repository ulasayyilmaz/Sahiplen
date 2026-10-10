// Browser-only: checks and downsizes a photo before upload, keeping its proportions.

import {
  MAX_ASPECT_RATIO,
  MAX_ORIGINAL_BYTES,
  MAX_PHOTO_DIMENSION,
  MIN_PHOTO_DIMENSION,
} from "@/lib/photos/rules";

export type PreparedPhoto = {
  blob: Blob;
  extension: "webp" | "jpg";
  width: number;
  height: number;
};

export type PhotoProblem = "notImage" | "tooLarge" | "badShape" | "tooSmall";

export class PhotoError extends Error {
  constructor(public readonly problem: PhotoProblem) {
    super(problem);
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (file.size > MAX_ORIGINAL_BYTES) throw new PhotoError("tooLarge");

  let bitmap: ImageBitmap;
  try {
    // "from-image" applies the EXIF rotation, so phone photos aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PhotoError("notImage");
  }

  try {
    const { width, height } = bitmap;
    if (Math.min(width, height) < MIN_PHOTO_DIMENSION) throw new PhotoError("tooSmall");
    const ratio = width / height;
    if (ratio > MAX_ASPECT_RATIO || ratio < 1 / MAX_ASPECT_RATIO) throw new PhotoError("badShape");

    // Same scale on both axes: the photo is never stretched.
    const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new PhotoError("notImage");
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    // Safari can't encode WebP and silently returns PNG; fall back to JPEG there.
    const webp = await toBlob(canvas, "image/webp", 0.82);
    if (webp?.type === "image/webp") {
      return { blob: webp, extension: "webp", width: canvas.width, height: canvas.height };
    }
    const jpeg = await toBlob(canvas, "image/jpeg", 0.85);
    if (!jpeg) throw new PhotoError("notImage");
    return { blob: jpeg, extension: "jpg", width: canvas.width, height: canvas.height };
  } finally {
    bitmap.close();
  }
}
