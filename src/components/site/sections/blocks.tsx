import { ArrowUpRight, ChevronDown } from "lucide-react";

import {
  Badge,
  RichText,
  SafeImage,
  SectionHeader,
  SectionShell,
  SmartLink,
  isDarkBg,
  sectionBg,
} from "@/components/site/ui";
import { SCOPE_ATTR, sanitizeHtml, scopeCss } from "@/lib/cms/scoped-css";
import { getDictionary } from "@/lib/dictionary";
import { getYouTubeId, telHref } from "@/lib/image";
import { cn } from "@/lib/utils";

import { columnClass, sa, sb, sl, sx, type SectionProps } from "./shared";

/* ---------------------------------------------------------- rich text */

export function RichTextSection({ data, locale }: SectionProps) {
  return (
    <SectionShell
      background={sx(data, "background", "white")}
      anchor={sx(data, "anchor")}
      narrow={sx(data, "width", "narrow") !== "full"}
    >
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} />
      <RichText html={sl(data, "html", locale)} className="text-base md:text-lg" />
    </SectionShell>
  );
}

/* ------------------------------------------------------- image + text */

export function ImageTextSection({ data, locale }: SectionProps) {
  const imageLeft = sx(data, "image_position", "right") === "left";
  const image = sx(data, "image");
  const buttonLabel = sl(data, "button_label", locale);
  const buttonHref = sx(data, "button_href");
  const heading = sl(data, "heading", locale);

  return (
    <SectionShell background={sx(data, "background", "white")} anchor={sx(data, "anchor")}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className={cn("space-y-5 text-left", imageLeft && "lg:order-2")}>
          <Badge text={sl(data, "badge", locale)} />
          {heading ? (
            <h2 className="text-3xl font-bold tracking-tight text-blue-dark md:text-4xl">{heading}</h2>
          ) : null}
          <RichText html={sl(data, "html", locale)} />
          {buttonLabel && buttonHref ? (
            <div className="pt-2">
              <SmartLink href={buttonHref} locale={locale} className="primary-btn">
                <span>{buttonLabel}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </SmartLink>
            </div>
          ) : null}
        </div>
        {image ? (
          <div className={cn("relative", imageLeft && "lg:order-1")}>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-xl shadow-slate-950/5">
              <SafeImage src={image} alt={heading} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 600px" />
            </div>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

/* ---------------------------------------------------------- card grid */

export function CardGridSection({ data, locale }: SectionProps) {
  const items = sa(data, "items");
  const showImages = sb(data, "show_images", true);

  return (
    <SectionShell background={sx(data, "background", "slate")} anchor={sx(data, "anchor")}>
      <SectionHeader
        badge={sl(data, "badge", locale)}
        heading={sl(data, "heading", locale)}
        subtitle={sl(data, "subtitle", locale)}
      />
      <div className={cn("grid grid-cols-1 gap-5", columnClass(sx(data, "columns", "3")))}>
        {items.map((item, index) => {
          const title = sl(item, "title", locale);
          const desc = sl(item, "desc", locale);
          const image = sx(item, "image");
          const href = sx(item, "href");
          const inner = (
            <>
              {showImages && image ? (
                <div className="relative mb-3 aspect-4/3 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  <SafeImage src={image} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 400px" />
                </div>
              ) : null}
              <div className="space-y-1.5 px-1.5 pb-1">
                {title ? <h3 className="text-lg font-bold text-blue-dark">{title}</h3> : null}
                {desc ? <p className="text-sm leading-relaxed text-slate-500">{desc}</p> : null}
              </div>
            </>
          );
          const cls =
            "group flex flex-col items-start rounded-xl border border-slate-100 bg-white p-2 text-left shadow-sm shadow-slate-100/50 transition-all duration-300 hover:border-slate-200/80 hover:shadow-md";
          return href ? (
            <SmartLink key={index} href={href} locale={locale} className={cls}>
              {inner}
            </SmartLink>
          ) : (
            <div key={index} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ----------------------------------------------------------------- FAQ */

export function FaqSection({ data, locale }: SectionProps) {
  const items = sa(data, "items").filter((item) => sl(item, "q", locale));

  return (
    <SectionShell background={sx(data, "background", "white")} anchor={sx(data, "anchor")} narrow>
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} align="center" />
      <div className="space-y-3">
        {items.map((item, index) => (
          <details
            key={index}
            className="group rounded-2xl border border-slate-100 bg-white transition-all open:border-slate-200/80 open:shadow-md"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-bold text-blue-dark select-none [&::-webkit-details-marker]:hidden">
              <span>{sl(item, "q", locale)}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180" aria-hidden />
            </summary>
            <div className="px-6 pb-6 leading-relaxed whitespace-pre-line text-slate-600">{sl(item, "a", locale)}</div>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

/* ---------------------------------------------------------- custom CTA */

export function CustomCtaSection({ data, locale }: SectionProps) {
  const background = sx(data, "background", "gradient");
  const dark = isDarkBg(background);
  const primaryLabel = sl(data, "primary_label", locale);
  const primaryHref = sx(data, "primary_href");
  const secondaryLabel = sl(data, "secondary_label", locale);
  const secondaryHref = sx(data, "secondary_href");
  const heading = sl(data, "heading", locale);
  const body = sl(data, "body", locale);

  return (
    <section
      id={sx(data, "anchor") || undefined}
      className={cn("relative w-full overflow-hidden py-20 md:py-24", sectionBg(background))}
    >
      {!dark ? (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0f766e0a_1px,transparent_1px),linear-gradient(to_bottom,#0f766e0a_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_center,transparent_20%,black_100%)]" />
      ) : null}
      <div className="max-container relative z-10">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center lg:gap-20">
          <div className="max-w-2xl space-y-4 text-left">
            <Badge text={sl(data, "badge", locale)} />
            {heading ? (
              <h2 className={cn("text-3xl font-bold leading-tight tracking-tight md:text-4xl", dark ? "text-white" : "text-blue-dark")}>
                {heading}
              </h2>
            ) : null}
            {body ? (
              <p className={cn("text-sm font-medium leading-relaxed md:text-base", dark ? "text-white/70" : "text-slate-500")}>{body}</p>
            ) : null}
          </div>
          <div className="flex w-full shrink-0 flex-col gap-4 sm:w-auto sm:flex-row">
            {primaryLabel && primaryHref ? (
              <SmartLink
                href={primaryHref}
                locale={locale}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-light px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-blue-dark active:scale-95"
              >
                {primaryLabel}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </SmartLink>
            ) : null}
            {secondaryLabel && secondaryHref ? (
              <SmartLink
                href={secondaryHref}
                locale={locale}
                className={cn(
                  "inline-flex items-center justify-center gap-2.5 rounded-xl border px-6 py-3 text-sm font-bold transition-all duration-300 active:scale-95",
                  dark ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : "border-slate-200 bg-white text-blue-dark hover:bg-slate-50",
                )}
              >
                {secondaryLabel}
              </SmartLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- video embed */

export function VideoEmbedSection({ data, locale }: SectionProps) {
  const items = sa(data, "items")
    .map((item) => ({ id: getYouTubeId(sx(item, "url")), title: sl(item, "title", locale) }))
    .filter((item) => item.id);

  if (items.length === 0) return null;

  return (
    <SectionShell background={sx(data, "background", "slate")} anchor={sx(data, "anchor")}>
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} />
      <div className={cn("grid grid-cols-1 gap-5", columnClass(sx(data, "columns", "2"), "2"))}>
        {items.map((video, index) => (
          <div key={index} className="flex flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
              <iframe
                className="h-full w-full border-0"
                src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
                title={video.title || "YouTube video player"}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            {video.title ? <p className="px-2 pt-3 pb-1 text-sm font-semibold text-blue-dark">{video.title}</p> : null}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------ counters */

export function CountersSection({ data, locale }: SectionProps) {
  const background = sx(data, "background", "slate");
  const dark = isDarkBg(background);
  const items = sa(data, "items").filter((item) => sl(item, "value", locale));

  if (items.length === 0) return null;

  return (
    <SectionShell background={background} anchor={sx(data, "anchor")}>
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} dark={dark} align="center" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn("rounded-2xl border p-7 text-center", dark ? "border-white/10 bg-white/5" : "border-slate-100 bg-white shadow-sm")}
          >
            <p className="text-4xl font-black tracking-tight text-blue-light md:text-5xl">{sl(item, "value", locale)}</p>
            {sl(item, "label", locale) ? (
              <p className={cn("mt-2 text-sm font-semibold", dark ? "text-white/70" : "text-slate-500")}>{sl(item, "label", locale)}</p>
            ) : null}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* --------------------------------------------------------------- links */

export function LinksSection({ data, locale }: SectionProps) {
  const items = sa(data, "items").filter((item) => sl(item, "label", locale) && sx(item, "href"));

  if (items.length === 0) return null;

  return (
    <SectionShell background={sx(data, "background", "white")} anchor={sx(data, "anchor")}>
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} />
      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <SmartLink
            key={index}
            href={sx(item, "href")}
            locale={locale}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-sm font-bold text-blue-dark transition-all hover:border-blue-light/40 hover:bg-slate-50 active:scale-98"
          >
            {sl(item, "label", locale)}
            <ArrowUpRight className="h-4 w-4 text-blue-light" aria-hidden />
          </SmartLink>
        ))}
      </div>
    </SectionShell>
  );
}

/* --------------------------------------------------------- doctor hero */

export function DoctorHeroSection({ data, locale }: SectionProps) {
  const dict = getDictionary(locale);
  const stats = sa(data, "stats").filter((item) => sl(item, "value", locale) || sl(item, "label", locale));
  const photo = sx(data, "photo");
  const name = sl(data, "name", locale);
  const heading = sl(data, "heading", locale);
  const primaryLabel = sl(data, "primary_label", locale);
  const secondaryLabel = sl(data, "secondary_label", locale);
  const breadcrumbCurrent = sl(data, "breadcrumb_current", locale);

  return (
    <section id={sx(data, "anchor") || undefined} className={cn("w-full", sectionBg(sx(data, "background", "white")))}>
      <div className="max-container pt-5 pb-14 md:pb-16">
        {breadcrumbCurrent ? (
          <nav aria-label="breadcrumb" className="mb-8 text-[13px] text-slate-500">
            <SmartLink href={sx(data, "breadcrumb_href", "/")} locale={locale} className="font-semibold text-blue-light transition-colors hover:text-blue-dark">
              {sl(data, "breadcrumb_label", locale) || dict.backHome}
            </SmartLink>
            <span className="mx-2 text-slate-300">/</span>
            <span>{breadcrumbCurrent}</span>
          </nav>
        ) : null}

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {sl(data, "credentials", locale) ? (
              <p className="mb-3.5 text-[13.5px] font-semibold tracking-wide text-blue-light">{sl(data, "credentials", locale)}</p>
            ) : null}
            {heading ? (
              <h1
                className={cn(
                  "mb-4 text-4xl font-extrabold leading-[1.15] tracking-tight text-blue-dark sm:text-5xl",
                  sb(data, "heading_en", false) && "font-google-sans",
                )}
              >
                {heading}
              </h1>
            ) : null}
            {name ? <p className="mb-2.5 text-lg font-bold text-slate-800 md:text-xl">{name}</p> : null}
            {sl(data, "position", locale) ? (
              <p className="mb-7 text-[15px] leading-relaxed text-slate-500">{sl(data, "position", locale)}</p>
            ) : null}

            {stats.length > 0 ? (
              <div className="mb-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white px-3 py-4 text-center">
                    <span className="block text-[22px] font-extrabold text-blue-dark">{sl(stat, "value", locale)}</span>
                    <span className="mt-1 block text-xs text-slate-500">{sl(stat, "label", locale)}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {primaryLabel && sx(data, "primary_href") ? (
                <SmartLink href={sx(data, "primary_href")} locale={locale} className="primary-btn">
                  {primaryLabel}
                </SmartLink>
              ) : null}
              {secondaryLabel && sx(data, "secondary_href") ? (
                <SmartLink
                  href={sx(data, "secondary_href")}
                  locale={locale}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {secondaryLabel}
                </SmartLink>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5">
              {photo ? (
                <SafeImage src={photo} alt={sl(data, "photo_alt", locale) || name} fill className="rounded-xl object-cover object-bottom p-2.5" sizes="(max-width: 1024px) 100vw, 420px" priority />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl border border-slate-200 px-6 text-center text-[13px] text-slate-400">
                  {dict.addPhoto}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- emergency strip */

export function EmergencyStripSection({ data, locale }: SectionProps) {
  const message = sl(data, "message", locale);
  const buttonLabel = sl(data, "button_label", locale);
  const phone = sx(data, "phone");

  if (!message && !buttonLabel) return null;

  return (
    <div id={sx(data, "anchor") || undefined} className="w-full border-y border-rose-200/70 bg-rose-50">
      <div className="max-container flex flex-wrap items-center justify-between gap-3 py-3.5">
        {message ? <p className="text-[14.5px] font-semibold text-rose-700">{message}</p> : null}
        {buttonLabel && phone ? (
          <a href={telHref(phone)} className="inline-flex items-center gap-2 rounded-full bg-rose-700 px-5 py-2 text-[13.5px] font-bold text-white transition-colors hover:bg-rose-800">
            {buttonLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- case cards */

export function CaseCardsSection({ data, locale }: SectionProps) {
  const items = sa(data, "items");

  return (
    <SectionShell background={sx(data, "background", "white")} anchor={sx(data, "anchor")}>
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} subtitle={sl(data, "subtitle", locale)} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item, index) => (
          <article key={index} className="rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:border-blue-light/30 hover:shadow-sm">
            {sl(item, "tag", locale) ? (
              <span className="mb-2.5 block text-xs font-bold tracking-wider text-blue-light uppercase">{sl(item, "tag", locale)}</span>
            ) : null}
            {sl(item, "title", locale) ? <h3 className="mb-2.5 text-[17px] font-bold text-blue-dark">{sl(item, "title", locale)}</h3> : null}
            {sl(item, "body", locale) ? <p className="text-[14.5px] leading-relaxed text-slate-500">{sl(item, "body", locale)}</p> : null}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------- reviews panel */

export function ReviewsPanelSection({ data, locale }: SectionProps) {
  const items = sa(data, "items");
  const stats = sa(data, "fb_stats").filter((item) => sl(item, "value", locale) || sl(item, "label", locale));
  const fbHeading = sl(data, "fb_heading", locale);
  const fbText = sl(data, "fb_text", locale);
  const fbLabel = sl(data, "fb_label", locale);
  const fbHref = sx(data, "fb_href");
  const hasPanel = Boolean(fbHeading || fbText || fbLabel);

  return (
    <SectionShell background={sx(data, "background", "slate")} anchor={sx(data, "anchor")}>
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} subtitle={sl(data, "subtitle", locale)} />

      {items.length > 0 ? (
        <div className={cn("mb-12 grid grid-cols-1 gap-5", columnClass(sx(data, "columns", "3")))}>
          {items.map((item, index) => (
            <figure key={index} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
              {sl(item, "quote", locale) ? (
                <blockquote className="mb-4 text-[14.5px] leading-relaxed text-slate-700">{sl(item, "quote", locale)}</blockquote>
              ) : null}
              {sl(item, "author", locale) ? (
                <figcaption className="mt-auto text-[13px] font-bold text-slate-500">{sl(item, "author", locale)}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      {hasPanel ? (
        <div className="rounded-2xl bg-blue-dark p-8 md:p-10">
          <div className="max-w-2xl">
            {fbHeading ? <h3 className="mb-2 text-xl font-bold text-white">{fbHeading}</h3> : null}
            {fbText ? <p className="text-sm leading-relaxed text-white/70">{fbText}</p> : null}
            {stats.length > 0 ? (
              <div className="mt-6 flex gap-8">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <span className="block text-[26px] leading-none font-extrabold text-white">{sl(stat, "value", locale)}</span>
                    <span className="mt-1.5 block text-xs text-white/60">{sl(stat, "label", locale)}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {fbLabel && fbHref ? (
              <a href={fbHref} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-dark transition-colors hover:bg-slate-100">
                {fbLabel}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </SectionShell>
  );
}

/* ------------------------------------------------------- chambers info */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 flex gap-2 text-[13.5px] text-slate-500">
      <strong className="min-w-15 shrink-0 pt-0.5 text-xs font-semibold text-slate-700">{label}</strong>
      <span className="leading-relaxed">{value}</span>
    </div>
  );
}

export function ChambersInfoSection({ data, locale }: SectionProps) {
  const dict = getDictionary(locale);
  const items = sa(data, "items");

  return (
    <SectionShell background={sx(data, "background", "white")} anchor={sx(data, "anchor")}>
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} subtitle={sl(data, "subtitle", locale)} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((chamber, index) => {
          const name = sl(chamber, "name", locale);
          const mapUrl = sx(chamber, "map_url");
          const phone = sx(chamber, "phone");
          return (
            <div key={index} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="aspect-16/10 border-b border-slate-200 bg-slate-100">
                {mapUrl ? (
                  <iframe src={mapUrl} title={name || "Map"} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-slate-400">{dict.addMap}</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                {name ? <h3 className="mb-3 text-[16.5px] font-bold text-blue-dark">{name}</h3> : null}
                {sl(chamber, "address", locale) ? <InfoRow label={sl(data, "address_label", locale) || "ঠিকানা"} value={sl(chamber, "address", locale)} /> : null}
                {sl(chamber, "hours", locale) ? <InfoRow label={sl(data, "hours_label", locale) || "সময়"} value={sl(chamber, "hours", locale)} /> : null}
                {phone ? <InfoRow label={sl(data, "phone_label", locale) || "ফোন"} value={phone} /> : null}
                {phone ? (
                  <div className="mt-auto pt-5">
                    <a href={telHref(phone)} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-light px-4 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-blue-dark">
                      {sl(chamber, "button_label", locale) || "কল করুন"}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------- services grid */

export function ServicesGridSection({ data, locale }: SectionProps) {
  const items = sa(data, "items");
  const ctaHeading = sl(data, "cta_heading", locale);
  const ctaText = sl(data, "cta_text", locale);
  const ctaLabel = sl(data, "cta_label", locale);
  const ctaHref = sx(data, "cta_href");
  const hasCta = Boolean(ctaHeading || ctaText || ctaLabel);

  return (
    <SectionShell background={sx(data, "background", "white")} anchor={sx(data, "anchor")}>
      <SectionHeader badge={sl(data, "badge", locale)} heading={sl(data, "heading", locale)} subtitle={sl(data, "subtitle", locale)} />

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className={cn("grid grid-cols-1 gap-px bg-slate-200", columnClass(sx(data, "columns", "3")))}>
            {items.map((item, index) => {
              const highlight = sb(item, "highlight", false);
              const href = sx(item, "href");
              return (
                <div
                  key={index}
                  className={cn("group flex flex-col px-6 py-7 transition-colors duration-300", highlight ? "bg-blue-dark" : "bg-white hover:bg-slate-50/70")}
                >
                  {sl(item, "title", locale) ? (
                    <h3 className={cn("mb-2 text-[17px] font-bold", highlight ? "text-white" : "text-blue-dark")}>{sl(item, "title", locale)}</h3>
                  ) : null}
                  {sl(item, "desc", locale) ? (
                    <p className={cn("mb-4 text-sm leading-relaxed", highlight ? "text-white/70" : "text-slate-500")}>{sl(item, "desc", locale)}</p>
                  ) : null}
                  {href ? (
                    <SmartLink
                      href={href}
                      locale={locale}
                      className={cn("mt-auto inline-flex items-center gap-1.5 self-start text-[13.5px] font-bold transition-all group-hover:gap-2.5", highlight ? "text-white" : "text-blue-light")}
                    >
                      {sl(item, "link_label", locale) || "বিস্তারিত"}
                      <span aria-hidden="true">→</span>
                    </SmartLink>
                  ) : null}
                </div>
              );
            })}
          </div>

          {hasCta ? (
            <div className="flex flex-col justify-between gap-4 bg-blue-dark px-6 py-7 sm:flex-row sm:items-center sm:px-8">
              <div className="min-w-0">
                {ctaHeading ? <h3 className="mb-1.5 text-[17px] font-bold text-white">{ctaHeading}</h3> : null}
                {ctaText ? <p className="text-sm leading-relaxed text-white/70">{ctaText}</p> : null}
              </div>
              {ctaLabel && ctaHref ? (
                <SmartLink
                  href={ctaHref}
                  locale={locale}
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-dark transition-colors hover:bg-slate-100 sm:self-auto"
                >
                  {ctaLabel}
                  <span aria-hidden="true">→</span>
                </SmartLink>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </SectionShell>
  );
}

/* --------------------------------------------------------- custom HTML */

const CONTAINER: Record<string, string> = {
  default: "max-container",
  narrow: "mx-auto max-w-3xl px-5",
  full: "w-full",
};

export function CustomHtmlSection({ data, sectionId }: SectionProps) {
  const html = sanitizeHtml(sx(data, "html"));
  if (!html) return null;

  const css = scopeCss(sx(data, "css"), sectionId);
  const container = CONTAINER[sx(data, "container", "default")] ?? CONTAINER.default;

  return (
    <section
      id={sx(data, "anchor") || undefined}
      className={cn("section-padding w-full overflow-hidden", sectionBg(sx(data, "background", "white")))}
      {...{ [SCOPE_ATTR]: sectionId }}
    >
      {css ? (
        <style href={`sec-${sectionId}`} precedence="medium">
          {css}
        </style>
      ) : null}
      <div className={container} dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
