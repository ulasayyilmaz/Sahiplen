import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ShelterForm } from "@/components/admin/shelter-form";
import { getShelter, getShelters } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.admin.shelters.editTitle} · ${tr.site.name}` };

export default async function EditShelterPage({ params }: PageProps<"/yonetim/barinaklar/[id]">) {
  await requireAdmin();
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const [shelter, shelters] = await Promise.all([getShelter(id.data), getShelters()]);
  if (!shelter) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{tr.admin.shelters.editTitle}</h1>
      <ShelterForm shelter={shelter} cities={[...new Set(shelters.map((s) => s.city))]} />
    </div>
  );
}
