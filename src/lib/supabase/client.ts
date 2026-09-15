"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/cms/database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Browser client, used by the admin panel for sign-in and for uploading files
 * straight to Supabase Storage (which keeps large uploads out of the Server
 * Action request body).
 */
export function createSupabaseBrowserClient() {
  if (!cached) {
    cached = createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
  }
  return cached;
}
