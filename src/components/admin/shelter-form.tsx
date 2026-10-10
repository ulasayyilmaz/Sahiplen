"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormAlert, SubmitButton, TextAreaField, TextField } from "@/components/form/fields";
import { saveShelter } from "@/lib/admin/actions";
import type { ShelterRow } from "@/lib/admin/queries";
import { initialFormState } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";

const t = tr.admin.shelters;

export function ShelterForm({ shelter, cities }: { shelter?: ShelterRow; cities: string[] }) {
  const [state, action] = useActionState(saveShelter, initialFormState);

  // After an error, show what was typed; otherwise the saved values.
  const value = (field: string, saved: string | number | null | undefined) =>
    state.values?.[field] ?? (saved == null ? "" : String(saved));

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormAlert state={state} />
      {shelter && <input type="hidden" name="id" value={shelter.id} />}
      <TextField
        name="name"
        label={t.fields.name}
        defaultValue={value("name", shelter?.name)}
        error={state.fieldErrors?.name}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="city"
          label={t.fields.city}
          hint={t.hints.city}
          list="city-options"
          defaultValue={value("city", shelter?.city)}
          error={state.fieldErrors?.city}
          required
        />
        <datalist id="city-options">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
        <TextField
          name="district"
          label={t.fields.district}
          defaultValue={value("district", shelter?.district)}
          error={state.fieldErrors?.district}
          required
        />
      </div>
      <TextField
        name="phone"
        type="tel"
        label={t.fields.phone}
        defaultValue={value("phone", shelter?.phone)}
        error={state.fieldErrors?.phone}
      />
      <TextAreaField
        name="address"
        label={t.fields.address}
        rows={2}
        defaultValue={value("address", shelter?.address)}
        error={state.fieldErrors?.address}
      />
      <TextField
        name="visitingHours"
        label={t.fields.visitingHours}
        defaultValue={value("visitingHours", shelter?.visitingHours)}
        error={state.fieldErrors?.visitingHours}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="latitude"
          label={t.fields.latitude}
          inputMode="text"
          hint={t.hints.coordinates}
          defaultValue={value("latitude", shelter?.latitude)}
          error={state.fieldErrors?.latitude}
        />
        <TextField
          name="longitude"
          label={t.fields.longitude}
          inputMode="text"
          defaultValue={value("longitude", shelter?.longitude)}
          error={state.fieldErrors?.longitude}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel={tr.form.saving}>{t.save}</SubmitButton>
        <Link href="/yonetim" className="text-sm text-stone-700 underline underline-offset-4">
          {t.back}
        </Link>
      </div>
    </form>
  );
}
