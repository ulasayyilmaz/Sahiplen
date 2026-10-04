"use client";

import { useEffect } from "react";

import { tr } from "@/lib/strings/tr";

export default function GalleryError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <h1 className="text-xl font-semibold text-red-900">{tr.error.title}</h1>
      <p className="mt-2 text-red-800">{tr.error.body}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-lg bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-800"
      >
        {tr.error.retry}
      </button>
    </div>
  );
}
