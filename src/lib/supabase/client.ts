import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase client for Client Components. Uses the session cookie set on login.
 * Only used where the browser must talk to Supabase directly (photo uploads);
 * everything else goes through Server Components and Server Actions.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
