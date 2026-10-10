"use client";

import Link from "next/link";
import { useActionState, type FormEvent, type ReactNode } from "react";

import {
  CheckboxField,
  FormAlert,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/form/fields";
import { saveDog } from "@/lib/dogs/actions";
import { ageInMonths } from "@/lib/dogs/age";
import type { EditableDog } from "@/lib/dogs/staff-queries";
import { DOG_SEXES, DOG_SIZES, DOG_STATUSES, type DogStatus } from "@/lib/dogs/types";
import { initialFormState, type FormState } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";

const t = tr.dogForm;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
      <legend className="px-1 text-lg font-semibold text-stone-900">{title}</legend>
      {children}
    </fieldset>
  );
}

const triStateValue = (v: boolean | null | undefined) => (v == null ? "" : v ? "yes" : "no");
const triStateOptions = [
  { value: "yes", label: t.options.yes },
  { value: "no", label: t.options.no },
];

export function DogForm({
  dog,
  today,
  notice,
}: {
  dog?: EditableDog;
  today: string;
  /** Message shown on first render, e.g. after creating the dog. */
  notice?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(
    saveDog,
    notice ? { status: "success", message: notice } : initialFormState,
  );

  const months = dog ? ageInMonths(dog.estimatedBirthDate, today) : undefined;
  const saved: Record<string, string> = dog
    ? {
        name: dog.name,
        sex: dog.sex,
        size: dog.size,
        color: dog.color ?? "",
        ageYears: String(Math.floor(months! / 12)),
        ageMonths: String(months! % 12),
        healthNotes: dog.healthNotes ?? "",
        goodWithKids: triStateValue(dog.goodWithKids),
        goodWithDogs: triStateValue(dog.goodWithDogs),
        goodWithCats: triStateValue(dog.goodWithCats),
        energyLevel: dog.energyLevel == null ? "" : String(dog.energyLevel),
        description: dog.description ?? "",
        microchipNumber: dog.microchipNumber ?? "",
        captureDistrict: dog.captureDistrict ?? "",
        status: dog.status,
        neutered: dog.neutered ? "on" : "",
        vaccinated: dog.vaccinated ? "on" : "",
      }
    : { sex: "unknown", ageMonths: "0", status: "available" };
  // After a failed submit show what was typed; otherwise the stored values.
  const value = (field: string) => state.values?.[field] ?? saved[field] ?? "";
  const error = (field: string) => state.fieldErrors?.[field];

  // Hiding a dog from the public gallery is easy to do by accident: confirm it.
  function confirmStatusChange(event: FormEvent<HTMLFormElement>) {
    const status = new FormData(event.currentTarget).get("status") as DogStatus;
    const wasPublic = (dog?.status ?? "available") === "available";
    if (
      wasPublic &&
      status !== "available" &&
      !window.confirm(t.confirmHide(tr.dog.statuses[status]))
    ) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={confirmStatusChange} className="flex flex-col gap-6" noValidate>
      <FormAlert state={state} />
      {dog && (
        <>
          <input type="hidden" name="id" value={dog.id} />
          <input type="hidden" name="originalBirthDate" value={dog.estimatedBirthDate} />
          <input type="hidden" name="originalAgeMonths" value={months} />
        </>
      )}

      <Section title={t.sections.basics}>
        <TextField
          name="name"
          label={t.fields.name}
          defaultValue={value("name")}
          error={error("name")}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="sex"
            label={t.fields.sex}
            defaultValue={value("sex")}
            error={error("sex")}
            options={DOG_SEXES.map((s) => ({ value: s, label: tr.dog.sexes[s] }))}
            required
          />
          <SelectField
            name="size"
            label={t.fields.size}
            placeholder={tr.form.choose}
            defaultValue={value("size")}
            error={error("size")}
            options={DOG_SIZES.map((s) => ({ value: s, label: tr.dog.sizes[s] }))}
            required
          />
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-stone-800">
            {t.fields.age}
            <span aria-hidden="true" className="text-red-700">
              {" "}
              *
            </span>
          </legend>
          <p className="mb-2 text-xs text-stone-600">{t.hints.age}</p>
          <div className="grid max-w-xs grid-cols-2 gap-3">
            <TextField
              name="ageYears"
              label={t.fields.ageYears}
              inputMode="numeric"
              defaultValue={value("ageYears")}
              error={error("ageYears")}
              required
            />
            <TextField
              name="ageMonths"
              label={t.fields.ageMonths}
              inputMode="numeric"
              defaultValue={value("ageMonths")}
              error={error("ageMonths")}
              required
            />
          </div>
        </fieldset>
        <TextField
          name="color"
          label={t.fields.color}
          defaultValue={value("color")}
          error={error("color")}
        />
        <SelectField
          name="status"
          label={t.fields.status}
          hint={t.hints.status}
          defaultValue={value("status")}
          error={error("status")}
          options={DOG_STATUSES.map((s) => ({ value: s, label: tr.dog.statuses[s] }))}
          required
        />
      </Section>

      <Section title={t.sections.health}>
        <div className="flex flex-wrap gap-6">
          <CheckboxField
            name="neutered"
            label={t.fields.neutered}
            defaultChecked={value("neutered") === "on"}
          />
          <CheckboxField
            name="vaccinated"
            label={t.fields.vaccinated}
            defaultChecked={value("vaccinated") === "on"}
          />
        </div>
        <TextAreaField
          name="healthNotes"
          label={t.fields.healthNotes}
          hint={t.hints.healthNotes}
          rows={3}
          defaultValue={value("healthNotes")}
          error={error("healthNotes")}
        />
      </Section>

      <Section title={t.sections.temperament}>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["goodWithKids", "goodWithDogs", "goodWithCats"] as const).map((field) => (
            <SelectField
              key={field}
              name={field}
              label={t.fields[field]}
              placeholder={t.options.unknown}
              defaultValue={value(field)}
              error={error(field)}
              options={triStateOptions}
            />
          ))}
        </div>
        <SelectField
          name="energyLevel"
          label={t.fields.energyLevel}
          placeholder={t.options.unknown}
          defaultValue={value("energyLevel")}
          error={error("energyLevel")}
          options={([1, 2, 3] as const).map((n) => ({
            value: String(n),
            label: t.options.energy[n],
          }))}
        />
        <TextAreaField
          name="description"
          label={t.fields.description}
          hint={t.hints.description}
          rows={5}
          defaultValue={value("description")}
          error={error("description")}
        />
      </Section>

      <Section title={t.sections.details}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="microchipNumber"
            label={t.fields.microchipNumber}
            hint={t.hints.microchip}
            inputMode="numeric"
            defaultValue={value("microchipNumber")}
            error={error("microchipNumber")}
          />
          <TextField
            name="captureDistrict"
            label={t.fields.captureDistrict}
            defaultValue={value("captureDistrict")}
            error={error("captureDistrict")}
          />
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel={tr.form.saving}>{t.save}</SubmitButton>
        <Link href="/panel" className="text-sm text-stone-700 underline underline-offset-4">
          {t.back}
        </Link>
      </div>
    </form>
  );
}
