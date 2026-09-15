import {
  ArrowRight,
  CalendarCheck,
  Images,
  Inbox,
  Newspaper,
  PanelsTopLeft,
  Settings,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { AppointmentRow, PageRow } from "@/lib/cms/database.types";
import { t } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireStaff();
  const { error } = await searchParams;

  const supabase = await createSupabaseServerClient();

  const [pages, posts, media, newAppointments, newMessages, recentPages, recentAppointments] =
    await Promise.all([
      supabase.from("pages").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("media").select("id", { count: "exact", head: true }),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("pages")
        .select("id, title, slug, status, updated_at, is_home")
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("appointments")
        .select("id, name, phone, department, preferred_date, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: "Pages", value: pages.count ?? 0, href: "/admin/pages", icon: PanelsTopLeft },
    { label: "Blog posts", value: posts.count ?? 0, href: "/admin/posts", icon: Newspaper },
    { label: "Media files", value: media.count ?? 0, href: "/admin/media", icon: Images },
    {
      label: "New appointments",
      value: newAppointments.count ?? 0,
      href: "/admin/appointments",
      icon: CalendarCheck,
      highlight: (newAppointments.count ?? 0) > 0,
    },
    {
      label: "New messages",
      value: newMessages.count ?? 0,
      href: "/admin/messages",
      icon: Inbox,
      highlight: (newMessages.count ?? 0) > 0,
    },
  ];

  const greetingName = session.profile.full_name?.split(" ")[0] || session.email;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${greetingName}`}
        description="Here is what is happening on your website."
      />

      {error === "admin-only" ? (
        <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
          That area is limited to administrators.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group flex flex-col gap-3 rounded-xl border bg-white p-4 transition-colors hover:border-brand-400 ${
              stat.highlight ? "border-brand-300" : "border-ink-200"
            }`}
          >
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                stat.highlight ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
              }`}
            >
              <stat.icon className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span>
              <span className="block text-2xl font-bold text-ink-900">{stat.value}</span>
              <span className="block text-xs text-ink-500">{stat.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-ink-200 bg-white">
          <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-ink-900">Recently edited pages</h2>
            <Link
              href="/admin/pages"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
            >
              All pages <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </header>
          <ul className="divide-y divide-ink-100">
            {((recentPages.data ?? []) as Pick<
              PageRow,
              "id" | "title" | "slug" | "status" | "updated_at" | "is_home"
            >[]).map((page) => (
              <li key={page.id}>
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink-50/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-900">
                      {t(page.title, "en") || page.slug}
                    </span>
                    <span className="block text-xs text-ink-400">
                      {formatDateTime(page.updated_at)}
                    </span>
                  </span>
                  <StatusBadge status={page.status} />
                </Link>
              </li>
            ))}
            {(recentPages.data ?? []).length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-ink-500">No pages yet.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-xl border border-ink-200 bg-white">
          <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-ink-900">Latest appointment requests</h2>
            <Link
              href="/admin/appointments"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
            >
              Inbox <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </header>
          <ul className="divide-y divide-ink-100">
            {((recentAppointments.data ?? []) as Pick<
              AppointmentRow,
              "id" | "name" | "phone" | "department" | "preferred_date" | "status" | "created_at"
            >[]).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink-900">
                    {item.name}
                  </span>
                  <span className="block truncate text-xs text-ink-400">
                    {[item.department, item.phone].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <StatusBadge status={item.status} />
              </li>
            ))}
            {(recentAppointments.data ?? []).length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-ink-500">
                No appointment requests yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <Settings className="h-4 w-4" aria-hidden />
          Site settings
        </Link>
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          <Newspaper className="h-4 w-4" aria-hidden />
          Write a post
        </Link>
      </div>
    </>
  );
}
