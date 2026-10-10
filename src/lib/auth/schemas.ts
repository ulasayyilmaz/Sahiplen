import { z } from "zod";

import { tr } from "@/lib/strings/tr";

const e = tr.auth.errors;

// Trim/lowercase first, then validate the format.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, { error: e.email })
  .pipe(z.email({ error: e.email }));

// bcrypt (used by Supabase Auth) only looks at the first 72 bytes.
const password = z
  .string()
  .min(8, { error: e.passwordTooShort })
  .max(72, { error: e.passwordTooLong });

export const signUpSchema = z.object({
  fullName: z.string().trim().min(3, { error: e.fullName }).max(200, { error: e.fullName }),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{10,20}$/, { error: e.phone }),
  email,
  password,
  shelterId: z.uuid({ error: e.shelter }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: tr.form.required }),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({ password });
