import Link from "next/link";

import { logOut } from "@/lib/auth/actions";
import { getCurrentUser, isPlatformAdmin } from "@/lib/auth/session";
import { tr } from "@/lib/strings/tr";

const navLinkClass = "text-sm font-medium text-stone-700 hover:text-stone-950";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <Link href="/" className="text-xl font-bold text-amber-800">
            {tr.site.name}
          </Link>
          <p className="text-sm text-stone-600">{tr.site.tagline}</p>
        </div>
        <nav aria-label={tr.nav.label}>
          <ul className="flex flex-wrap items-center gap-4">
            {user ? (
              <>
                <li>
                  <Link href="/panel" className={navLinkClass}>
                    {tr.nav.panel}
                  </Link>
                </li>
                {isPlatformAdmin(user) && (
                  <li>
                    <Link href="/yonetim" className={navLinkClass}>
                      {tr.nav.admin}
                    </Link>
                  </li>
                )}
                <li>
                  <form action={logOut}>
                    <button type="submit" className={navLinkClass}>
                      {tr.nav.logout}
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <Link href="/giris" className={navLinkClass}>
                  {tr.nav.staffLogin}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
