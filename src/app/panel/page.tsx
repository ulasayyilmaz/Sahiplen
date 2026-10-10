import type { Metadata } from "next";
import Link from "next/link";

import { isPlatformAdmin, requireUser } from "@/lib/auth/session";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.panel.title} · ${tr.site.name}` };

const t = tr.panel;

export default async function PanelPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{t.welcome(user.fullName)}</h1>
        {user.approved && user.shelterName && (
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
    </div>
  );
}
