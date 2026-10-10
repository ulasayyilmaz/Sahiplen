"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormAlert, SubmitButton, TextField } from "@/components/form/fields";
import { logIn } from "@/lib/auth/actions";
import { initialFormState, type FormState } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";

const t = tr.auth;

export function LoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(
    logIn,
    linkError ? { status: "error", message: t.errors.linkInvalid } : initialFormState,
  );

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormAlert state={state} />
      {next && <input type="hidden" name="next" value={next} />}
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
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        required
      />
      <SubmitButton pendingLabel={tr.form.sending}>{t.login.submit}</SubmitButton>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <Link href="/sifremi-unuttum" className="text-amber-800 underline underline-offset-4">
          {t.login.forgotPassword}
        </Link>
        <p className="text-stone-600">
          {t.login.noAccount}{" "}
          <Link href="/kayit" className="font-medium text-amber-800 underline underline-offset-4">
            {t.login.signUpLink}
          </Link>
        </p>
      </div>
    </form>
  );
}
