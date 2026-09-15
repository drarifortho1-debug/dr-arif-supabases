import { CalendarCheck, ChevronsRight, GraduationCap, Hospital, Phone } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { ChamberCard, type ChamberTheme } from "@/components/site/chamber-card";
import { Badge, PrimaryButton, SafeImage, SmartLink } from "@/components/site/ui";
import { telHref } from "@/lib/image";

import { sa, sb, sl, sx, type SectionProps } from "./shared";

/* --------------------------------------------------------------- hero */

export function HeroSection({ data, locale }: SectionProps) {
  const anchor = sx(data, "anchor");
  const name1 = sl(data, "name_line1", locale);
  const name2 = sl(data, "name_line2", locale);
  const primaryLabel = sl(data, "primary_label", locale);
  const secondaryLabel = sl(data, "secondary_label", locale);
  const image = sx(data, "image") || "/doctor-img.png";

  return (
    <section
      id={anchor || undefined}
      className="relative w-full overflow-hidden bg-white pt-14 pb-28 md:pt-20"
    >
      <div className="max-container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-4">
          <div className="space-y-8 text-center md:text-left lg:col-span-7">
            <Badge text={sl(data, "badge", locale)} />

            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-blue-dark sm:text-[56px]">
              {name1} <br />
              <span className="text-blue-light">{name2}</span>
            </h1>

            <div className="space-y-3.5">
              <div className="flex items-start justify-center gap-3 md:justify-start">
                <GraduationCap className="mt-0.5 hidden h-5 w-5 shrink-0 text-blue-light md:block" aria-hidden />
                <div className="space-y-0.5 text-sm md:text-base">
                  <p className="font-bold text-blue-dark">{sl(data, "degrees", locale)}</p>
                  <p className="text-slate-600">{sl(data, "university", locale)}</p>
                </div>
              </div>

              <div className="flex items-start justify-center gap-3 text-slate-600 md:justify-start">
                <Hospital className="mt-0.5 hidden h-5 w-5 shrink-0 text-blue-light md:block" aria-hidden />
                <div className="space-y-0.5 text-sm md:text-base">
                  <p className="font-bold text-blue-dark">{sl(data, "position", locale)}</p>
                  <p className="text-slate-600">{sl(data, "hospital", locale)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4 md:justify-start">
              {primaryLabel ? (
                <a href={telHref(sx(data, "primary_phone"))} className="primary-btn">
                  <CalendarCheck className="h-4 w-4" aria-hidden />
                  <span className="pt-0.5">{primaryLabel}</span>
                </a>
              ) : null}
              {secondaryLabel ? (
                <SmartLink
                  href={sx(data, "secondary_href", "/about-us")}
                  locale={locale}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-7 py-2.5 text-sm font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 active:scale-98"
                >
                  <span className="pt-0.5">{secondaryLabel}</span>
                  <ChevronsRight size={18} aria-hidden />
                </SmartLink>
              ) : null}
            </div>
          </div>

          <div className="relative order-1 flex justify-center lg:order-2 lg:col-span-5 lg:justify-end">
            <div className="group relative mr-auto aspect-3/4 w-full max-w-[94%] md:mx-auto md:max-w-100">
              <div className="absolute inset-0 -translate-x-2 translate-y-2 -rotate-3 rounded-4xl bg-blue-light transition-transform duration-500 ease-out group-hover:translate-x-2 group-hover:translate-y-2 group-hover:rotate-0" />

              <div className="absolute inset-0 overflow-hidden rounded-4xl border-4 border-white bg-slate-100 p-4 shadow-xl shadow-slate-950/10">
                <SafeImage
                  width={500}
                  height={500}
                  src={image}
                  alt={`${name1} ${name2}`}
                  className="relative -bottom-4 h-full w-full object-cover object-bottom transition-transform duration-700 ease-out group-hover:scale-105"
                  priority
                />
              </div>

              {sb(data, "show_floating", true) ? (
                <div className="absolute -right-4 -bottom-8 flex max-w-52.5 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/95 px-5 py-4 shadow-2xl backdrop-blur-md transition-colors duration-300 hover:border-blue-light">
                  <div className="space-y-0.5">
                    <p className="text-sm font-black leading-tight tracking-wide text-slate-900">
                      {sl(data, "floating_title", locale)}
                    </p>
                    <p className="text-sm font-bold leading-tight text-slate-500">
                      {sl(data, "floating_subtitle", locale)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- stats video */

function Num({ value }: { value: string }) {
  return (
    <span className="inline-flex translate-y-0.75 items-center justify-center border-b-2 border-blue-light px-1 text-4xl font-black text-blue-light">
      {value}
    </span>
  );
}

/** Replaces {years} etc. in the sentence with highlighted numbers. */
function renderSentence(template: string, values: Record<string, string>): ReactNode[] {
  const parts = template.split(/(\{[a-z_]+\})/g);
  return parts.map((part, index) => {
    const match = part.match(/^\{([a-z_]+)\}$/);
    if (match) return <Num key={index} value={values[match[1]] ?? ""} />;
    return <span key={index}>{part}</span>;
  });
}

export function StatsVideoSection({ data, locale }: SectionProps) {
  const video = sx(data, "video") || "/intro-video.mp4";
  const sentence = sl(data, "sentence", locale);
  const values = {
    years: sl(data, "years", locale),
    surgeries: sl(data, "surgeries", locale),
    trauma: sl(data, "trauma", locale),
    patients: sl(data, "patients", locale),
  };

  return (
    <section id={sx(data, "anchor") || undefined} className="relative w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0 h-full w-full">
        <video src={video} muted autoPlay loop playsInline className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 py-20 md:py-50">
        <div className="max-container">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4 text-center lg:sticky lg:top-8 lg:text-left">
              <Badge text={sl(data, "badge", locale)} />
              <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
                {sl(data, "heading_line1", locale)} <br />
                {sl(data, "heading_line2", locale)}
              </h2>
            </div>

            <div className="text-center lg:text-left">
              <p className="text-xl font-semibold leading-[2.2] tracking-wide text-slate-300 md:text-2xl">
                {sentence ? renderSentence(sentence, values) : null}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------- treatments preview */

export function TreatmentsPreviewSection({ data, locale }: SectionProps) {
  const items = sa(data, "items");
  const buttonLabel = sl(data, "button_label", locale);

  return (
    <section id={sx(data, "anchor") || undefined} className="overflow-hidden bg-white py-24 md:py-32">
      <div className="max-container">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-slate-100 pb-8 md:flex-row md:items-end">
          <div className="max-w-xl space-y-3">
            <Badge text={sl(data, "badge", locale)} />
            <h2 className="text-3xl font-bold tracking-tight text-blue-dark md:text-4xl">
              {sl(data, "heading", locale)}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const label = sl(item, "label", locale);
            const image = sx(item, "image");
            return (
              <SmartLink
                key={index}
                href={sx(item, "href", "/our-treatments")}
                locale={locale}
                className="group flex flex-col items-start rounded-xl border border-slate-100 bg-white p-2 text-left shadow-sm shadow-slate-100/50 transition-all duration-300 hover:border-slate-200/80 hover:shadow-md"
              >
                <div className="relative mb-3 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  {image ? (
                    <SafeImage
                      src={image}
                      alt={label}
                      width={500}
                      height={500}
                      className="h-full w-full scale-101 object-cover object-center transition-transform duration-500 group-hover:scale-115"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="space-y-1.5 px-1.5">
                  <h3 className="text-lg font-bold text-blue-dark">{label}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{sl(item, "desc", locale)}</p>
                </div>
              </SmartLink>
            );
          })}
        </div>

        {buttonLabel ? (
          <div className="mt-16 text-center">
            <PrimaryButton href={sx(data, "button_href", "/our-treatments")} locale={locale} arrow>
              {buttonLabel}
            </PrimaryButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ chambers */

export function ChambersSection({ data, locale }: SectionProps) {
  const items = sa(data, "items");
  const mainPhone = sx(data, "main_phone");
  const altPhone = sx(data, "alt_phone");
  const subtitle = sl(data, "subtitle", locale);

  return (
    <section
      id={sx(data, "anchor") || undefined}
      className="border-t border-slate-100 bg-slate-50/50 py-24 md:py-32"
    >
      <div className="max-container">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-slate-200/80 pb-12 text-left md:flex-row md:items-end">
          <div className="max-w-xl space-y-4">
            <Badge text={sl(data, "badge", locale)} />
            <h2 className="text-3xl font-bold tracking-tight text-blue-dark md:text-4xl">
              {sl(data, "heading", locale)}
            </h2>
          </div>
          {subtitle ? (
            <p className="max-w-xs text-left text-base font-medium leading-relaxed text-slate-600 md:text-right">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((chamber, index) => (
            <ChamberCard
              key={index}
              locale={locale}
              name={sl(chamber, "name", locale)}
              logo={sx(chamber, "logo")}
              address={sl(chamber, "address", locale)}
              days={sl(chamber, "days", locale)}
              time={sl(chamber, "time", locale)}
              offDays={sl(chamber, "off_days", locale)}
              mapUrl={sx(chamber, "map_url")}
              phone1={mainPhone}
              phone2={sb(chamber, "show_alt_phone", true) ? altPhone : ""}
              theme={(sx(chamber, "theme", "blue") as ChamberTheme) || "blue"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- CTA banner */

export function CtaBannerSection({ data, locale }: SectionProps) {
  const phone = sx(data, "phone");
  const whatsappNumber = sx(data, "whatsapp_number").replace(/[^0-9]/g, "");
  const whatsappLabel = sl(data, "whatsapp_label", locale);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    sl(data, "whatsapp_message", locale),
  )}`;
  const body = sl(data, "body", locale);

  return (
    <section
      id={sx(data, "anchor") || undefined}
      className="relative w-full overflow-hidden border-t border-b border-slate-100 bg-linear-to-br from-blue-light/10 via-slate-50 to-blue-dark/10 py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0f766e0a_1px,transparent_1px),linear-gradient(to_bottom,#0f766e0a_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_center,transparent_20%,black_100%)]" />

      <div className="max-container relative z-10">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center lg:gap-20">
          <div className="max-w-2xl space-y-4 text-left">
            <Badge text={sl(data, "badge", locale)} />
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-blue-dark md:text-4xl">
              {sl(data, "heading", locale)}
            </h2>
            {body ? (
              <p className="text-sm font-medium leading-relaxed text-slate-500 md:text-base">{body}</p>
            ) : null}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-4 sm:w-auto sm:flex-row">
            {phone ? (
              <a
                href={telHref(phone)}
                dir="ltr"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-light px-6 py-3 text-center font-google-sans text-sm font-bold text-white shadow-md shadow-blue-light/10 transition-all duration-300 hover:bg-blue-dark hover:shadow-lg hover:shadow-blue-light/20 active:scale-95"
              >
                <Phone className="h-4 w-4 fill-white/10" aria-hidden />
                {phone}
              </a>
            ) : null}

            {whatsappNumber && whatsappLabel ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-blue-light/20 bg-blue-dark px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-blue-dark active:scale-95"
              >
                <Image src="/whatsapp.png" width={50} height={50} alt="" className="size-6" />
                {whatsappLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
