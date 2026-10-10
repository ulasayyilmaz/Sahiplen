"use server";

import type { AuthError } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/auth/schemas";
import { fieldErrorsFrom, formValues, safeNextPath, type FormState } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";
import { createClient } from "@/lib/supabase/server";

const e = tr.auth.errors;

function authErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return e.invalidCredentials;
    case "email_not_confirmed":
      return e.emailNotConfirmed;
    case "weak_password":
      return e.weakPassword;
    case "same_password":
      return e.samePassword;
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return e.rateLimit;
    case "email_address_not_authorized":
      return e.emailNotAuthorized;
    default:
      console.error("Auth error", error.code, error.message);
      return tr.form.genericError;
  }
}

/** This site's origin (works on localhost, Vercel previews and production). */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["fullName", "phone", "email", "shelterId"]);
  const parsed = signUpSchema.safeParse({ ...values, password: formData.get("password") });
  if (!parsed.success) {
    return {
      status: "error",
      message: tr.form.fixErrors,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const { fullName, phone, email, password, shelterId } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/panel`,
      // Copied into public.profiles by a database trigger, which always
      // creates the account as unapproved staff whatever is sent here.
      data: { full_name: fullName, phone, shelter_id: shelterId },
    },
  });
  if (error) return { status: "error", message: authErrorMessage(error), values };

  // Email confirmation turned off in Supabase: the user is logged in already.
  if (data.session) redirect("/panel");

  // Also shown when the email is already registered (Supabase doesn't reveal it).
  return { status: "success", message: tr.auth.signUp.checkEmail };
}

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["email"]);
  const parsed = loginSchema.safeParse({ ...values, password: formData.get("password") });
  if (!parsed.success) {
    return {
      status: "error",
      message: tr.form.fixErrors,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", message: authErrorMessage(error), values };

  redirect(safeNextPath(formData.get("next")));
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, ["email"]);
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteOrigin()}/auth/confirm?next=/sifre-yenile`,
  });
  // Don't reveal whether the address has an account; only surface rate limits.
  if (error && error.code?.startsWith("over_")) {
    return { status: "error", message: authErrorMessage(error), values };
  }
  if (error) console.error("Password reset error", error.code, error.message);

  return { status: "success", message: tr.auth.forgot.sent };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: authErrorMessage(error) };

  redirect("/panel");
}
