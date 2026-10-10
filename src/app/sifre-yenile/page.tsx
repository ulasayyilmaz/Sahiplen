import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/password-forms";
import { getCurrentUser } from "@/lib/auth/session";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.auth.reset.title} · ${tr.site.name}` };

// Reached from the reset email via /auth/confirm, which logs the user in first.
export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  return (
    <AuthCard title={tr.auth.reset.title}>
      {user ? (
        <ResetPasswordForm />
      ) : (
        <div className="flex flex-col gap-4">
          <p role="alert" className="text-sm text-stone-700">
            {tr.auth.reset.noSession}
          </p>
          <Link href="/sifremi-unuttum" className="text-amber-800 underline underline-offset-4">
            {tr.auth.reset.requestNew}
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
