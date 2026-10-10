"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { addDogPhoto, deleteDogPhoto, makeCoverPhoto } from "@/lib/photos/actions";
import { PhotoError, preparePhoto, type PreparedPhoto } from "@/lib/photos/resize";
import { MAX_PHOTOS_PER_DOG, PHOTO_BUCKET } from "@/lib/photos/rules";
import type { DogPhoto } from "@/lib/dogs/staff-queries";
import { tr } from "@/lib/strings/tr";
import { createClient } from "@/lib/supabase/client";

const t = tr.photos;

const smallButton =
  "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-100 disabled:opacity-60";

export function PhotoManager({
  dogId,
  dogName,
  shelterId,
  photos,
}: {
  dogId: string;
  dogName: string;
  shelterId: string;
  photos: DogPhoto[];
}) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [prepared, setPrepared] = useState<(PreparedPhoto & { previewUrl: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isRefreshing, startTransition] = useTransition();
  const working = busy || isRefreshing;
  const isFull = photos.length >= MAX_PHOTOS_PER_DOG;

  // Release the preview's object URL when it's replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (prepared) URL.revokeObjectURL(prepared.previewUrl);
    };
  }, [prepared]);

  function reset() {
    setPrepared(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onFileChosen(file: File | undefined) {
    setError(null);
    reset();
    if (!file) return;
    try {
      const photo = await preparePhoto(file);
      setPrepared({ ...photo, previewUrl: URL.createObjectURL(photo.blob) });
    } catch (err) {
      setError(err instanceof PhotoError ? t.errors[err.problem] : t.errors.notImage);
    }
  }

  async function upload() {
    if (!prepared) return;
    setBusy(true);
    setError(null);
    try {
      const path = `${shelterId}/${dogId}/${crypto.randomUUID()}.${prepared.extension}`;
      const { error: uploadError } = await createClient()
        .storage.from(PHOTO_BUCKET)
        .upload(path, prepared.blob, {
          contentType: prepared.blob.type,
          // Short CDN cache: a deleted photo stops being served within an hour.
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) {
        console.error("Upload failed", uploadError.message);
        setError(t.errors.uploadFailed);
        return;
      }
      const result = await addDogPhoto(dogId, path);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      reset();
      startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) setError(result.error ?? t.errors.actionFailed);
      else startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="photos-heading"
      className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-6"
    >
      <div>
        <h2 id="photos-heading" className="text-lg font-semibold text-stone-900">
          {t.heading(photos.length, MAX_PHOTOS_PER_DOG)}
        </h2>
        <p className="text-sm text-stone-600">{t.intro}</p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
        >
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id} className="flex flex-col gap-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
                <Image
                  src={photo.url}
                  alt={t.alt(dogName, index + 1)}
                  fill
                  sizes="(min-width: 640px) 240px, 50vw"
                  className="object-cover"
                  unoptimized
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-amber-700 px-2 py-0.5 text-xs font-semibold text-white">
                    {t.cover}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    disabled={working}
                    className={smallButton}
                    onClick={() => run(() => makeCoverPhoto(photo.id))}
                  >
                    {t.makeCover}
                  </button>
                )}
                <button
                  type="button"
                  disabled={working}
                  className={`${smallButton} text-red-800`}
                  onClick={() => {
                    if (window.confirm(t.deleteConfirm)) run(() => deleteDogPhoto(photo.id));
                  }}
                >
                  {t.delete}
                  <span className="sr-only">: {t.alt(dogName, index + 1)}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isFull ? (
        <p className="text-sm text-stone-600">{t.full}</p>
      ) : prepared ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">{t.previewTitle}</p>
          {/* Same square crop as the gallery card. */}
          <div className="relative aspect-square w-56 overflow-hidden rounded-lg bg-stone-100">
            <Image
              src={prepared.previewUrl}
              alt=""
              fill
              sizes="224px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={upload}
              disabled={working}
              className="rounded-lg bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {working ? t.uploading : t.upload}
            </button>
            <button type="button" onClick={reset} disabled={working} className={smallButton}>
              {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <label htmlFor={inputId} className="text-sm font-medium text-stone-800">
            {t.choose}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            disabled={working}
            aria-describedby={`${inputId}-hint`}
            onChange={(event) => onFileChosen(event.target.files?.[0])}
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-amber-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-amber-800"
          />
          <p id={`${inputId}-hint`} className="text-xs text-stone-600">
            {t.chooseHint}
          </p>
        </div>
      )}
    </section>
  );
}
