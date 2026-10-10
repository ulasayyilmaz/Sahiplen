import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getShelterOptions } from "@/lib/shelters/queries";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.auth.signUp.title} · ${tr.site.name}` };

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/panel");
  const shelters = await getShelterOptions();

  return (
    <AuthCard title={tr.auth.signUp.title} intro={tr.auth.signUp.intro}>
      <SignUpForm shelters={shelters} />
    </AuthCard>
  );
}
