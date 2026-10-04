import Image from "next/image";

import { formatAge } from "@/lib/dogs/age";
import type { DogCardData } from "@/lib/dogs/types";
import { tr } from "@/lib/strings/tr";

type Props = {
  dog: DogCardData;
  today: string;
};

export function DogCard({ dog, today }: Props) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="relative aspect-square bg-stone-100">
        {dog.photoUrl ? (
          <Image
            src={dog.photoUrl}
            alt={tr.dog.photoAlt(dog.name)}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            // Local SVG placeholders can't go through the image optimizer.
            unoptimized={dog.photoUrl.endsWith(".svg")}
          />
        ) : (
          <div
            role="img"
            aria-label={tr.dog.noPhotoAlt(dog.name)}
            className="flex h-full items-center justify-center text-sm text-stone-500"
          >
            {tr.dog.noPhoto}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-stone-900">{dog.name}</h3>
        <ul className="flex flex-wrap gap-1.5 text-sm">
          {[
            formatAge(dog.estimatedBirthDate, today),
            tr.dog.sizes[dog.size],
            tr.dog.sexes[dog.sex],
          ].map((fact) => (
            <li key={fact} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-900">
              {fact}
            </li>
          ))}
        </ul>
        <p className="mt-auto text-sm text-stone-600">
          <span className="sr-only">{tr.dog.shelter}: </span>
          {dog.shelterName}
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          {dog.city}
        </p>
      </div>
    </article>
  );
}
