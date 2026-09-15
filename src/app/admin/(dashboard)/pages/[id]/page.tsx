import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageEditor } from "@/components/admin/page-editor";
import { requireStaff } from "@/lib/auth";
import type { PageRow, SectionRow } from "@/lib/cms/database.types";
import { t } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

async function loadPage(id: string) {
  const supabase = await createSupabaseServerClient();

  const { data: page } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  if (!page) return null;

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", id)
    .order("sort_order", { ascending: true });

  return {
    page: page as PageRow,
    sections: (sections ?? []) as SectionRow[],
  };
}

export async function generateMetadata({ params }: EditorPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await loadPage(id);
  return { title: result ? t(result.page.title, "en") || "Page" : "Page" };
}

export default async function AdminPageEditor({ params }: EditorPageProps) {
  await requireStaff();

  const { id } = await params;
  const result = await loadPage(id);

  if (!result) notFound();

  return (
    <>
      <Link
        href="/admin/pages"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All pages
      </Link>

      <PageEditor page={result.page} sections={result.sections} />
    </>
  );
}
