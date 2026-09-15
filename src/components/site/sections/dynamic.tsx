import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ChevronsRight,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { PostCard } from "@/components/site/post-card";
import {
  Badge,
  SafeImage,
  SectionHeader,
  SectionShell,
  SmartLink,
} from "@/components/site/ui";
import { getGallery, getPosts, getTreatments, getVideos } from "@/lib/cms/queries";
import { getDictionary } from "@/lib/dictionary";
import { localePath, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { columnClass, sa, sl, slist, sn, sx, type SectionProps } from "./shared";

/* ------------------------------------------------------- YouTube embed */

function YouTubeFrame({ id, title, rounded = "rounded-lg" }: { id: string; title?: string; rounded?: string }) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-slate-900", rounded)}>
      <iframe
        className="h-full w-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
        title={title || "YouTube video player"}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

function YouTubePanel({
  heading,
  text,
  label,
  href,
}: {
  heading: string;
  text: string;
  label: string;
  href: string;
}) {
  if (!heading && !label) return null;
  return (
    <div className="mt-16 rounded-3xl bg-slate-900 p-8 text-center text-white md:p-12">
      {heading ? <h2 className="mb-4 text-2xl font-bold md:text-3xl">{heading}</h2> : null}
      {text ? <p className="mx-auto mb-8 max-w-lg text-slate-400">{text}</p> : null}
      {label && href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:bg-red-700"
        >
          {label} <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------ latest videos */

export async function VideosLatestSection({ data, locale }: SectionProps) {
  const count = Math.min(12, Math.max(1, sn(data, "count", 4)));
  const videos = await getVideos(count);
  const linkLabel = sl(data, "link_label", locale);
  const linkHref = sx(data, "link_href", "/our-videos");

  if (videos.length === 0) return null;

  return (
    <section
      id={sx(data, "anchor") || undefined}
      className="w-full overflow-hidden border-y border-slate-100 bg-slate-50 py-24 md:py-32"
    >
      <div className="max-container">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-slate-200/80 pb-8 text-left md:flex-row md:items-end">
          <div className="max-w-xl space-y-3">
            <Badge text={sl(data, "badge", locale)} />
            <h2 className="text-3xl font-bold tracking-tight text-blue-dark md:text-4xl">
              {sl(data, "heading", locale)}
            </h2>
          </div>
          {linkLabel ? (
            <SmartLink
              href={linkHref}
              locale={locale}
              className="group hidden items-center gap-1.5 text-sm font-bold text-blue-light transition-colors hover:text-blue-dark md:inline-flex"
            >
              {linkLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </SmartLink>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            >
              <YouTubeFrame id={video.youtube_id} title={t(video.title, locale)} />
            </div>
          ))}
        </div>

        {linkLabel ? (
          <div className="mt-12 text-center md:hidden">
            <SmartLink
              href={linkHref}
              locale={locale}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-95"
            >
              {linkLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </SmartLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- latest blogs */

export async function BlogsLatestSection({ data, locale }: SectionProps) {
  const count = Math.min(12, Math.max(1, sn(data, "count", 3)));
  const { posts } = await getPosts({ limit: count });
  const linkLabel = sl(data, "link_label", locale);
  const linkHref = sx(data, "link_href", "/our-blogs");

  if (posts.length === 0) return null;

  return (
    <section id={sx(data, "anchor") || undefined} className="section-padding bg-slate-50/50">
      <div className="max-container">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-slate-200/80 pb-8 text-left md:flex-row md:items-end">
          <div className="max-w-xl space-y-3">
            <Badge text={sl(data, "badge", locale)} />
            <h2 className="text-3xl font-bold tracking-tight text-blue-dark md:text-4xl">
              {sl(data, "heading", locale)}
            </h2>
          </div>
          {linkLabel ? (
            <SmartLink
              href={linkHref}
              locale={locale}
              className="group hidden items-center gap-1.5 text-sm font-bold text-blue-light transition-colors hover:text-blue-dark md:inline-flex"
            >
              {linkLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </SmartLink>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ gallery */

export async function GallerySection({ data, locale }: SectionProps) {
  const dict = getDictionary(locale);
  const limit = Math.max(1, sn(data, "count", 12));
  const manual = sx(data, "source", "gallery") === "manual";

  const images = manual
    ? sa(data, "items")
        .map((item) => ({ src: sx(item, "image"), alt: sl(item, "alt", locale) }))
        .filter((item) => item.src)
    : (await getGallery(limit)).map((row) => ({ src: row.image_url, alt: t(row.alt, locale) }));

  const list = images.slice(0, limit);
  const badge = sl(data, "badge", locale);
  const heading = sl(data, "heading", locale);

  return (
    <SectionShell background={sx(data, "background", "white")} anchor={sx(data, "anchor")}>
      <SectionHeader badge={badge} heading={heading} align="center" />
      {list.length === 0 ? (
        <p className="py-12 text-center text-slate-400">{dict.galleryEmpty}</p>
      ) : (
        <div className={cn("grid grid-cols-2 gap-4", columnClass(sx(data, "columns", "4"), "4"))}>
          {list.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-200 shadow-sm"
            >
              <SafeImage
                src={image.src}
                alt={image.alt || `${dict.galleryBadge} ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 300px"
              />
              <div className="absolute inset-0 bg-blue-900/0 transition-colors duration-300 group-hover:bg-blue-900/10" />
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* --------------------------------------------------- treatments index */

export async function TreatmentsIndexSection({ data, locale }: SectionProps) {
  const treatments = await getTreatments();
  const banner = sx(data, "banner");
  const procedures = sa(data, "procedures");
  const trauma = slist(data, "trauma_items", locale);
  const ortho = slist(data, "ortho_items", locale);
  const why = slist(data, "why_items", locale);

  return (
    <div id={sx(data, "anchor") || undefined} className="flex flex-col bg-white">
      {banner ? (
        <section className="mb-16 pt-8">
          <div className="max-container">
            <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
              <SafeImage
                src={banner}
                width={1920}
                height={800}
                alt={sl(data, "specialties_heading", locale)}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </section>
      ) : null}

      {treatments.length > 0 ? (
        <section className="mb-24">
          <div className="max-container">
            <div className="mb-10 max-w-2xl">
              <h2 className="mt-3 text-2xl font-bold text-blue-dark md:text-3xl">
                {sl(data, "specialties_heading", locale)}
              </h2>
              <p className="mt-2 text-base text-slate-600">{sl(data, "specialties_subtitle", locale)}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {treatments.map((item) => (
                <Link
                  key={item.id}
                  href={localePath(locale, `/our-treatments/${item.slug}`)}
                  className="group flex items-start justify-between rounded-lg border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-blue-light/30 hover:shadow-lg hover:shadow-blue-light/5"
                >
                  <div>
                    <h3 className="text-lg font-bold text-blue-dark transition-colors group-hover:text-blue-light">
                      {t(item.nav_label, locale)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{t(item.nav_desc, locale)}</p>
                  </div>
                  <ChevronsRight className="ml-1 h-4 w-4 text-slate-500 transition-all group-hover:translate-x-1.5 group-hover:text-blue-light" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {procedures.length > 0 ? (
        <section className="mb-24 border-y border-slate-100 bg-slate-50/60 py-16">
          <div className="max-container">
            <div className="mb-12">
              <h2 className="mt-3 text-2xl font-bold text-blue-dark md:text-3xl">
                {sl(data, "procedures_heading", locale)}
              </h2>
              <p className="mt-2 text-base text-slate-600">{sl(data, "procedures_subtitle", locale)}</p>
            </div>
            <div className="space-y-6">
              {procedures.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xs md:p-8">
                  <div className="flex flex-col items-start gap-4 md:flex-row">
                    <div className="mt-1 shrink-0 rounded-xl bg-blue-50 p-3 text-blue-light">
                      <Icon name={sx(item, "icon")} className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-3 text-xl font-bold text-blue-dark">{sl(item, "title", locale)}</h3>
                      <p className="text-base leading-relaxed text-slate-600">{sl(item, "text", locale)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {trauma.length > 0 || ortho.length > 0 ? (
        <section className="mb-24">
          <div className="max-container">
            <div className="mb-12 max-w-2xl">
              <h2 className="mt-3 text-2xl font-bold text-blue-dark md:text-3xl">{sl(data, "lists_heading", locale)}</h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {trauma.length > 0 ? (
                <div className="rounded-3xl border border-red-100 bg-red-50/30 p-8">
                  <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-red-700">
                    <Stethoscope className="h-6 w-6" aria-hidden /> {sl(data, "trauma_title", locale)}
                  </h3>
                  <ul className="space-y-3.5">
                    {trauma.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-base text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {ortho.length > 0 ? (
                <div className="rounded-3xl border border-blue-100/70 bg-blue-50/20 p-8">
                  <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-blue-dark">
                    <Activity className="h-6 w-6 text-blue-light" aria-hidden /> {sl(data, "ortho_title", locale)}
                  </h3>
                  <ul className="space-y-3.5">
                    {ortho.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-base text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-light" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {why.length > 0 ? (
        <section className="mb-24">
          <div className="max-container">
            <div className="mb-10 max-w-2xl">
              <h2 className="mt-3 text-2xl font-bold text-blue-dark md:text-3xl">{sl(data, "why_heading", locale)}</h2>
            </div>
            <div className="grid gap-2">
              {why.map((item, index) => (
                <div key={index} className="flex items-start gap-4 border-b border-slate-200 pb-2">
                  <div className="mt-2 h-3 w-3 shrink-0 rounded-full bg-blue-light" />
                  <p className="text-base leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- videos page */

export async function VideosIndexSection({ data, locale }: SectionProps) {
  const dict = getDictionary(locale);
  const videos = await getVideos();

  return (
    <section id={sx(data, "anchor") || undefined} className="w-full overflow-hidden bg-white pt-15 pb-20">
      <div className="max-container">
        <div className="mb-12 text-center">
          <Badge text={sl(data, "badge", locale)} />
          <h1 className="mt-5 mb-3 text-4xl font-bold text-blue-dark md:text-5xl">{sl(data, "heading", locale)}</h1>
          <p className="text-lg text-slate-600">{sl(data, "subtitle", locale)}</p>
        </div>

        {videos.length === 0 ? (
          <p className="py-10 text-center text-slate-500">{dict.noVideos}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
              >
                <YouTubeFrame id={video.youtube_id} title={t(video.title, locale)} rounded="rounded-xl" />
              </div>
            ))}
          </div>
        )}

        <YouTubePanel
          heading={sl(data, "yt_heading", locale)}
          text={sl(data, "yt_text", locale)}
          label={sl(data, "yt_label", locale)}
          href={sx(data, "yt_href")}
        />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- blogs page */

export async function BlogsIndexSection({ data, locale }: SectionProps) {
  const dict = getDictionary(locale);
  const { posts } = await getPosts({ limit: 60 });

  return (
    <div id={sx(data, "anchor") || undefined} className="overflow-hidden bg-white pt-15 pb-20">
      <div className="max-container mb-12 text-center">
        <Badge text={sl(data, "badge", locale)} />
        <h1 className="mt-5 mb-3 text-4xl font-bold text-blue-dark md:text-5xl">{sl(data, "heading", locale)}</h1>
        <p className="text-lg text-slate-600">{sl(data, "subtitle", locale)}</p>
      </div>

      {posts.length === 0 ? (
        <section className="section-padding">
          <p className="mx-auto max-w-xl rounded-3xl border border-slate-100 bg-white py-10 text-center text-base text-slate-500 shadow-sm">
            {dict.noPosts}
          </p>
        </section>
      ) : (
        <section className="mb-16">
          <div className="max-container">
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} locale={locale} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-container">
        <YouTubePanel
          heading={sl(data, "yt_heading", locale)}
          text={sl(data, "yt_text", locale)}
          label={sl(data, "yt_label", locale)}
          href={sx(data, "yt_href")}
        />
      </div>
    </div>
  );
}
