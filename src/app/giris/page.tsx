import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/forms";
import { tr } from "@/lib/strings/tr";

export const metadata: Metadata = { title: `${tr.auth.login.title} · ${tr.site.name}` };

export default async function LoginPage({ searchParams }: PageProps<"/giris">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? safeNextPath(params.next) : undefined;
  if (await getCurrentUser()) redirect(next ?? "/panel");

  return (
    <AuthCard title={tr.auth.login.title}>
      <LoginForm next={next} linkError={params.hata === "baglanti"} />
    </AuthCard>
  );
}
