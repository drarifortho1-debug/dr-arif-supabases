import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ActionButton } from "@/components/admin/action-button";
import { CreatePostForm } from "@/components/admin/create-page-form";
import {
  EmptyState,
  PageHeader,
  StatusBadge,
  Table,
  Td,
  Th,
} from "@/components/admin/ui";
import { deletePost } from "@/lib/actions/posts";
import { requireStaff } from "@/lib/auth";
import type { PostCategoryRow, PostRow } from "@/lib/cms/database.types";
import { DEFAULT_LOCALE, t } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog posts" };

type PostListRow = PostRow & { category: PostCategoryRow | null };

export default async function AdminPostsList() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, category:post_categories(*)")
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as unknown as PostListRow[];

  return (
    <>
      <PageHeader
        title="Blog posts"
        description="Articles, health tips and announcements."
        actions={<CreatePostForm />}
      />

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Write your first article to populate the blog page and the 'Latest articles' section."
        />
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white">
          <Table>
            <thead>
              <tr>
                <Th>Post</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Published</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const title = t(post.title, "en") || t(post.title, "bn") || "Untitled";
                const href = `/${DEFAULT_LOCALE}/blog/${post.slug}`;

                return (
                  <tr key={post.id} className="hover:bg-ink-50/60">
                    <Td>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="flex items-center gap-3 font-medium text-ink-900 hover:text-brand-700"
                      >
                        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-ink-100">
                          {post.cover_image ? (
                            <Image
                              src={post.cover_image}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate">{title}</span>
                          <span className="block truncate text-xs font-normal text-ink-400">
                            /{post.slug}
                          </span>
                        </span>
                      </Link>
                    </Td>
                    <Td className="text-ink-600">
                      {post.category ? t(post.category.name, "en") : "—"}
                    </Td>
                    <Td>
                      <StatusBadge status={post.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-ink-500">
                      {post.published_at ? formatDateTime(post.published_at) : "—"}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on the website"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                        <ActionButton
                          action={deletePost.bind(null, post.id)}
                          confirm={`Delete "${title}"? This cannot be undone.`}
                          title="Delete"
                          className="h-8 w-8 p-0 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </ActionButton>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
}
