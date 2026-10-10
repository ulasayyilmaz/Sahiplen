// Shared shape for Server Action results used with useActionState.

import { z } from "zod";

export type FormState = {
  status: "idle" | "success" | "error";
  /** Form-level message (success text or an error not tied to one field). */
  message?: string;
  /** First error per field name. */
  fieldErrors?: Record<string, string>;
  /** Submitted values to re-fill the form after an error (never passwords). */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

/** String values of the named fields, for re-filling the form after an error. */
export function formValues(formData: FormData, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, String(formData.get(name) ?? "")]));
}

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    errors[field] ??= issue.message;
  }
  return errors;
}

/** Only allow redirects to paths on this site (no "//evil.com" or absolute URLs). */
export function safeNextPath(next: unknown, fallback = "/panel"): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("\\")) return fallback;
  return next;
}
