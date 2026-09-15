import type { Metadata } from "next";

import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { PostCategoryRow } from "@/lib/cms/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("post_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <>
      <PageHeader
        title="Blog categories"
        description="Group posts so visitors can filter the blog by topic."
      />
      <CategoryManager categories={(data ?? []) as PostCategoryRow[]} />
    </>
  );
}
