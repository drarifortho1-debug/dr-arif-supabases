import { Calendar, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { BackButton } from "@/components/site/back-button";
import { readTimeLabel } from "@/components/site/post-card";
import { RichText, SafeImage, stripHtml } from "@/components/site/ui";
import { getPostByLegacyId, getPostBySlug, getPostSlugs } from "@/lib/cms/queries";
import { tr } from "@/lib/dictionary";
import { DEFAULT_LOCALE, LOCALES, isLocale, localePath, t, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

interface PostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const post = await getPostBySlug(decode(slug));

  if (!post) return { title: tr(locale, "notFoundTitle") };

  const title = t(post.seo_title, locale) || t(post.title, locale);
  const description =
    t(post.seo_description, locale) ||
    t(post.excerpt, locale) ||
    stripHtml(t(post.content, locale)).slice(0, 160);

  return {
    title,
    description: description || undefined,
    alternates: { canonical: localePath(locale, `/our-blogs/${post.slug}`) },
    openGraph: {
      type: "article",
      title,
      description: description || undefined,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const requested = decode(slug);

  const post = await getPostBySlug(requested);

  if (!post) {
    // Old Firebase URLs used the document id — send those to the slug URL.
    const legacy = await getPostByLegacyId(requested);
    if (legacy?.slug) {
      permanentRedirect(encodeURI(localePath(locale, `/our-blogs/${legacy.slug}`)));
    }
    notFound();
  }

  const title = t(post.title, locale);
  const content = t(post.content, locale);

  return (
    <div className="max-container min-h-screen pb-20">
      <div className="mt-8 mb-6 flex items-center justify-between border-b border-slate-200 pb-4 md:mt-12">
        <BackButton locale={locale} />

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 md:gap-6">
          {post.published_at ? (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" aria-hidden />
              <span>{formatDate(post.published_at, locale)}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" aria-hidden />
            <span>{readTimeLabel(content, locale)}</span>
          </div>
        </div>
      </div>

      <article>
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-blue-dark md:text-4xl md:leading-tight">
            {title}
          </h1>
        </div>

        {post.cover_image ? (
          <div className="group relative mb-10 h-[280px] w-full overflow-hidden rounded-md shadow-md sm:h-[400px] md:h-[480px]">
            {post.category ? (
              <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-blue-light px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase">
                <Tag className="h-3 w-3" aria-hidden />
                {t(post.category.name, locale)}
              </span>
            ) : null}
            <SafeImage
              fill
              src={post.cover_image}
              alt={title}
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        ) : null}

        <RichText html={content} className="text-base text-slate-700 md:text-lg" />
      </article>
    </div>
  );
}
