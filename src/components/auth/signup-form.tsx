"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormAlert, SelectField, SubmitButton, TextField } from "@/components/form/fields";
import { signUp } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";

const t = tr.auth;

export function SignUpForm({ shelters }: { shelters: { value: string; label: string }[] }) {
  const [state, action] = useActionState(signUp, initialFormState);

  // After a successful sign-up only the "check your email" message is shown.
  if (state.status === "success") return <FormAlert state={state} />;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormAlert state={state} />
      <TextField
        name="fullName"
        label={t.fields.fullName}
        autoComplete="name"
        defaultValue={state.values?.fullName}
        error={state.fieldErrors?.fullName}
        required
      />
      <TextField
        name="phone"
        type="tel"
        label={t.fields.phone}
        autoComplete="tel"
        inputMode="tel"
        hint={t.hints.phone}
        defaultValue={state.values?.phone}
        error={state.fieldErrors?.phone}
        required
      />
      <SelectField
        name="shelterId"
        label={t.fields.shelter}
        placeholder={t.fields.chooseShelter}
        options={shelters}
        hint={t.hints.shelterMissing}
        defaultValue={state.values?.shelterId}
        error={state.fieldErrors?.shelterId}
        required
      />
      <TextField
        name="email"
        type="email"
        label={t.fields.email}
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        required
      />
      <TextField
        name="password"
        type="password"
        label={t.fields.password}
        autoComplete="new-password"
        hint={t.hints.password}
        error={state.fieldErrors?.password}
        required
      />
      <SubmitButton pendingLabel={tr.form.sending}>{t.signUp.submit}</SubmitButton>
      <p className="text-sm text-stone-600">
        {t.signUp.haveAccount}{" "}
        <Link href="/giris" className="font-medium text-amber-800 underline underline-offset-4">
          {t.signUp.loginLink}
        </Link>
      </p>
    </form>
  );
}
