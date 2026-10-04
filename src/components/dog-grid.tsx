import Link from "next/link";

import { DogCard } from "@/components/dog-card";
import { Pagination } from "@/components/pagination";
import { todayInTurkey } from "@/lib/dogs/age";
import { galleryHref, type DogFilters } from "@/lib/dogs/filters";
import { getAvailableDogs } from "@/lib/dogs/queries";
import { tr } from "@/lib/strings/tr";

type Props = {
  filters: DogFilters;
  page: number;
};

export async function DogGrid({ filters, page }: Props) {
  const { dogs, total, totalPages } = await getAvailableDogs(filters, page);
  const today = todayInTurkey();

  if (dogs.length === 0) {
    // Past the last page (e.g. a stale shared link): offer page 1 with the same filters.
    const outOfRange = page > 1;
    return (
      <div
        role="status"
        className="mt-6 rounded-xl border border-dashed border-stone-300 p-10 text-center"
      >
        <p className="text-lg font-medium text-stone-900">
          {outOfRange ? tr.gallery.pageOutOfRangeTitle : tr.gallery.emptyTitle}
        </p>
        {outOfRange ? (
          <Link
            href={galleryHref(filters)}
            className="mt-3 inline-block font-medium text-amber-800 underline underline-offset-4"
          >
            {tr.gallery.goToFirstPage}
          </Link>
        ) : (
          <p className="mt-2 text-stone-600">{tr.gallery.emptyBody}</p>
        )}
      </div>
    );
  }

  return (
    <section aria-labelledby="results-heading" className="mt-6">
      <h2 id="results-heading" className="sr-only">
        {tr.gallery.heading}
      </h2>
      <p role="status" className="mb-4 text-sm text-stone-600">
        {tr.gallery.resultCount(total)}
      </p>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dogs.map((dog) => (
          <li key={dog.id}>
            <DogCard dog={dog} today={today} />
          </li>
        ))}
      </ul>
      <Pagination filters={filters} page={page} totalPages={totalPages} />
    </section>
  );
}
