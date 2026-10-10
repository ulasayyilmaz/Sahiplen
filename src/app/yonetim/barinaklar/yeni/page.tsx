import type { Metadata } from "next";

import { ShelterForm } from "@/components/admin/shelter-form";
import { getShelters } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.admin.shelters.newTitle} · ${tr.site.name}` };

export default async function NewShelterPage() {
  await requireAdmin();
  const cities = [...new Set((await getShelters()).map((s) => s.city))];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{tr.admin.shelters.newTitle}</h1>
      <ShelterForm cities={cities} />
    </div>
  );
}
