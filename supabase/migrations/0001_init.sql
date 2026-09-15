-- =====================================================================
--  Doctor Site CMS - initial schema
--  Run in Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums
do $$ begin create type public.user_role      as enum ('admin','editor');        exception when duplicate_object then null; end $$;
do $$ begin create type public.content_status as enum ('draft','published');     exception when duplicate_object then null; end $$;
do $$ begin create type public.menu_location  as enum ('header','footer');       exception when duplicate_object then null; end $$;
do $$ begin create type public.inbox_status   as enum ('new','read','archived'); exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------- utilities
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        public.user_role not null default 'editor',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Role helpers. SECURITY DEFINER so that RLS on profiles cannot recurse.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active and p.role = 'admin'
  );
$$;

-- The very first account that signs up becomes the admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  existing_count int;
  wanted_role    public.user_role;
begin
  select count(*) into existing_count from public.profiles;

  wanted_role := coalesce(
    nullif(new.raw_user_meta_data->>'role','')::public.user_role,
    'editor'
  );

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when existing_count = 0 then 'admin'::public.user_role else wanted_role end
  )
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- pages
create table if not exists public.pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           jsonb not null default '{}'::jsonb,
  status          public.content_status not null default 'draft',
  is_home         boolean not null default false,
  seo_title       jsonb not null default '{}'::jsonb,
  seo_description jsonb not null default '{}'::jsonb,
  og_image        text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index if not exists pages_single_home_idx on public.pages (is_home) where is_home;

-- ------------------------------------------------------------- sections
create table if not exists public.sections (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references public.pages(id) on delete cascade,
  type        text not null,
  data        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists sections_page_order_idx on public.sections (page_id, sort_order);

-- ------------------------------------------------------- post categories
create table if not exists public.post_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- posts
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           jsonb not null default '{}'::jsonb,
  excerpt         jsonb not null default '{}'::jsonb,
  content         jsonb not null default '{}'::jsonb,
  cover_image     text,
  category_id     uuid references public.post_categories(id) on delete set null,
  status          public.content_status not null default 'draft',
  published_at    timestamptz,
  author_id       uuid references public.profiles(id) on delete set null,
  seo_title       jsonb not null default '{}'::jsonb,
  seo_description jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists posts_published_idx on public.posts (status, published_at desc);

-- ---------------------------------------------------------------- menus
create table if not exists public.menus (
  id          uuid primary key default gen_random_uuid(),
  location    public.menu_location not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.menu_items (
  id              uuid primary key default gen_random_uuid(),
  menu_id         uuid not null references public.menus(id) on delete cascade,
  parent_id       uuid references public.menu_items(id) on delete cascade,
  label           jsonb not null default '{}'::jsonb,
  url             text not null default '/',
  sort_order      integer not null default 0,
  open_in_new_tab boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists menu_items_menu_idx on public.menu_items (menu_id, sort_order);

-- ---------------------------------------------------------------- media
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'media',
  path        text not null,
  url         text not null,
  filename    text not null,
  mime_type   text,
  size        bigint,
  alt         jsonb not null default '{}'::jsonb,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create unique index if not exists media_bucket_path_idx on public.media (bucket, path);

-- -------------------------------------------------------- site settings
create table if not exists public.site_settings (
  id              smallint primary key default 1 check (id = 1),
  site_name       jsonb not null default '{}'::jsonb,
  tagline         jsonb not null default '{}'::jsonb,
  logo_url        text,
  favicon_url     text,
  default_locale  text not null default 'bn',
  enabled_locales text[] not null default array['bn','en'],
  seo             jsonb not null default '{}'::jsonb,
  contact         jsonb not null default '{}'::jsonb,
  socials         jsonb not null default '{}'::jsonb,
  footer          jsonb not null default '{}'::jsonb,
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------- appointments
create table if not exists public.appointments (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null,
  email           text,
  preferred_date  date,
  preferred_time  text,
  department      text,
  message         text,
  locale          text not null default 'bn',
  status          public.inbox_status not null default 'new',
  created_at      timestamptz not null default now()
);
create index if not exists appointments_created_idx on public.appointments (created_at desc);

-- -------------------------------------------------------- contact inbox
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  subject     text,
  message     text not null,
  locale      text not null default 'bn',
  status      public.inbox_status not null default 'new',
  created_at  timestamptz not null default now()
);
create index if not exists contact_created_idx on public.contact_messages (created_at desc);

-- ------------------------------------------------- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['profiles','pages','sections','posts','menus','menu_items','site_settings']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- =====================================================================
--  Row Level Security
-- =====================================================================
alter table public.profiles         enable row level security;
alter table public.pages            enable row level security;
alter table public.sections         enable row level security;
alter table public.post_categories  enable row level security;
alter table public.posts            enable row level security;
alter table public.menus            enable row level security;
alter table public.menu_items       enable row level security;
alter table public.media            enable row level security;
alter table public.site_settings    enable row level security;
alter table public.appointments     enable row level security;
alter table public.contact_messages enable row level security;

-- profiles -------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- pages ----------------------------------------------------------------
drop policy if exists pages_read on public.pages;
create policy pages_read on public.pages
  for select using (status = 'published' or public.is_staff());

drop policy if exists pages_write on public.pages;
create policy pages_write on public.pages
  for all using (public.is_staff()) with check (public.is_staff());

-- sections -------------------------------------------------------------
drop policy if exists sections_read on public.sections;
create policy sections_read on public.sections
  for select using (
    public.is_staff() or exists (
      select 1 from public.pages p
      where p.id = sections.page_id and p.status = 'published'
    )
  );

drop policy if exists sections_write on public.sections;
create policy sections_write on public.sections
  for all using (public.is_staff()) with check (public.is_staff());

-- posts ----------------------------------------------------------------
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select using (status = 'published' or public.is_staff());

drop policy if exists posts_write on public.posts;
create policy posts_write on public.posts
  for all using (public.is_staff()) with check (public.is_staff());

-- public-read reference tables ----------------------------------------
do $$
declare t text;
begin
  foreach t in array array['post_categories','menus','menu_items','media','site_settings']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_read', t);
    execute format('create policy %I on public.%I for select using (true)', t || '_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_write', t);
    execute format(
      'create policy %I on public.%I for all
       using (public.is_staff()) with check (public.is_staff())', t || '_write', t);
  end loop;
end $$;

-- inbox tables: anyone may submit, only staff may read or manage -------
do $$
declare t text;
begin
  foreach t in array array['appointments','contact_messages']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('create policy %I on public.%I for insert with check (true)', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_read', t);
    execute format('create policy %I on public.%I for select using (public.is_staff())', t || '_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format('create policy %I on public.%I for update
       using (public.is_staff()) with check (public.is_staff())', t || '_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format('create policy %I on public.%I for delete using (public.is_staff())', t || '_delete', t);
  end loop;
end $$;

-- =====================================================================
--  Storage bucket for the media library
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media staff insert" on storage.objects;
create policy "media staff insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media staff update" on storage.objects;
create policy "media staff update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_staff());

drop policy if exists "media staff delete" on storage.objects;
create policy "media staff delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_staff());

-- =====================================================================
--  First-run helper
--  The admin login screen calls this to decide whether to show
--  "create the first administrator" instead of the sign-in form.
-- =====================================================================
create or replace function public.setup_required()
returns boolean language sql stable security definer set search_path = public as $BODY$
  select not exists (select 1 from public.profiles);
$BODY$;

grant execute on function public.setup_required() to anon, authenticated;
