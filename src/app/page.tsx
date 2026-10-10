import { Suspense } from "react";

import { DogGrid } from "@/components/dog-grid";
import { DogGridSkeleton } from "@/components/dog-grid-skeleton";
import { Filters } from "@/components/filters";
import { galleryHref, parseSearchParams } from "@/lib/dogs/filters";
import { getCities } from "@/lib/dogs/queries";
import { tr } from "@/lib/strings/tr";

export default async function GalleryPage({ searchParams }: PageProps<"/">) {
  const { filters, page } = parseSearchParams(await searchParams);
  const cities = await getCities();
  // Sibling keys must never collide (on page 1 both URLs are identical); duplicate keys make
  // React keep stale copies on client navigation.
  // Filters: remounts so the selects reset to the URL's values on back/forward navigation.
  const filtersKey = `filters:${galleryHref(filters)}`;
  // Results: changes on every filter/page navigation, so the skeleton shows while results load.
  const resultsKey = `results:${galleryHref(filters, page)}`;

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{tr.gallery.heading}</h1>
      <Filters key={filtersKey} cities={cities} filters={filters} />
      <Suspense key={resultsKey} fallback={<DogGridSkeleton />}>
        <DogGrid filters={filters} page={page} />
      </Suspense>
    </>
  );
}
