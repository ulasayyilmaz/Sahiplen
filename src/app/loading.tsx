import { DogGridSkeleton } from "@/components/dog-grid-skeleton";
import { tr } from "@/lib/strings/tr";

export default function Loading() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">{tr.gallery.heading}</h1>
      <div className="h-36 animate-pulse rounded-xl bg-stone-200" aria-hidden="true" />
      <DogGridSkeleton />
    </>
  );
}
