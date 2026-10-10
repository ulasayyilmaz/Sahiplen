"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormAlert, SubmitButton, TextField } from "@/components/form/fields";
import { requestPasswordReset, updatePassword } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";

const t = tr.auth;

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormAlert state={state} />
      {state.status !== "success" && (
        <>
          <TextField
            name="email"
            type="email"
            label={t.fields.email}
            autoComplete="email"
            defaultValue={state.values?.email}
            error={state.fieldErrors?.email}
            required
          />
          <SubmitButton pendingLabel={tr.form.sending}>{t.forgot.submit}</SubmitButton>
        </>
      )}
      <Link href="/giris" className="text-sm text-amber-800 underline underline-offset-4">
        {t.forgot.backToLogin}
      </Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormAlert state={state} />
      <TextField
        name="password"
        type="password"
        label={t.fields.newPassword}
        autoComplete="new-password"
        hint={t.hints.password}
        error={state.fieldErrors?.password}
        required
      />
      <SubmitButton pendingLabel={tr.form.saving}>{t.reset.submit}</SubmitButton>
    </form>
  );
}
