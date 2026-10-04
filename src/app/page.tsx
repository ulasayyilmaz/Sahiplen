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
  // Changes on every filter/page navigation, so the skeleton shows while results load.
  const resultsKey = galleryHref(filters, page);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{tr.gallery.heading}</h1>
      {/* Keyed so the selects reset to the URL's values on back/forward navigation. */}
      <Filters key={galleryHref(filters)} cities={cities} filters={filters} />
      <Suspense key={resultsKey} fallback={<DogGridSkeleton />}>
        <DogGrid filters={filters} page={page} />
      </Suspense>
    </>
  );
}
