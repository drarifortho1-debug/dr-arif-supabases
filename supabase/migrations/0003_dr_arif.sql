-- =====================================================================
--  Dr. Arif Ortho - content types ported from the Firebase site
--  Run AFTER 0001_init.sql (0002_seed.sql is optional demo data that the
--  import script replaces). Safe to re-run.
-- =====================================================================

-- ------------------------------------------------------------ treatments
-- One row per treatment page (/our-treatments/<slug>). Localised text is
-- stored as {"bn": "...", "en": "..."}; repeating groups are JSON arrays of
-- objects with localised fields, matching the section builder's repeaters.
create table if not exists public.treatments (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  nav_label        jsonb not null default '{}'::jsonb,
  nav_desc         jsonb not null default '{}'::jsonb,
  enabled          boolean not null default true,
  sort_order       integer not null default 0,
  hero_image       text,
  hero_image_alt   jsonb not null default '{}'::jsonb,
  title            jsonb not null default '{}'::jsonb,
  subtitle         jsonb not null default '{}'::jsonb,
  meta_title       jsonb not null default '{}'::jsonb,
  meta_description jsonb not null default '{}'::jsonb,
  causes           jsonb not null default '[]'::jsonb,   -- [{title, description}]
  treatments       jsonb not null default '[]'::jsonb,   -- [{name, description}]
  symptoms         jsonb not null default '{}'::jsonb,
  doctor_advice    jsonb not null default '{}'::jsonb,
  faq              jsonb not null default '[]'::jsonb,   -- [{question, answer}]
  cta_subtitle     jsonb not null default '{}'::jsonb,
  table_title      jsonb not null default '{}'::jsonb,
  table_headers    jsonb not null default '[]'::jsonb,   -- [{text}]
  table_rows       jsonb not null default '[]'::jsonb,   -- [{text}]  cells separated by |
  dos              jsonb not null default '[]'::jsonb,   -- [{text}]
  donts            jsonb not null default '[]'::jsonb,   -- [{text}]
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists treatments_order_idx on public.treatments (enabled, sort_order);

-- ---------------------------------------------------------------- videos
create table if not exists public.videos (
  id          uuid primary key default gen_random_uuid(),
  youtube_id  text not null,
  title       jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists videos_order_idx on public.videos (sort_order, created_at desc);

-- --------------------------------------------------------------- gallery
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  alt         jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists gallery_order_idx on public.gallery (sort_order, created_at desc);

-- -------------------------------------------------------- posts additions
-- Firestore document ids of the old blog, so the old /our-blogs/<id> links
-- can permanently redirect to the slug URL.
alter table public.posts add column if not exists legacy_id text;
create index if not exists posts_legacy_id_idx on public.posts (legacy_id);

-- --------------------------------------------------------- menu additions
-- A header item can list every enabled treatment as its dropdown.
alter table public.menu_items add column if not exists auto_children boolean not null default false;

-- Footer has two link groups on the original site: quick links + legal.
do $$ begin
  alter type public.menu_location add value if not exists 'footer_legal';
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------ settings additions
-- doctor:   {name, tagline, degrees, university, position, photo}
-- chambers: [{name, location, schedule, phone, phone2}]
alter table public.site_settings add column if not exists doctor   jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists chambers jsonb not null default '[]'::jsonb;

-- ------------------------------------------------- updated_at triggers
drop trigger if exists set_updated_at on public.treatments;
create trigger set_updated_at before update on public.treatments
  for each row execute function public.set_updated_at();

-- =====================================================================
--  Row Level Security
-- =====================================================================
alter table public.treatments enable row level security;
alter table public.videos     enable row level security;
alter table public.gallery    enable row level security;

drop policy if exists treatments_read on public.treatments;
create policy treatments_read on public.treatments
  for select using (enabled or public.is_staff());

drop policy if exists treatments_write on public.treatments;
create policy treatments_write on public.treatments
  for all using (public.is_staff()) with check (public.is_staff());

do $$
declare t text;
begin
  foreach t in array array['videos','gallery']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_read', t);
    execute format('create policy %I on public.%I for select using (true)', t || '_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_write', t);
    execute format(
      'create policy %I on public.%I for all
       using (public.is_staff()) with check (public.is_staff())', t || '_write', t);
  end loop;
end $$;
