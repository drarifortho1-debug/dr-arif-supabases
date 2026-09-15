# Dr. Arif Ortho — website + CMS

A clone of drarifortho.com rebuilt on Next.js 16 + Supabase, with a built-in admin
panel. Pages are assembled from sections in the browser; every change goes live
immediately without redeploying.

URLs match the original site exactly (`/about-us`, `/our-treatments/<slug>`,
`/our-blogs/<slug>`, …) so existing Google rankings and shared links keep working.
Bangla is served without a prefix; English lives under `/en/...` and stays hidden
until you switch it on in **Admin → Site settings**.

| Layer         | Choice                                  |
| ------------- | --------------------------------------- |
| Framework     | Next.js 16 (App Router, Server Actions) |
| Styling       | Tailwind CSS v4                         |
| Database/Auth | Supabase (PostgreSQL, Auth, Storage)    |
| Hosting       | Vercel (or any Node host)               |
| Language      | TypeScript                              |

## What the admin panel does

`/admin` (English only) lets staff manage:

- **Pages** – every page is a list of sections you can add, reorder, hide and
  duplicate: doctor hero, statistics over video, treatment cards, chambers,
  testimonials slider, latest videos, latest posts, call-to-action banner, the
  full about-the-doctor profile, the treatments overview, legal cards, plus
  generic blocks (rich text, image+text, card grid, FAQ, gallery, counters,
  links, services grid, reviews panel, custom HTML/CSS) and the two forms.
- **Treatments** – one row per `/our-treatments/<slug>` page: banner, causes,
  treatment options, comparison table, do/don't lists, FAQ, SEO. The header
  dropdown is built from this list automatically.
- **Blog posts** – rich-text editor, cover image, categories, publish date, SEO.
- **Videos / Gallery / Media library** – YouTube videos, gallery photos and all
  uploaded images (stored in Supabase Storage).
- **Menus** – header (with the automatic treatments dropdown), footer links and
  footer legal links.
- **Site settings** – name, logo, favicon, doctor details, chambers, contact
  details, social links, SEO defaults, footer text, languages.
- **Appointments / Messages** – inbox for the two public forms.
- **Users** – add editors and administrators (admin only).

Every text field is stored per language (`{ "bn": "…", "en": "…" }`), so English
can be filled in later without touching the code.

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

### 1a. Supabase project

1. Go to <https://supabase.com/dashboard> → your project → **Project Settings → API**.
2. Copy the *Project URL*, the *anon / publishable* key and the *service_role /
   secret* key into `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...       # server-only, never commit
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_DEFAULT_LOCALE=bn
   ```

3. **SQL Editor → New query**, then run in order:
   - `supabase/migrations/0001_init.sql` — tables, RLS policies, storage bucket, triggers
   - `supabase/migrations/0003_dr_arif.sql` — treatments, videos, gallery and the
     extra settings columns
   - `supabase/migrations/0002_seed.sql` is a generic demo site and is **not**
     needed for this project.
4. **Authentication → Providers → Email**: keep *Email* enabled. With *Confirm
   email* off, the first sign-up logs straight in.

### 1b. First administrator

Open <http://localhost:3000/admin>. With no account yet the login screen shows
**Set up your CMS**; the first account created becomes the administrator.
Afterwards that form disappears and new staff are added from **Admin → Users**.

### 1c. Import the content from the old Firebase site

The export from the original project lives in `supabase/import/`:

```bash
node scripts/import-firestore.mjs --media
```

This writes the pages, sections, 10 treatment pages, blog posts, categories,
videos, gallery, menus and site settings, and with `--media` it downloads every
image (imgbb / Firebase Storage) and re-uploads it to your Supabase Storage
bucket so nothing depends on the old hosting. Re-running replaces the same rows
rather than duplicating them.

Because the script writes to the database directly, the running app's cache does
not know about it — run `rm -rf .next` (or redeploy) once afterwards. Edits made
from `/admin` refresh the cache on their own.

## 2. Deploy to Vercel

1. Push the repository to GitHub and import it in Vercel.
2. Add the same environment variables, with `NEXT_PUBLIC_SITE_URL` set to the
   real domain (used for the sitemap and Open Graph tags).
3. Deploy, then add the domain to **Supabase → Authentication → URL
   Configuration → Site URL** so auth email links work.

After that, **content edits never need a redeploy** — only code changes do.

### How instant updates work

Public queries (`src/lib/cms/queries.ts`) are wrapped in `unstable_cache` and
tagged. Every admin Server Action finishes by calling `revalidateContent(...)`
(`src/lib/cms/revalidate.ts`), which uses Next 16's `updateTag` to expire the tag
immediately and `revalidatePath("/", "layout")` to drop the rendered HTML. The
next request rebuilds the page from the database.

## 3. Project structure

```
src/
├─ app/
│  ├─ [locale]/                  public site — the locale segment is hidden for
│  │   ├─ page.tsx               Bangla by proxy.ts (/ → /bn internally)
│  │   ├─ [...slug]/             any CMS page: /about-us, /services, legal pages
│  │   ├─ our-blogs/[slug]/      blog index + post (old ids 308-redirect)
│  │   └─ our-treatments/[slug]/ treatments index + detail
│  ├─ admin/                     admin panel (own root layout, login, (dashboard)/…)
│  ├─ sitemap.ts, robots.ts
├─ components/
│  ├─ site/                      navbar, footer, forms, treatment detail,
│  │   └─ sections/              one file per section family
│  ├─ admin/                     page builder, editors, media picker, UI kit
├─ lib/
│  ├─ cms/sections.ts            ← the section registry (fields + defaults)
│  ├─ cms/queries.ts             cached public reads
│  ├─ cms/revalidate.ts          cache invalidation after saves
│  ├─ cms/scoped-css.ts          sanitiser + CSS scoping for the custom HTML block
│  ├─ actions/                   Server Actions (auth, pages, posts, treatments, …)
│  ├─ supabase/                  server / browser / service-role clients
│  ├─ i18n.ts, dictionary.ts, utils.ts, image.ts
├─ proxy.ts                      locale rewrite + admin auth guard (Next 16 "middleware")
scripts/                         Firestore → Supabase importer
supabase/migrations/             SQL to run in the Supabase dashboard
```

## 4. Adding a new section type

1. Add an entry to `SECTION_DEFS` in `src/lib/cms/sections.ts` — the admin form is
   generated from its `fields`.
2. Create a renderer under `src/components/site/sections/` and register it in
   `src/components/site/section-renderer.tsx`.

Field types: `text`, `textarea`, `richtext`, `code`, `image`, `url`, `number`,
`boolean`, `select`, `icon`, `repeater` (nested fields). Set `localized: true` on
a text field to edit it per language.

## 5. Security notes

- Row Level Security is on for every table. Visitors can only read published
  content and insert form submissions; staff (`profiles.is_active = true`) write.
- Server Actions re-check the session on every call (`assertStaff` / `assertAdmin`).
- The service-role key is used only for creating/deleting auth users, after an
  administrator has been verified, and by the one-off import script.
- The custom HTML block strips scripts, forms and event handlers, allows iframes
  only from YouTube/Google Maps/Vimeo, and scopes its CSS to that one section.

## Scripts

```bash
npm run dev         # start locally
npm run build       # production build
npm run start       # run the production build
npm run lint        # ESLint
npm run typecheck   # TypeScript
```
