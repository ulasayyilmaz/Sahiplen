"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { AGE_GROUPS } from "@/lib/dogs/age";
import {
  galleryHref,
  hasActiveFilters,
  parseSearchParams,
  type DogFilters,
} from "@/lib/dogs/filters";
import { DOG_SEXES, DOG_SIZES } from "@/lib/dogs/types";
import { tr } from "@/lib/strings/tr";

type Props = {
  cities: string[];
  filters: DogFilters;
};

type Option = { value: string; label: string };

// A plain GET form that works without JavaScript. With JS, submission is
// intercepted to push a clean URL (no empty params, page reset to 1).
// Filters apply on the button press, not on change, so keyboard and
// screen-reader users can adjust several selects before results change.
export function Filters({ cities, filters }: Props) {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(
      Array.from(new FormData(event.currentTarget), ([key, value]) => [key, String(value)]),
    );
    router.push(galleryHref(parseSearchParams(values).filters));
  }

  return (
    <form
      method="get"
      action="/"
      onSubmit={handleSubmit}
      aria-labelledby="filters-heading"
      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <h2 id="filters-heading" className="sr-only">
        {tr.filters.heading}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Select
          name="city"
          label={tr.filters.city}
          defaultValue={filters.city}
          options={cities.map((city) => ({ value: city, label: city }))}
        />
        <Select
          name="size"
          label={tr.filters.size}
          defaultValue={filters.size}
          options={DOG_SIZES.map((size) => ({ value: size, label: tr.dog.sizes[size] }))}
        />
        <Select
          name="sex"
          label={tr.filters.sex}
          defaultValue={filters.sex}
          options={DOG_SEXES.map((sex) => ({ value: sex, label: tr.dog.sexes[sex] }))}
        />
        <Select
          name="age"
          label={tr.filters.age}
          defaultValue={filters.age}
          options={AGE_GROUPS.map((age) => ({ value: age, label: tr.dog.ageGroups[age] }))}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800"
        >
          {tr.filters.submit}
        </button>
        {hasActiveFilters(filters) && (
          <Link
            href="/"
            className="text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-stone-900"
          >
            {tr.filters.clear}
          </Link>
        )}
      </div>
    </form>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string | undefined;
  options: Option[];
}) {
  const id = `filter-${name}`;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
      >
        <option value="">{tr.filters.any}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
