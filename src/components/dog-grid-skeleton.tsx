import { tr } from "@/lib/strings/tr";

const PLACEHOLDER_COUNT = 8;

export function DogGridSkeleton() {
  return (
    <div role="status" className="mt-6">
      <span className="sr-only">{tr.gallery.loading}</span>
      <div className="mb-4 h-5 w-32 animate-pulse rounded bg-stone-200" aria-hidden="true" />
      <ul
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <div className="aspect-square animate-pulse bg-stone-200" />
            <div className="space-y-2 p-4">
              <div className="h-5 w-24 animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-stone-100" />
              <div className="h-4 w-32 animate-pulse rounded bg-stone-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
