import type { Metadata } from "next";
import Link from "next/link";

import { ApprovedStaff, PendingStaff } from "@/components/admin/staff-sections";
import { getShelters, getStaff } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.admin.title} · ${tr.site.name}` };

const t = tr.admin;

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [staff, shelters] = await Promise.all([getStaff(), getShelters()]);
  const shelterOptions = shelters.map((s) => ({ value: s.id, label: `${s.city} — ${s.name}` }));

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>

      <PendingStaff members={staff.filter((m) => !m.approved)} shelters={shelterOptions} />

      <ApprovedStaff
        members={staff.filter((m) => m.approved)}
        shelters={shelterOptions}
        currentUserId={admin.userId}
      />

      <section aria-labelledby="shelters-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="shelters-heading" className="text-xl font-semibold">
            {t.shelters.heading(shelters.length)}
          </h2>
          <Link
            href="/yonetim/barinaklar/yeni"
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
          >
            {t.shelters.add}
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
          {shelters.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="font-medium text-stone-900">{s.name}</p>
                <p className="text-sm text-stone-600">
                  {s.district}, {s.city}
                  {s.phone && ` · ${s.phone}`}
                </p>
              </div>
              <Link
                href={`/yonetim/barinaklar/${s.id}`}
                className="text-sm font-medium text-amber-800 underline underline-offset-4"
              >
                {t.shelters.edit}
                <span className="sr-only">: {s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
