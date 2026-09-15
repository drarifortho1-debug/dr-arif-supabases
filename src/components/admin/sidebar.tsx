"use client";

import {
  CalendarCheck,
  ExternalLink,
  Images,
  Inbox,
  Film,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Newspaper,
  PanelsTopLeft,
  Settings,
  Stethoscope,
  Tags,
  ImagePlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/lib/actions/auth";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pages", label: "Pages", icon: PanelsTopLeft },
  { href: "/admin/treatments", label: "Treatments", icon: Stethoscope },
  { href: "/admin/posts", label: "Blog posts", icon: Newspaper },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/videos", label: "Videos", icon: Film },
  { href: "/admin/gallery", label: "Gallery", icon: ImagePlus },
  { href: "/admin/media", label: "Media library", icon: Images },
  { href: "/admin/menus", label: "Menus", icon: MenuIcon },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
] as const;

export function AdminSidebar({
  name,
  email,
  role,
  counts,
}: {
  name: string;
  email: string;
  role: "admin" | "editor";
  counts: { appointments: number; messages: number };
}) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);

  // Close the drawer when the route changes (state derived during render,
  // which avoids an extra effect-triggered render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const items = NAV.filter((item) => !("adminOnly" in item && item.adminOnly) || role === "admin");

  const isActive = (item: (typeof NAV)[number]) =>
    "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const badgeFor = (href: string) => {
    if (href === "/admin/appointments") return counts.appointments;
    if (href === "/admin/messages") return counts.messages;
    return 0;
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
      {items.map((item) => {
        const badge = badgeFor(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item)
                ? "bg-brand-600 text-white"
                : "text-ink-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="flex-1">{item.label}</span>
            {badge > 0 ? (
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                  isActive(item) ? "bg-white/20 text-white" : "bg-brand-500 text-white",
                )}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const panel = (
    <div className="flex h-full flex-col gap-5 bg-ink-900 py-5">
      <div className="flex items-center justify-between px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Stethoscope className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-white">Doctor CMS</span>
            <span className="text-[11px] text-ink-400">Content manager</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="text-ink-400 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {nav}

      <div className="mt-auto flex flex-col gap-3 px-3">
        <a
          href={`/${DEFAULT_LOCALE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} aria-hidden />
          View website
        </a>

        <div className="rounded-lg bg-white/5 p-3">
          <p className="truncate text-sm font-medium text-white">{name || email}</p>
          <p className="mt-0.5 truncate text-xs text-ink-400">{email}</p>
          <p className="mt-1 inline-flex rounded-full bg-brand-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-300">
            {role}
          </p>

          <form action={signOutAction} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-ink-300 transition-colors hover:border-red-500/40 hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-200 bg-white px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Stethoscope className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-bold text-ink-900">Doctor CMS</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600"
        >
          <MenuIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* desktop rail */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{panel}</aside>

      {/* mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/50"
          />
          <div className="absolute inset-y-0 left-0 w-[min(17rem,85vw)]">{panel}</div>
        </div>
      ) : null}
    </>
  );
}
