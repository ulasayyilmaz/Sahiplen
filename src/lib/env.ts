// Public Supabase settings. Both values are safe to expose to the browser;
// data is protected by RLS. The service_role key must never be used in this app.
//
// process.env.NEXT_PUBLIC_* must be referenced literally so Next.js can inline them.
// Read lazily so builds without .env.local still succeed.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}
