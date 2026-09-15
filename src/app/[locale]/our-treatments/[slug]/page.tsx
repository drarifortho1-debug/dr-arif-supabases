import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionRenderer } from "@/components/site/section-renderer";
import { TreatmentDetail } from "@/components/site/treatment-detail";
import {
  getPageBySlug,
  getSiteSettings,
  getTreatmentBySlug,
  getTreatments,
} from "@/lib/cms/queries";
import { tr } from "@/lib/dictionary";
import { DEFAULT_LOCALE, LOCALES, isLocale, localePath, t, type Locale } from "@/lib/i18n";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

/** Sections appended under every treatment page (chambers + CTA on the original). */
const FOOTER_SECTIONS_PAGE = "_treatment-footer";

export async function generateStaticParams() {
  const treatments = await getTreatments();
  return LOCALES.flatMap((locale) => treatments.map((item) => ({ locale, slug: item.slug })));
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const treatment = await getTreatmentBySlug(decode(slug));

  if (!treatment) return { title: tr(locale, "treatmentNotFound") };

  const title = t(treatment.meta_title, locale) || t(treatment.title, locale);
  const description = t(treatment.meta_description, locale) || undefined;

  return {
    title,
    description,
    alternates: { canonical: localePath(locale, `/our-treatments/${treatment.slug}`) },
    openGraph: {
      title,
      description,
      images: treatment.hero_image ? [treatment.hero_image] : undefined,
    },
  };
}

export default async function TreatmentPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [treatment, settings, footer] = await Promise.all([
    getTreatmentBySlug(decode(slug)),
    getSiteSettings(),
    getPageBySlug(FOOTER_SECTIONS_PAGE),
  ]);

  if (!treatment) notFound();

  return (
    <>
      <TreatmentDetail treatment={treatment} locale={locale} settings={settings} />
      {footer ? (
        <SectionRenderer sections={footer.sections} locale={locale} settings={settings} />
      ) : null}
    </>
  );
}
