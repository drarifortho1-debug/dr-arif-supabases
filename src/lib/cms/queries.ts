import "server-only";

import { unstable_cache } from "next/cache";

import type {
  GalleryRow,
  MediaRow,
  MenuItemRow,
  MenuLocation,
  PageRow,
  PostCategoryRow,
  PostRow,
  SectionRow,
  SiteSettingsRow,
  TreatmentRow,
  VideoRow,
} from "@/lib/cms/database.types";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabasePublicClient } from "@/lib/supabase/server";

/**
 * Public read layer.
 *
 * Every query is wrapped in `unstable_cache` and tagged, so the live site
 * serves cached HTML until an editor saves something — at which point the
 * matching Server Action calls `revalidateTag` and the page updates without a
 * redeploy. See `src/lib/cms/revalidate.ts`.
 */

export const CACHE_TAGS = {
  settings: "cms:settings",
  menus: "cms:menus",
  pages: "cms:pages",
  posts: "cms:posts",
  categories: "cms:categories",
  treatments: "cms:treatments",
  videos: "cms:videos",
  gallery: "cms:gallery",
} as const;

/** Used when Supabase is not configured yet, so the site still renders. */
export const FALLBACK_SETTINGS: SiteSettingsRow = {
  id: 1,
  site_name: { bn: "ডা. আরিফ অর্থো", en: "Dr. Arif Ortho" },
  tagline: { bn: "অর্থোপেডিক্স বিশেষজ্ঞ ও ট্রমা সার্জন", en: "Orthopaedic specialist & trauma surgeon" },
  logo_url: null,
  favicon_url: null,
  default_locale: DEFAULT_LOCALE,
  enabled_locales: ["bn", "en"],
  seo: {},
  contact: {},
  socials: {},
  footer: {},
  doctor: {},
  chambers: [],
  updated_at: new Date().toISOString(),
};

export interface PageWithSections extends PageRow {
  sections: SectionRow[];
}

export interface MenuNode extends MenuItemRow {
  children: MenuItemRow[];
}

export interface PostWithCategory extends PostRow {
  category: PostCategoryRow | null;
}

// ---------------------------------------------------------------- settings

async function fetchSiteSettings(): Promise<SiteSettingsRow> {
  if (!isSupabaseConfigured()) return FALLBACK_SETTINGS;

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return FALLBACK_SETTINGS;
  return { ...FALLBACK_SETTINGS, ...data } as SiteSettingsRow;
}

export const getSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings"], {
  tags: [CACHE_TAGS.settings],
  revalidate: 3600,
});

// ------------------------------------------------------------------- menus

async function fetchMenu(location: MenuLocation): Promise<MenuNode[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("location", location)
    .maybeSingle();

  if (!menu) return [];

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("menu_id", menu.id)
    .order("sort_order", { ascending: true });

  const rows = (items ?? []) as MenuItemRow[];
  const roots = rows.filter((item) => !item.parent_id);

  return roots.map((root) => ({
    ...root,
    children: rows.filter((item) => item.parent_id === root.id),
  }));
}

export const getMenu = unstable_cache(fetchMenu, ["menu"], {
  tags: [CACHE_TAGS.menus],
  revalidate: 3600,
});

// ------------------------------------------------------------------- pages

async function fetchPageBySlug(slug: string): Promise<PageWithSections | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabasePublicClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!page) return null;

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  return { ...(page as PageRow), sections: (sections ?? []) as SectionRow[] };
}

export const getPageBySlug = unstable_cache(fetchPageBySlug, ["page-by-slug"], {
  tags: [CACHE_TAGS.pages],
  revalidate: 3600,
});

async function fetchHomePage(): Promise<PageWithSections | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabasePublicClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("is_home", true)
    .eq("status", "published")
    .maybeSingle();

  if (!page) return null;

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  return { ...(page as PageRow), sections: (sections ?? []) as SectionRow[] };
}

export const getHomePage = unstable_cache(fetchHomePage, ["home-page"], {
  tags: [CACHE_TAGS.pages],
  revalidate: 3600,
});

async function fetchPublishedPageSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("pages")
    .select("slug, is_home")
    .eq("status", "published");

  // Slugs starting with "_" are helper pages (section holders), not routes.
  return (data ?? [])
    .filter((row) => !row.is_home && !String(row.slug).startsWith("_"))
    .map((row) => row.slug as string);
}

export const getPublishedPageSlugs = unstable_cache(
  fetchPublishedPageSlugs,
  ["published-page-slugs"],
  { tags: [CACHE_TAGS.pages], revalidate: 3600 },
);

// ------------------------------------------------------------------- posts

interface PostQuery {
  limit?: number;
  offset?: number;
  categorySlug?: string | null;
  excludeId?: string | null;
}

async function fetchPosts({
  limit = 9,
  offset = 0,
  categorySlug = null,
  excludeId = null,
}: PostQuery): Promise<{ posts: PostWithCategory[]; total: number }> {
  if (!isSupabaseConfigured()) return { posts: [], total: 0 };

  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("posts")
    .select("*, category:post_categories(*)", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (categorySlug) {
    const { data: category } = await supabase
      .from("post_categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (!category) return { posts: [], total: 0 };
    query = query.eq("category_id", category.id);
  }

  if (excludeId) query = query.neq("id", excludeId);

  const { data, count } = await query;
  return {
    posts: (data ?? []) as unknown as PostWithCategory[],
    total: count ?? 0,
  };
}

export const getPosts = unstable_cache(fetchPosts, ["posts"], {
  tags: [CACHE_TAGS.posts],
  revalidate: 3600,
});

async function fetchPostBySlug(slug: string): Promise<PostWithCategory | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("posts")
    .select("*, category:post_categories(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return (data as unknown as PostWithCategory) ?? null;
}

export const getPostBySlug = unstable_cache(fetchPostBySlug, ["post-by-slug"], {
  tags: [CACHE_TAGS.posts],
  revalidate: 3600,
});

async function fetchPostSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  const { data } = await supabase.from("posts").select("slug").eq("status", "published");
  return (data ?? []).map((row) => row.slug as string);
}

export const getPostSlugs = unstable_cache(fetchPostSlugs, ["post-slugs"], {
  tags: [CACHE_TAGS.posts],
  revalidate: 3600,
});

async function fetchCategories(): Promise<PostCategoryRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("post_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (data ?? []) as PostCategoryRow[];
}

export const getCategories = unstable_cache(fetchCategories, ["post-categories"], {
  tags: [CACHE_TAGS.categories],
  revalidate: 3600,
});

async function fetchPostByLegacyId(legacyId: string): Promise<PostRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("legacy_id", legacyId)
    .eq("status", "published")
    .maybeSingle();

  return (data as PostRow) ?? null;
}

/** Old Firebase blog URLs used the document id; they 308-redirect to the slug. */
export const getPostByLegacyId = unstable_cache(fetchPostByLegacyId, ["post-by-legacy-id"], {
  tags: [CACHE_TAGS.posts],
  revalidate: 3600,
});

// -------------------------------------------------------------- treatments

async function fetchTreatments(): Promise<TreatmentRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("treatments")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as TreatmentRow[];
}

export const getTreatments = unstable_cache(fetchTreatments, ["treatments"], {
  tags: [CACHE_TAGS.treatments],
  revalidate: 3600,
});

async function fetchTreatmentBySlug(slug: string): Promise<TreatmentRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("treatments")
    .select("*")
    .eq("slug", slug)
    .eq("enabled", true)
    .maybeSingle();

  return (data as TreatmentRow) ?? null;
}

export const getTreatmentBySlug = unstable_cache(fetchTreatmentBySlug, ["treatment-by-slug"], {
  tags: [CACHE_TAGS.treatments],
  revalidate: 3600,
});

// ------------------------------------------------------------------ videos

async function fetchVideos(limit?: number): Promise<VideoRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data ?? []) as VideoRow[];
}

export const getVideos = unstable_cache(fetchVideos, ["videos"], {
  tags: [CACHE_TAGS.videos],
  revalidate: 3600,
});

// ----------------------------------------------------------------- gallery

async function fetchGallery(limit?: number): Promise<GalleryRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data ?? []) as GalleryRow[];
}

export const getGallery = unstable_cache(fetchGallery, ["gallery"], {
  tags: [CACHE_TAGS.gallery],
  revalidate: 3600,
});

// ------------------------------------------------------------------- media

export async function getRecentMedia(limit = 60): Promise<MediaRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as MediaRow[];
}

/** Locales the editor turned on, always including the default one. */
export function enabledLocales(settings: SiteSettingsRow): Locale[] {
  const list = (settings.enabled_locales ?? []).filter(Boolean) as Locale[];
  return list.length > 0 ? list : ["bn", "en"];
}
