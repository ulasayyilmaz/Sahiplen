import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";

import { tr } from "@/lib/strings/tr";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  // latin-ext covers Turkish characters (ç, ğ, ı, İ, ö, ş, ü).
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: `${tr.site.name} · ${tr.site.tagline}`,
  description: tr.site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <a
          href="#main"
          className="sr-only rounded-lg bg-white px-4 py-2 font-medium focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
        >
          {tr.site.skipToContent}
        </a>
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <Link href="/" className="text-xl font-bold text-amber-800">
              {tr.site.name}
            </Link>
            <p className="text-sm text-stone-600">{tr.site.tagline}</p>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
          {tr.site.demoNotice}
        </footer>
      </body>
    </html>
  );
}
