import type { Metadata } from "next";

import { DogForm } from "@/components/panel/dog-form";
import { requireApprovedStaff } from "@/lib/auth/session";
import { todayInTurkey } from "@/lib/dogs/age";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.dogForm.newTitle} · ${tr.site.name}` };

export default async function NewDogPage() {
  await requireApprovedStaff();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">{tr.dogForm.newTitle}</h1>
      <DogForm today={todayInTurkey()} />
    </div>
  );
}
