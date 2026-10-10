import type { ReactNode } from "react";

export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
      {intro && <p className="mt-2 text-sm text-stone-600">{intro}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
