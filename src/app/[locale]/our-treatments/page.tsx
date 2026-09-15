import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionRenderer } from "@/components/site/section-renderer";
import { getPageBySlug, getSiteSettings } from "@/lib/cms/queries";
import { DEFAULT_LOCALE, isLocale, localePath, t, type Locale } from "@/lib/i18n";

interface PageParams {
  params: Promise<{ locale: string }>;
}

const SLUG = "our-treatments";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const page = await getPageBySlug(SLUG);

  if (!page) return {};

  const title = t(page.seo_title, locale) || t(page.title, locale);
  const description = t(page.seo_description, locale) || undefined;

  return {
    title,
    description,
    alternates: { canonical: localePath(locale, `/${SLUG}`) },
    openGraph: { title, description },
  };
}

export default async function TreatmentsPage({ params }: PageParams) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [page, settings] = await Promise.all([getPageBySlug(SLUG), getSiteSettings()]);

  if (!page) notFound();

  return <SectionRenderer sections={page.sections} locale={locale} settings={settings} />;
}
