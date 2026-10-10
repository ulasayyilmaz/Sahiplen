import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/password-forms";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.auth.forgot.title} · ${tr.site.name}` };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title={tr.auth.forgot.title} intro={tr.auth.forgot.intro}>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
