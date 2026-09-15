"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthState = { error: string } | { error: null };

const credentials = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  // Only allow same-origin admin paths, never an absolute URL.
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add your keys to .env.local first." };
  }

  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error:
          "This email address has not been confirmed yet. Open the confirmation link, or turn off 'Confirm email' under Supabase → Authentication → Providers → Email.",
      };
    }
    return { error: "Wrong email or password." };
  }

  redirect(safeNext(formData.get("next")));
}

/**
 * Creates the very first account. The `handle_new_user` trigger promotes it to
 * administrator, and `setup_required()` stops returning true afterwards, so
 * this path closes itself after the first use.
 */
export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add your keys to .env.local first." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: setupRequired, error: rpcError } = await supabase.rpc("setup_required");

  if (rpcError) {
    return {
      error:
        "Could not reach the database. Have you run supabase/migrations/0001_init.sql yet?",
    };
  }

  if (!setupRequired) {
    return { error: "An administrator already exists. Ask them to create your account." };
  }

  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase hides whether an email is taken by returning a user with no
  // identities and sending no email. Say so instead of promising an inbox.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return {
      error:
        "An account with this email already exists (it may have been created in the Supabase dashboard). Sign in with its password instead.",
    };
  }

  // With "Confirm email" enabled in Supabase there is no session yet.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "Account created. Check your inbox to confirm the email address, then sign in.",
    };
  }

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
