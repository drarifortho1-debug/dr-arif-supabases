import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostEditor } from "@/components/admin/post-editor";
import { requireStaff } from "@/lib/auth";
import type { PostCategoryRow, PostRow } from "@/lib/cms/database.types";
import { t } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface EditorProps {
  params: Promise<{ id: string }>;
}

async function loadPost(id: string) {
  const supabase = await createSupabaseServerClient();

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("post_categories").select("*").order("sort_order", { ascending: true }),
  ]);

  if (!post) return null;

  return {
    post: post as PostRow,
    categories: (categories ?? []) as PostCategoryRow[],
  };
}

export async function generateMetadata({ params }: EditorProps): Promise<Metadata> {
  const { id } = await params;
  const result = await loadPost(id);
  return { title: result ? t(result.post.title, "en") || "Post" : "Post" };
}

export default async function AdminPostEditor({ params }: EditorProps) {
  await requireStaff();

  const { id } = await params;
  const result = await loadPost(id);

  if (!result) notFound();

  return (
    <>
      <Link
        href="/admin/posts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All posts
      </Link>

      <PostEditor post={result.post} categories={result.categories} />
    </>
  );
}
