import { Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { Alert } from "@/components/admin/ui";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in" };

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

async function setupRequired(): Promise<{ required: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { required: false, error: "not-configured" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("setup_required");
    if (error) return { required: false, error: "no-schema" };
    return { required: Boolean(data), error: null };
  } catch {
    return { required: false, error: "no-schema" };
  }
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { next = "/admin", error: queryError } = await searchParams;
  const { required, error } = await setupRequired();

  const mode = required ? "setup" : "signin";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Stethoscope className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink-900">
              {mode === "setup" ? "Set up your CMS" : "Admin panel"}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {mode === "setup"
                ? "Create the first account. It becomes the administrator."
                : "Sign in to manage your website content."}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
          {error === "not-configured" ? (
            <Alert tone="warning">
              <p className="font-semibold">Supabase is not configured</p>
              <p className="mt-1">
                Copy <code className="font-mono">.env.example</code> to{" "}
                <code className="font-mono">.env.local</code>, add your project URL and keys,
                then restart <code className="font-mono">npm run dev</code>.
              </p>
            </Alert>
          ) : error === "no-schema" ? (
            <Alert tone="warning">
              <p className="font-semibold">Database schema missing</p>
              <p className="mt-1">
                Open the Supabase SQL Editor and run{" "}
                <code className="font-mono">supabase/migrations/0001_init.sql</code>, then
                reload this page.
              </p>
            </Alert>
          ) : (
            <>
              {queryError === "no-access" ? (
                <div className="mb-4">
                  <Alert tone="warning">
                    <p className="font-semibold">This account cannot use the admin panel</p>
                    <p className="mt-1">
                      It exists in Supabase but has no active staff profile. Ask an
                      administrator to add you under Admin → Users, or — if you are setting
                      up the site — run <code className="font-mono">0001_init.sql</code>{" "}
                      before creating the first account.
                    </p>
                  </Alert>
                </div>
              ) : null}
              <LoginForm mode={mode} next={next} />
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          <Link href="/" className="hover:text-ink-600">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
