import type { Metadata } from "next";

import { SectionRenderer } from "@/components/site/section-renderer";
import { SetupNotice } from "@/components/site/setup-notice";
import { getHomePage, getSiteSettings } from "@/lib/cms/queries";
import { DEFAULT_LOCALE, isLocale, localePath, t, type Locale } from "@/lib/i18n";

interface PageParams {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const page = await getHomePage();

  if (!page) return {};

  const title = t(page.seo_title, locale) || t(page.title, locale);
  const description = t(page.seo_description, locale) || undefined;

  return {
    title,
    description,
    alternates: { canonical: localePath(locale, "/") },
    openGraph: {
      title,
      description,
      images: page.og_image ? [page.og_image] : undefined,
    },
  };
}

export default async function HomePage({ params }: PageParams) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [page, settings] = await Promise.all([getHomePage(), getSiteSettings()]);

  if (!page) return <SetupNotice />;

  return <SectionRenderer sections={page.sections} locale={locale} settings={settings} />;
}
