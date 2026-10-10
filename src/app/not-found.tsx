import Link from "next/link";

import { tr } from "@/lib/strings/tr";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-10 text-center">
      <h1 className="text-2xl font-bold text-stone-900">{tr.notFound.title}</h1>
      <p className="mt-2 text-stone-600">{tr.notFound.body}</p>
      <Link
        href="/"
        className="mt-4 inline-block font-medium text-amber-800 underline underline-offset-4"
      >
        {tr.notFound.home}
      </Link>
    </div>
  );
}
