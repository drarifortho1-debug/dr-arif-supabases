import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "@/lib/cms/database.types";
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * Session-aware client for the admin panel. Reads and refreshes the auth
 * cookies, so every query runs as the signed-in user and RLS applies.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `cookies()` is read-only inside Server Components. Refreshing the
          // session there is fine to skip: proxy.ts already rotated the cookies
          // for this request.
        }
      },
    },
  });
}

/**
 * Anonymous client for the public website. It carries no cookies, which keeps
 * public pages cacheable and prevents a visitor's session from leaking into
 * shared cache entries.
 */
export function createSupabasePublicClient() {
  return createClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * Service-role client. Bypasses RLS entirely, so it is only used where an
 * admin has already been verified — currently user management, which needs the
 * Supabase Auth admin API.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
