import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import type { ProfileRow } from "@/lib/cms/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface StaffSession {
  userId: string;
  email: string;
  profile: ProfileRow;
}

/**
 * Resolve the signed-in staff member.
 *
 * `getUser()` (not `getSession()`) is used deliberately: it validates the JWT
 * with Supabase instead of trusting the cookie. Wrapped in React `cache` so a
 * single request hits auth once no matter how many components ask.
 */
export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile: profile as ProfileRow,
  };
});

/**
 * Guard for admin pages. Redirects to the login screen when not signed in.
 *
 * An account that is authenticated but has no active staff profile is sent
 * through /admin/logout instead — otherwise proxy.ts would bounce it straight
 * back from /admin/login to /admin and the two redirects would loop forever.
 */
export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (session) return session;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/admin/logout?reason=no-access");
  }

  redirect("/admin/login");
}

/** Guard for admin-only areas such as user management. */
export async function requireAdmin(): Promise<StaffSession> {
  const session = await requireStaff();
  if (session.profile.role !== "admin") {
    redirect("/admin?error=admin-only");
  }
  return session;
}

/**
 * Authorisation check for Server Actions. Unlike `requireStaff` it throws
 * instead of redirecting, so the action can return a typed error to the form.
 */
export async function assertStaff(): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) throw new Error("You are not signed in. Please sign in again.");
  return session;
}

export async function assertAdmin(): Promise<StaffSession> {
  const session = await assertStaff();
  if (session.profile.role !== "admin") {
    throw new Error("Only an administrator can perform this action.");
  }
  return session;
}
