import type { Metadata } from "next";

import { MenuEditor, type PageOption } from "@/components/admin/menu-editor";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { MenuItemRow, MenuLocation, PageRow } from "@/lib/cms/database.types";
import type { MenuNode } from "@/lib/cms/queries";
import { t } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Menus" };

/** Uncached read of a menu for the editor (the public site uses the cached one). */
async function loadMenu(location: MenuLocation): Promise<MenuNode[]> {
  const supabase = await createSupabaseServerClient();

  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("location", location)
    .maybeSingle();

  if (!menu) return [];

  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .eq("menu_id", menu.id)
    .order("sort_order", { ascending: true });

  const rows = (data ?? []) as MenuItemRow[];
  return rows
    .filter((row) => !row.parent_id)
    .map((row) => ({ ...row, children: rows.filter((child) => child.parent_id === row.id) }));
}

export default async function AdminMenusPage() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();

  const [header, footer, { data: pages }] = await Promise.all([
    loadMenu("header"),
    loadMenu("footer"),
    supabase
      .from("pages")
      .select("slug, title, is_home")
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
  ]);

  const pageOptions: PageOption[] = [
    { label: "Blog", url: "/blog" },
    ...((pages ?? []) as Pick<PageRow, "slug" | "title" | "is_home">[]).map((page) => ({
      label: t(page.title, "en") || page.slug,
      url: page.is_home ? "/" : `/${page.slug}`,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Menus"
        description="Links are written without a language prefix (for example /about); the site adds /bn or /en automatically."
      />

      <div className="flex flex-col gap-6">
        <MenuEditor location="header" initial={header} pageOptions={pageOptions} />
        <MenuEditor location="footer" initial={footer} pageOptions={pageOptions} />
      </div>
    </>
  );
}
