import Image from "next/image";
import Link from "next/link";

import { formatAge } from "@/lib/dogs/age";
import type { StaffDogRow } from "@/lib/dogs/staff-queries";
import { DOG_STATUSES, type DogStatus } from "@/lib/dogs/types";
import { formatDateTime } from "@/lib/format";
import { tr } from "@/lib/strings/tr";

const t = tr.panel.dogs;

const STATUS_STYLES: Record<DogStatus, string> = {
  available: "bg-green-100 text-green-900",
  reserved: "bg-amber-100 text-amber-900",
  adopted: "bg-sky-100 text-sky-900",
  deceased: "bg-stone-200 text-stone-800",
  transferred: "bg-violet-100 text-violet-900",
};

export function StatusBadge({ status }: { status: DogStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {tr.dog.statuses[status]}
    </span>
  );
}

/** Status filter as links, so it works without JS and shows in the URL. */
export function StatusFilter({ current }: { current?: DogStatus }) {
  const options: { href: string; label: string; active: boolean }[] = [
    { href: "/panel", label: t.all, active: !current },
    ...DOG_STATUSES.map((s) => ({
      href: `/panel?durum=${s}`,
      label: tr.dog.statuses[s],
      active: current === s,
    })),
  ];
  return (
    <nav aria-label={t.filterLabel}>
      <ul className="flex flex-wrap gap-2">
        {options.map((o) => (
          <li key={o.href}>
            <Link
              href={o.href}
              aria-current={o.active ? "page" : undefined}
              className={
                o.active
                  ? "rounded-full bg-stone-900 px-3 py-1 text-sm font-medium text-white"
                  : "rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800 hover:bg-stone-100"
              }
            >
              {o.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ShelterDogList({ dogs, today }: { dogs: StaffDogRow[]; today: string }) {
  if (dogs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-600">
        {t.empty}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
      {dogs.map((dog) => (
        <li key={dog.id} className="flex items-center gap-4 p-3 sm:p-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
            {dog.photoUrl && (
              <Image
                src={dog.photoUrl}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-900">{dog.name}</span>
              <StatusBadge status={dog.status} />
            </p>
            <p className="text-sm text-stone-600">
              {formatAge(dog.estimatedBirthDate, today)} · {tr.dog.sizes[dog.size]} ·{" "}
              {tr.dog.sexes[dog.sex]}
            </p>
            <p className="text-xs text-stone-500">{t.updated(formatDateTime(dog.updatedAt))}</p>
          </div>
          <Link
            href={`/panel/kopekler/${dog.id}`}
            className="shrink-0 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-100"
          >
            {t.edit}
            <span className="sr-only">: {dog.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
