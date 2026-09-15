import { ArrowUpRight } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { localePath, type Locale } from "@/lib/i18n";
import { isOptimizableImage } from "@/lib/image";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ Badge */

export function Badge({ text, className }: { text: ReactNode; className?: string }) {
  if (!text) return null;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-blue-light/30 bg-blue-light/8 px-4 pt-1.5 pb-1 text-sm font-semibold tracking-wide text-blue-light",
        className,
      )}
    >
      {text}
    </div>
  );
}

/* ----------------------------------------------------------- SafeImage */

/**
 * Wrapper around next/image that falls back to an unoptimised <img> for hosts
 * not configured in next.config.ts, so a pasted external URL never breaks.
 */
export function SafeImage({ alt, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const unoptimized = props.unoptimized ?? (src ? !isOptimizableImage(src) : false);
  return <Image {...props} alt={alt ?? ""} unoptimized={unoptimized} />;
}

/* ----------------------------------------------------------- SmartLink */

export function isExternalHref(href: string): boolean {
  return /^(https?:|tel:|mailto:|whatsapp:)/.test(href) || href.startsWith("//");
}

/**
 * Internal links get the locale prefix; tel:/mailto:/https: pass straight
 * through (https opens in a new tab).
 */
export function SmartLink({
  href,
  locale,
  className,
  children,
  newTab,
  onClick,
  ariaLabel,
}: {
  href: string;
  locale: Locale;
  className?: string;
  children: ReactNode;
  newTab?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const target = href || "/";

  if (isExternalHref(target) || target.startsWith("#")) {
    const external = target.startsWith("http") || target.startsWith("//");
    return (
      <a
        href={target}
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
        target={external || newTab ? "_blank" : undefined}
        rel={external || newTab ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={localePath(locale, target)}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      target={newTab ? "_blank" : undefined}
    >
      {children}
    </Link>
  );
}

/* --------------------------------------------------------- Section shell */

const BACKGROUNDS: Record<string, string> = {
  white: "bg-white",
  slate: "bg-slate-50/50 border-y border-slate-100",
  dark: "bg-blue-dark text-white",
  gradient:
    "bg-linear-to-br from-blue-light/10 via-slate-50 to-blue-dark/10 border-y border-slate-100",
};

export function sectionBg(background?: string | null): string {
  return BACKGROUNDS[background ?? "white"] ?? BACKGROUNDS.white;
}

export function isDarkBg(background?: string | null): boolean {
  return background === "dark";
}

export function SectionShell({
  background,
  anchor,
  narrow,
  className,
  children,
}: {
  background?: string | null;
  anchor?: string | null;
  narrow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={anchor || undefined}
      className={cn("section-padding w-full overflow-hidden", sectionBg(background), className)}
    >
      <div className={narrow ? "mx-auto max-w-3xl px-5" : "max-container"}>{children}</div>
    </section>
  );
}

export function SectionHeader({
  badge,
  heading,
  subtitle,
  dark,
  align = "left",
  className,
}: {
  badge?: string;
  heading?: string;
  subtitle?: string;
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  if (!badge && !heading && !subtitle) return null;
  return (
    <div
      className={cn(
        "mb-12 max-w-2xl space-y-3",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {badge ? <Badge text={badge} /> : null}
      {heading ? (
        <h2
          className={cn(
            "text-3xl font-bold tracking-tight md:text-4xl",
            dark ? "text-white" : "text-blue-dark",
          )}
        >
          {heading}
        </h2>
      ) : null}
      {subtitle ? (
        <p className={cn("text-base leading-relaxed", dark ? "text-white/70" : "text-slate-500")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** Heading row with the heading on the left and a link/extra on the right. */
export function SplitHeader({
  badge,
  heading,
  right,
  className,
}: {
  badge?: string;
  heading?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col items-start justify-between gap-6 border-b border-slate-100 pb-8 text-left md:flex-row md:items-end",
        className,
      )}
    >
      <div className="max-w-xl space-y-3">
        {badge ? <Badge text={badge} /> : null}
        {heading ? (
          <h2 className="text-3xl font-bold tracking-tight text-blue-dark md:text-4xl">{heading}</h2>
        ) : null}
      </div>
      {right}
    </div>
  );
}

/* ------------------------------------------------------------- Buttons */

export function PrimaryButton({
  href,
  locale,
  children,
  className,
  arrow,
}: {
  href: string;
  locale: Locale;
  children: ReactNode;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <SmartLink href={href} locale={locale} className={cn("primary-btn", className)}>
      <span>{children}</span>
      {arrow ? <ArrowUpRight className="h-4 w-4 text-slate-200" aria-hidden /> : null}
    </SmartLink>
  );
}

/* ----------------------------------------------------------- Rich text */

export function RichText({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) {
  if (!html || !html.trim()) return null;
  return (
    <div
      className={cn("blog-rich-text text-slate-600 leading-relaxed", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Strip tags for previews and meta descriptions. */
export function stripHtml(html: string | null | undefined): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
