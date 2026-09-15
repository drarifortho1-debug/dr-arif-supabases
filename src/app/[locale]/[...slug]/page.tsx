import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionRenderer } from "@/components/site/section-renderer";
import { getPageBySlug, getPublishedPageSlugs, getSiteSettings } from "@/lib/cms/queries";
import { tr } from "@/lib/dictionary";
import { DEFAULT_LOCALE, LOCALES, isLocale, localePath, t, type Locale } from "@/lib/i18n";

interface PageParams {
  params: Promise<{ locale: string; slug: string[] }>;
}

/**
 * Every CMS page lives at the top level (`/about-us`, `/our-videos`,
 * `/privacy-policy`, …) exactly as on the original site. `/our-blogs` and
 * `/our-treatments` have their own folders, and static segments win, so this
 * catch-all only sees the remaining slugs.
 */
export async function generateStaticParams() {
  const slugs = await getPublishedPageSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug: [slug] })));
}

async function loadPage(slugSegments: string[]) {
  if (slugSegments.length !== 1) return null;

  const slug = decodeURIComponent(slugSegments[0]);
  // Helper pages ("_treatment-footer") hold shared sections and are not routes.
  if (slug.startsWith("_")) return null;

  return getPageBySlug(slug);
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const page = await loadPage(slug);

  if (!page) return { title: tr(locale, "notFoundTitle") };

  const title = t(page.seo_title, locale) || t(page.title, locale);
  const description = t(page.seo_description, locale) || undefined;

  return {
    title,
    description,
    alternates: { canonical: localePath(locale, `/${page.slug}`) },
    openGraph: {
      title,
      description,
      images: page.og_image ? [page.og_image] : undefined,
    },
  };
}

export default async function CmsPage({ params }: PageParams) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [page, settings] = await Promise.all([loadPage(slug), getSiteSettings()]);

  if (!page) notFound();

  if (page.sections.length === 0) {
    return (
      <div className="max-container py-24">
        <h1 className="text-3xl font-bold text-blue-dark">{t(page.title, locale)}</h1>
        <p className="mt-3 text-slate-500">{tr(locale, "emptyPage")}</p>
      </div>
    );
  }

  return <SectionRenderer sections={page.sections} locale={locale} settings={settings} />;
}
