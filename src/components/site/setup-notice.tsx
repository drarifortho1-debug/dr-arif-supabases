import { ArrowRight, Database, KeyRound, LayoutDashboard } from "lucide-react";
import Link from "next/link";

import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Shown on a fresh install when there is no published home page yet, so the
 * very first `npm run dev` explains what to do instead of rendering nothing.
 */
export function SetupNotice() {
  const configured = isSupabaseConfigured();

  const steps = [
    {
      icon: KeyRound,
      title: "Add your Supabase keys",
      body: "Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.",
      done: configured,
    },
    {
      icon: Database,
      title: "Run the SQL migrations",
      body: "In the Supabase dashboard open SQL Editor and run supabase/migrations/0001_init.sql, then 0002_seed.sql for demo content.",
      done: false,
    },
    {
      icon: LayoutDashboard,
      title: "Sign up and start building",
      body: "Open /admin, create the first account (it automatically becomes the administrator) and build your pages from sections.",
      done: false,
    },
  ];

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          Setup
        </span>
        <h1 className="mt-4 text-3xl font-bold text-ink-900 sm:text-4xl">
          Your CMS is installed
        </h1>
        <p className="mt-3 text-ink-600">
          There is no published home page yet. Finish these three steps and this screen will be
          replaced by your own content.
        </p>
      </div>

      <ol className="mx-auto mt-10 flex max-w-2xl flex-col gap-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-ink-200/70 bg-white p-5"
          >
            <span
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                step.done ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"
              }`}
            >
              <step.icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold text-ink-900">
                {index + 1}. {step.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex justify-center">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Open the admin panel
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
