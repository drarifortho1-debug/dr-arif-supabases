import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Signs the visitor out and returns them to the login screen.
 *
 * Used when someone is authenticated with Supabase but has no active staff
 * profile (for example an account created in the Supabase dashboard before the
 * migrations ran, or a suspended editor). A Server Component cannot clear
 * cookies itself, so the guard redirects here instead.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const reason = request.nextUrl.searchParams.get("reason");
  const target = new URL("/admin/login", request.url);
  if (reason) target.searchParams.set("error", reason);

  return NextResponse.redirect(target);
}
