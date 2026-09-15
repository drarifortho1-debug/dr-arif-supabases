import type { MetadataRoute } from "next";

import { getPostSlugs, getPublishedPageSlugs, getTreatments } from "@/lib/cms/queries";
import { LOCALES, localePath } from "@/lib/i18n";

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const [pages, posts, treatments] = await Promise.all([
    getPublishedPageSlugs(),
    getPostSlugs(),
    getTreatments(),
  ]);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    const url = (path: string) => `${base}${localePath(locale, path)}`;

    entries.push({ url: url("/"), lastModified: now, priority: 1 });

    for (const slug of pages) {
      entries.push({ url: url(`/${slug}`), lastModified: now, priority: 0.8 });
    }

    for (const treatment of treatments) {
      entries.push({
        url: url(`/our-treatments/${treatment.slug}`),
        lastModified: new Date(treatment.updated_at),
        priority: 0.8,
      });
    }

    for (const slug of posts) {
      entries.push({ url: url(`/our-blogs/${slug}`), lastModified: now, priority: 0.6 });
    }
  }

  return entries;
}
