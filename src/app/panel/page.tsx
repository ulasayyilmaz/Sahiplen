import type { Metadata } from "next";
import Link from "next/link";

import { ShelterDogList, StatusFilter } from "@/components/panel/shelter-dog-list";
import { isPlatformAdmin, requireUser } from "@/lib/auth/session";
import { todayInTurkey } from "@/lib/dogs/age";
import { getShelterDogs } from "@/lib/dogs/staff-queries";
import { DOG_STATUSES } from "@/lib/dogs/types";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.panel.title} · ${tr.site.name}` };

const t = tr.panel;

export default async function PanelPage({ searchParams }: PageProps<"/panel">) {
  const user = await requireUser();
  const durum = (await searchParams).durum;
  const status = DOG_STATUSES.find((s) => s === durum);
  const canManageDogs = user.approved && user.shelterId !== null;
  const dogs = canManageDogs ? await getShelterDogs(user.shelterId!, status) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{t.welcome(user.fullName)}</h1>
        {canManageDogs && user.shelterName && (
          <p className="mt-1 text-stone-600">
            {t.shelterLabel}: {user.shelterName}
          </p>
        )}
      </div>

      {!user.approved && (
        <section
          aria-labelledby="pending-heading"
          className="rounded-xl border border-amber-200 bg-amber-50 p-6"
        >
          <h2 id="pending-heading" className="text-lg font-semibold text-amber-900">
            {t.pendingTitle}
          </h2>
          <p className="mt-2 text-amber-900">{t.pendingBody}</p>
          <p className="mt-2 text-sm text-amber-900">
            {user.shelterName ? t.requestedShelter(user.shelterName) : t.noShelter}
          </p>
        </section>
      )}

      {isPlatformAdmin(user) && (
        <p className="text-stone-700">
          {t.adminHint}{" "}
          <Link href="/yonetim" className="font-medium text-amber-800 underline underline-offset-4">
            {tr.nav.admin}
          </Link>
        </p>
      )}

      {canManageDogs && (
        <section aria-labelledby="dogs-heading" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="dogs-heading" className="text-xl font-semibold">
              {t.dogs.heading}{" "}
              <span className="text-base font-normal text-stone-600">
                ({t.dogs.count(dogs.length)})
              </span>
            </h2>
            <Link
              href="/panel/kopekler/yeni"
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
            >
              {t.dogs.add}
            </Link>
          </div>
          <StatusFilter current={status} />
          <ShelterDogList dogs={dogs} today={todayInTurkey()} />
        </section>
      )}
    </div>
  );
}
