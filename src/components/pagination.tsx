import Link from "next/link";

import { galleryHref, type DogFilters } from "@/lib/dogs/filters";
import { tr } from "@/lib/strings/tr";

type Props = {
  filters: DogFilters;
  page: number;
  totalPages: number;
};

const linkClass =
  "rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100";
const disabledClass =
  "rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-400";

export function Pagination({ filters, page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label={tr.pagination.label} className="mt-8 flex items-center justify-between gap-4">
      {hasPrevious ? (
        <Link href={galleryHref(filters, page - 1)} rel="prev" className={linkClass}>
          {tr.pagination.previous}
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          {tr.pagination.previous}
        </span>
      )}

      <p className="text-sm text-stone-600">{tr.pagination.status(page, totalPages)}</p>

      {hasNext ? (
        <Link href={galleryHref(filters, page + 1)} rel="next" className={linkClass}>
          {tr.pagination.next}
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          {tr.pagination.next}
        </span>
      )}
    </nav>
  );
}
