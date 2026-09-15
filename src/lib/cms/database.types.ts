import type { Locale } from "@/lib/i18n";

/**
 * Hand-written database types.
 *
 * Once your Supabase project is live you can regenerate a stricter version with
 *   npx supabase gen types typescript --project-id <ref> > src/lib/cms/database.types.ts
 * but keeping this file checked in means the app type-checks before the project
 * exists, and the localized JSONB columns get a friendlier type than `Json`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** A JSONB column holding one string per locale. */
export type LocalizedJson = Partial<Record<Locale, string>>;

export type UserRole = "admin" | "editor";
export type ContentStatus = "draft" | "published";
export type MenuLocation = "header" | "footer" | "footer_legal";
export type InboxStatus = "new" | "read" | "archived";

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PageRow = {
  id: string;
  slug: string;
  title: LocalizedJson;
  status: ContentStatus;
  is_home: boolean;
  seo_title: LocalizedJson;
  seo_description: LocalizedJson;
  og_image: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SectionRow = {
  id: string;
  page_id: string;
  type: string;
  data: Record<string, Json>;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type PostCategoryRow = {
  id: string;
  slug: string;
  name: LocalizedJson;
  sort_order: number;
  created_at: string;
}

export type PostRow = {
  id: string;
  slug: string;
  title: LocalizedJson;
  excerpt: LocalizedJson;
  content: LocalizedJson;
  cover_image: string | null;
  category_id: string | null;
  status: ContentStatus;
  published_at: string | null;
  author_id: string | null;
  seo_title: LocalizedJson;
  seo_description: LocalizedJson;
  legacy_id: string | null;
  created_at: string;
  updated_at: string;
}

export type MenuRow = {
  id: string;
  location: MenuLocation;
  created_at: string;
  updated_at: string;
}

export type MenuItemRow = {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: LocalizedJson;
  url: string;
  sort_order: number;
  open_in_new_tab: boolean;
  auto_children: boolean;
  created_at: string;
  updated_at: string;
}

export type MediaRow = {
  id: string;
  bucket: string;
  path: string;
  url: string;
  filename: string;
  mime_type: string | null;
  size: number | null;
  alt: LocalizedJson;
  uploaded_by: string | null;
  created_at: string;
}

export type SiteContact = {
  phone?: string;
  emergency_phone?: string;
  email?: string;
  address?: LocalizedJson;
  hours?: LocalizedJson;
  map?: string;
  whatsapp?: string;
}

export type SiteSocials = {
  facebook?: string;
  youtube?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  whatsapp?: string;
}

export type SiteSeo = {
  title?: LocalizedJson;
  description?: LocalizedJson;
  keywords?: LocalizedJson;
  og_image?: string;
}

export type SiteFooter = {
  about?: LocalizedJson;
  copyright?: LocalizedJson;
}

/** Doctor identity shown in the hero, footer and legal pages. */
export type SiteDoctor = {
  name?: LocalizedJson;
  tagline?: LocalizedJson;
  degrees?: LocalizedJson;
  university?: LocalizedJson;
  position?: LocalizedJson;
  photo?: string;
};

/** A chamber as listed in the footer. */
export type SiteChamber = {
  name?: LocalizedJson;
  location?: LocalizedJson;
  schedule?: LocalizedJson;
  phone?: string;
  phone2?: string;
};

export type SiteSettingsRow = {
  id: number;
  site_name: LocalizedJson;
  tagline: LocalizedJson;
  logo_url: string | null;
  favicon_url: string | null;
  default_locale: Locale;
  enabled_locales: Locale[];
  seo: SiteSeo;
  contact: SiteContact;
  socials: SiteSocials;
  footer: SiteFooter;
  doctor: SiteDoctor;
  chambers: SiteChamber[];
  updated_at: string;
}

export type AppointmentRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  department: string | null;
  message: string | null;
  locale: string;
  status: InboxStatus;
  created_at: string;
}

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  locale: string;
  status: InboxStatus;
  created_at: string;
}

/** A repeater row with localized text fields, e.g. { title: {bn,en}, description: {bn,en} }. */
export type LocalizedItem = Record<string, LocalizedJson | string | number | boolean | null | undefined>;

export type TreatmentRow = {
  id: string;
  slug: string;
  nav_label: LocalizedJson;
  nav_desc: LocalizedJson;
  enabled: boolean;
  sort_order: number;
  hero_image: string | null;
  hero_image_alt: LocalizedJson;
  title: LocalizedJson;
  subtitle: LocalizedJson;
  meta_title: LocalizedJson;
  meta_description: LocalizedJson;
  causes: LocalizedItem[];
  treatments: LocalizedItem[];
  symptoms: LocalizedJson;
  doctor_advice: LocalizedJson;
  faq: LocalizedItem[];
  cta_subtitle: LocalizedJson;
  table_title: LocalizedJson;
  table_headers: LocalizedItem[];
  table_rows: LocalizedItem[];
  dos: LocalizedItem[];
  donts: LocalizedItem[];
  created_at: string;
  updated_at: string;
};

export type VideoRow = {
  id: string;
  youtube_id: string;
  title: LocalizedJson;
  sort_order: number;
  created_at: string;
};

export type GalleryRow = {
  id: string;
  image_url: string;
  alt: LocalizedJson;
  sort_order: number;
  created_at: string;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow>;
      pages: TableDef<PageRow>;
      sections: TableDef<SectionRow>;
      post_categories: TableDef<PostCategoryRow>;
      posts: TableDef<PostRow>;
      menus: TableDef<MenuRow>;
      menu_items: TableDef<MenuItemRow>;
      media: TableDef<MediaRow>;
      site_settings: TableDef<SiteSettingsRow>;
      appointments: TableDef<AppointmentRow>;
      contact_messages: TableDef<ContactMessageRow>;
      treatments: TableDef<TreatmentRow>;
      videos: TableDef<VideoRow>;
      gallery: TableDef<GalleryRow>;
    };
    Views: Record<never, never>;
    Functions: {
      setup_required: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      content_status: ContentStatus;
      menu_location: MenuLocation;
      inbox_status: InboxStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
