import { ArrowRight, Clock, FileText } from "lucide-react";
import Link from "next/link";

import { SafeImage, stripHtml } from "@/components/site/ui";
import type { PostWithCategory } from "@/lib/cms/queries";
import { getDictionary } from "@/lib/dictionary";
import { localePath, t, type Locale } from "@/lib/i18n";
import { formatDate, readingTime, toBanglaDigits } from "@/lib/utils";

export function postHref(post: { slug: string }): string {
  return `/our-blogs/${post.slug}`;
}

export function readTimeLabel(html: string, locale: Locale): string {
  const minutes = readingTime(html);
  return locale === "bn" ? `${toBanglaDigits(minutes)} মিনিট` : `${minutes} min read`;
}

export function PostCard({
  post,
  locale,
  compact = false,
}: {
  post: PostWithCategory;
  locale: Locale;
  compact?: boolean;
}) {
  const dict = getDictionary(locale);
  const title = t(post.title, locale);
  const content = t(post.content, locale);
  const preview = t(post.excerpt, locale) || stripHtml(content);
  const href = localePath(locale, postHref(post));

  return (
    <Link href={href} className="group block">
      <article
        className={`flex h-full flex-col overflow-hidden border border-slate-100 bg-white transition-all duration-300 hover:shadow-premium ${
          compact ? "rounded-lg shadow-sm" : "rounded-xl shadow"
        }`}
      >
        <div className="relative h-56 shrink-0 overflow-hidden bg-slate-50">
          {post.cover_image ? (
            <SafeImage
              src={post.cover_image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-12 w-12 text-slate-300" aria-hidden />
            </div>
          )}
          {post.category ? (
            <span className="absolute top-4 left-4 z-10 rounded-full border border-blue-light/10 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-blue-light shadow-sm backdrop-blur-sm">
              {t(post.category.name, locale)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-between p-6 md:p-7">
          <div>
            <div className="mb-3 flex items-center gap-3 text-[11px] text-slate-400">
              <span className="font-semibold">{formatDate(post.published_at, locale)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-200" />
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {readTimeLabel(content, locale)}
              </span>
            </div>
            <h2 className="mb-3 line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-light">
              {title}
            </h2>
            <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-500">
              {preview || dict.readFullPost}
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-2 self-start text-sm font-bold text-blue-light transition-all group-hover:gap-3">
            {dict.readMore}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </article>
    </Link>
  );
}
