"use client";

import { Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALE_LABELS, LOCALE_SHORT, localePath, stripLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Swaps the locale segment of the current URL, so the visitor stays on the
 * same page when switching languages.
 */
export function LanguageSwitcher({
  locale,
  available,
  variant = "light",
}: {
  locale: Locale;
  available: Locale[];
  variant?: "light" | "dark";
}) {
  const pathname = usePathname() ?? "/";

  if (available.length < 2) return null;

  // Same page, other language: strip any prefix, then re-add per the scheme
  // (default language unprefixed, others under /xx).
  const hrefFor = (target: Locale) => localePath(target, stripLocale(pathname));

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full p-0.5",
        variant === "dark" ? "bg-white/10" : "bg-ink-100",
      )}
    >
      <Globe
        className={cn(
          "ml-2 h-3.5 w-3.5",
          variant === "dark" ? "text-white/60" : "text-ink-400",
        )}
        aria-hidden
      />
      {available.map((item) => (
        <Link
          key={item}
          href={hrefFor(item)}
          hrefLang={item}
          aria-label={LOCALE_LABELS[item]}
          aria-current={item === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            item === locale
              ? variant === "dark"
                ? "bg-white text-ink-900"
                : "bg-white text-brand-700 shadow-sm"
              : variant === "dark"
                ? "text-white/70 hover:text-white"
                : "text-ink-500 hover:text-ink-800",
          )}
        >
          {LOCALE_SHORT[item]}
        </Link>
      ))}
    </div>
  );
}
