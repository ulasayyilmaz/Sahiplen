import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["email", "signup", "recovery", "email_change"];

/**
 * Target of the links in Supabase emails (sign-up confirmation, password reset).
 * Supports both the token_hash links from our templates and the ?code= links
 * Supabase sends with its default templates. On success the user is logged in.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const tokenHash = searchParams.get("token_hash");
  const type = OTP_TYPES.find((t) => t === searchParams.get("type"));
  const code = searchParams.get("code");

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  const target = ok ? next : "/giris?hata=baglanti";
  return NextResponse.redirect(new URL(target, request.url));
}
