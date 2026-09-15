/**
 * One-off importer: Firestore export -> Supabase.
 *
 * Usage:
 *   node scripts/import-firestore.mjs            # import content, keep image URLs
 *   node scripts/import-firestore.mjs --media    # also download every image and
 *                                                # re-upload it to Supabase Storage
 *
 * Reads supabase/import/firestore-export.json (produced from the old project)
 * and writes pages, sections, treatments, posts, videos, gallery, menus and
 * site settings. Re-running replaces the same rows rather than duplicating.
 */

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"), "..");

const UPLOAD_MEDIA = process.argv.includes("--media");

/* ------------------------------------------------------------------ env */

async function loadEnv() {
  const raw = await readFile(path.join(ROOT, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

/* -------------------------------------------------------------- helpers */

const bn = (value) => (value ? { bn: String(value) } : {});
const item = (obj) => obj;

function log(step, detail = "") {
  console.log(`  ${step.padEnd(28)} ${detail}`);
}

/** Turn "a | b" table rows and plain string lists into { text: {bn} } rows. */
const textRows = (values) => (values ?? []).filter(Boolean).map((v) => ({ text: bn(v) }));

/* ------------------------------------------------------- media uploads */

const uploadCache = new Map();

async function mirrorImage(supabase, url) {
  if (!UPLOAD_MEDIA) return url;
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("/")) return url; // bundled in /public
  if (url.includes("/storage/v1/object/public/")) return url; // already ours
  if (uploadCache.has(url)) return uploadCache.get(url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const ext = (contentType.split("/")[1] ?? "jpg").split(";")[0].replace("jpeg", "jpg");
    const base = path.basename(new URL(url).pathname).replace(/\.[^.]+$/, "") || "image";
    const safe = base.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") || "image";
    const storagePath = `imported/${safe}-${buffer.length}.${ext}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(storagePath, buffer, { contentType, cacheControl: "31536000", upsert: true });

    if (error) throw new Error(error.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(storagePath);

    await supabase.from("media").upsert(
      {
        bucket: "media",
        path: storagePath,
        url: publicUrl,
        filename: path.basename(storagePath),
        mime_type: contentType,
        size: buffer.length,
      },
      { onConflict: "bucket,path" },
    );

    uploadCache.set(url, publicUrl);
    return publicUrl;
  } catch (error) {
    console.warn(`    ! could not mirror ${url}: ${error.message}`);
    uploadCache.set(url, url);
    return url;
  }
}

/** Walk a section's data and mirror every image field. */
async function mirrorSectionData(supabase, data) {
  if (!UPLOAD_MEDIA) return data;

  const IMAGE_KEYS = new Set(["image", "photo", "logo", "banner", "cover", "hero_image", "poster"]);

  async function walk(value, key) {
    if (Array.isArray(value)) {
      return Promise.all(value.map((entry) => walk(entry, key)));
    }
    if (value && typeof value === "object") {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = await walk(v, k);
      return out;
    }
    if (typeof value === "string" && key && IMAGE_KEYS.has(key) && /^https?:/.test(value)) {
      return mirrorImage(supabase, value);
    }
    return value;
  }

  return walk(data, null);
}

/* ------------------------------------------------------------ importer */

async function main() {
  await loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const exportPath = path.join(ROOT, "supabase", "import", "firestore-export.json");
  const data = require(exportPath);

  console.log(`\nImporting from ${exportPath}`);
  console.log(UPLOAD_MEDIA ? "Media: downloading and re-uploading to Supabase Storage\n" : "Media: keeping original URLs (pass --media to mirror them)\n");

  const { SITE_SETTINGS, PAGES, MENUS } = await import("./import-data.mjs");

  /* ---------------------------------------------------- site settings */
  const settings = structuredClone(SITE_SETTINGS);
  if (UPLOAD_MEDIA && settings.doctor?.photo) {
    settings.doctor.photo = await mirrorImage(supabase, settings.doctor.photo);
  }
  {
    const { error } = await supabase.from("site_settings").upsert({ id: 1, ...settings });
    if (error) throw new Error(`site_settings: ${error.message}`);
    log("site settings", "ok");
  }

  /* ----------------------------------------------------------- pages */
  for (const page of PAGES) {
    const { sections, ...meta } = page;

    const { data: row, error } = await supabase
      .from("pages")
      .upsert({ ...meta }, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw new Error(`page ${meta.slug}: ${error.message}`);

    await supabase.from("sections").delete().eq("page_id", row.id);

    for (const [index, section] of sections.entries()) {
      const sectionData = await mirrorSectionData(supabase, section.data);
      const { error: sectionError } = await supabase.from("sections").insert({
        page_id: row.id,
        type: section.type,
        data: sectionData,
        sort_order: index,
        is_visible: section.is_visible !== false,
      });
      if (sectionError) throw new Error(`section ${meta.slug}/${section.type}: ${sectionError.message}`);
    }

    log(`page /${meta.slug}`, `${sections.length} sections`);
  }

  /* ------------------------------------------------------ treatments */
  // The old site merged Firestore overrides on top of ten hardcoded treatment
  // pages, so both sources are combined here; Firestore wins per slug.
  const defaults = require(path.join(ROOT, "supabase", "import", "treatment-defaults.json"));
  const overrides = new Map((data.treatments ?? []).map((doc) => [doc.id, doc]));
  const treatments = defaults.map((base) => ({
    ...base,
    ...(overrides.get(base.slug) ?? {}),
    id: base.slug,
    order: overrides.get(base.slug)?.order ?? base.order,
  }));
  for (const [slug, doc] of overrides) {
    if (!defaults.some((base) => base.slug === slug)) treatments.push(doc);
  }
  for (const [index, doc] of treatments.entries()) {
    const heroImage = await mirrorImage(supabase, doc.heroImage ?? "");

    const row = {
      slug: doc.id,
      nav_label: bn(doc.navLabel),
      nav_desc: bn(doc.navDesc),
      enabled: doc.enabled !== false,
      sort_order: typeof doc.order === "number" ? doc.order : index,
      hero_image: heroImage || null,
      hero_image_alt: bn(doc.heroImageAlt),
      title: bn(doc.title),
      subtitle: bn(doc.subtitle),
      meta_title: bn(doc.metaTitle),
      meta_description: bn(doc.metaDescription),
      causes: (doc.causes ?? []).map((c) => item({ title: bn(c.title), description: bn(c.description) })),
      treatments: (doc.treatments ?? []).map((t) => item({ name: bn(t.name), description: bn(t.description) })),
      symptoms: bn(doc.symptoms),
      doctor_advice: bn(doc.doctorAdvice),
      faq: (doc.faq ?? []).map((f) => item({ question: bn(f.question), answer: bn(f.answer) })),
      cta_subtitle: bn(doc.ctaSubtitle),
      table_title: bn(doc.table?.title),
      table_headers: textRows(doc.table?.headers),
      table_rows: textRows(
        (doc.table?.rows ?? []).map((r) => (Array.isArray(r) ? r : (r?.cells ?? [])).join(" | ")),
      ),
      dos: textRows(doc.doAndDont?.dos),
      donts: textRows(doc.doAndDont?.donts),
    };

    const { error } = await supabase.from("treatments").upsert(row, { onConflict: "slug" });
    if (error) throw new Error(`treatment ${doc.id}: ${error.message}`);
  }
  log("treatments", `${treatments.length} rows`);

  /* ----------------------------------------------------------- posts */
  const blogs = data.blogs ?? [];
  const categories = new Map();

  for (const doc of blogs) {
    const name = (doc.category ?? "").trim();
    if (!name || categories.has(name)) continue;

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9ঀ-৿]+/g, "-")
        .replace(/^-|-$/g, "") || `category-${categories.size + 1}`;

    const { data: row, error } = await supabase
      .from("post_categories")
      .upsert({ slug, name: bn(name), sort_order: categories.size }, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw new Error(`category ${name}: ${error.message}`);
    categories.set(name, row.id);
  }

  for (const doc of blogs) {
    const slug =
      doc.slug ||
      (doc.title ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9ঀ-৿]+/g, "-")
        .replace(/^-|-$/g, "") ||
      doc.id;

    const cover = await mirrorImage(supabase, doc.imageUrl ?? "");

    const { error } = await supabase.from("posts").upsert(
      {
        slug,
        legacy_id: doc.id,
        title: bn(doc.title),
        excerpt: {},
        content: bn(doc.content),
        cover_image: cover || null,
        category_id: categories.get((doc.category ?? "").trim()) ?? null,
        status: "published",
        published_at: doc.createdAt ?? new Date().toISOString(),
        seo_title: {},
        seo_description: {},
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(`post ${slug}: ${error.message}`);
  }
  log("blog posts", `${blogs.length} rows, ${categories.size} categories`);

  /* ---------------------------------------------------------- videos */
  const videos = data.videos ?? [];
  await supabase.from("videos").delete().neq("youtube_id", "");
  for (const [index, doc] of videos.entries()) {
    const { error } = await supabase
      .from("videos")
      .insert({ youtube_id: doc.videoId, title: {}, sort_order: index, created_at: doc.createdAt });
    if (error) throw new Error(`video ${doc.videoId}: ${error.message}`);
  }
  log("videos", `${videos.length} rows`);

  /* --------------------------------------------------------- gallery */
  const gallery = data.gallery ?? [];
  await supabase.from("gallery").delete().neq("image_url", "");
  for (const [index, doc] of gallery.entries()) {
    const imageUrl = await mirrorImage(supabase, doc.imageUrl);
    const { error } = await supabase
      .from("gallery")
      .insert({ image_url: imageUrl, alt: {}, sort_order: index, created_at: doc.createdAt });
    if (error) throw new Error(`gallery ${doc.id}: ${error.message}`);
  }
  log("gallery", `${gallery.length} rows`);

  /* ----------------------------------------------------------- menus */
  for (const menu of MENUS) {
    const { data: menuRow, error } = await supabase
      .from("menus")
      .upsert({ location: menu.location }, { onConflict: "location" })
      .select("id")
      .single();
    if (error) throw new Error(`menu ${menu.location}: ${error.message}`);

    await supabase.from("menu_items").delete().eq("menu_id", menuRow.id);

    for (const [index, entry] of menu.items.entries()) {
      const { error: itemError } = await supabase.from("menu_items").insert({
        menu_id: menuRow.id,
        parent_id: null,
        label: bn(entry.label),
        url: entry.url,
        sort_order: index,
        open_in_new_tab: Boolean(entry.newTab),
        auto_children: Boolean(entry.autoChildren),
      });
      if (itemError) throw new Error(`menu item ${entry.label}: ${itemError.message}`);
    }
    log(`menu ${menu.location}`, `${menu.items.length} items`);
  }

  console.log("\nDone. Open /admin to review the imported content.\n");
}

main().catch((error) => {
  console.error("\nImport failed:", error.message);
  process.exit(1);
});
