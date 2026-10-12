import type { Metadata } from "next";
import { Inter, Noto_Serif_Bengali } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getSiteSettings } from "@/lib/cms/queries";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAG, isLocale, localePath, type Locale } from "@/lib/i18n";

import "../globals.css";

const bangla = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-bangla",
  display: "swap",
});

const googleSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-google-sans",
  display: "swap",
});

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/** Pre-render both language shells at build time. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const settings = await getSiteSettings();

  const siteName = settings.site_name?.[locale] ?? settings.site_name?.bn ?? "Doctor";
  const title = settings.seo?.title?.[locale] ?? siteName;
  const description = settings.seo?.description?.[locale] ?? settings.tagline?.[locale];
  const image = settings.seo?.og_image ?? settings.doctor?.photo;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: { default: title, template: `%s | ${siteName}` },
    description,
    icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined,
    // Google Search Console ownership (HTML tag method).
    verification: { google: "G1upGbkiUe9wSzpzeUJvu8ni7pfoRf7ZX6PjAiUDiwg" },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      locale: LOCALE_TAG[locale],
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: localePath(locale, "/"),
      languages: Object.fromEntries(LOCALES.map((item) => [item, localePath(item, "/")])),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const settings = await getSiteSettings();

  return (
    <html
      lang={LOCALE_TAG[locale]}
      data-scroll-behavior="smooth"
      className={`${bangla.variable} ${googleSans.variable} scroll-smooth`}
    >
      <body className="flex min-h-dvh flex-col bg-white font-bangla">
        <SiteHeader locale={locale} settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} settings={settings} />
      </body>
    </html>
  );
}
