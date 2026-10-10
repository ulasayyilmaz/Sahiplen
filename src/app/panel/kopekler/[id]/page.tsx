import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { DogForm } from "@/components/panel/dog-form";
import { StatusBadge } from "@/components/panel/shelter-dog-list";
import { requireApprovedStaff } from "@/lib/auth/session";
import { todayInTurkey } from "@/lib/dogs/age";
import { getShelterDog } from "@/lib/dogs/staff-queries";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.panel.dogs.edit} · ${tr.site.name}` };

export default async function EditDogPage({
  params,
  searchParams,
}: PageProps<"/panel/kopekler/[id]">) {
  const staff = await requireApprovedStaff();
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  // Only dogs of the staff member's own shelter; others are a 404.
  const dog = await getShelterDog(staff.shelterId, id.data);
  if (!dog) notFound();
  const justCreated = (await searchParams).yeni === "1";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">{tr.dogForm.editTitle(dog.name)}</h1>
      <p className="mb-6">
        <StatusBadge status={dog.status} />
      </p>
      <DogForm
        key={dog.id}
        dog={dog}
        today={todayInTurkey()}
        notice={justCreated ? tr.dogForm.created : undefined}
      />
    </div>
  );
}
