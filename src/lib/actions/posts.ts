"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { assertStaff } from "@/lib/auth";
import { CACHE_TAGS, revalidateContent } from "@/lib/cms/revalidate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const localized = z.record(z.string(), z.string().max(200000));

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(140)
  .regex(/^[^\s/?#%]+$/, "Slug cannot contain spaces or the characters / ? # %");

const postSchema = z.object({
  slug: slugSchema,
  title: localized,
  excerpt: localized,
  content: localized,
  cover_image: z.string().max(1000).nullable(),
  category_id: z.string().uuid().nullable(),
  status: z.enum(["draft", "published"]),
  published_at: z.string().nullable(),
  seo_title: localized,
  seo_description: localized,
});

export type PostInput = z.infer<typeof postSchema>;

function describe(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "That slug is already used by another post.";
  return error.message;
}

/* ----------------------------------------------------------------- posts */

export async function createPost(input: {
  slug: string;
  title: Record<string, string>;
}): Promise<ActionResult<string>> {
  try {
    const session = await assertStaff();

    const slug = slugSchema.parse(input.slug);
    const title = localized.parse(input.title ?? {});

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .insert({ slug, title, status: "draft", author_id: session.userId })
      .select("id")
      .single();

    if (error) throw new Error(describe(error));

    revalidatePath("/admin/posts");
    return ok(data.id as string);
  } catch (error) {
    return fail(error, "Could not create the post.");
  }
}

export async function savePost(
  postId: string,
  input: PostInput,
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const parsed = postSchema.parse(input);

    // Stamp the publish date the first time a post goes live.
    const publishedAt =
      parsed.status === "published" ? (parsed.published_at ?? new Date().toISOString()) : parsed.published_at;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("posts")
      .update({ ...parsed, published_at: publishedAt })
      .eq("id", postId);

    if (error) throw new Error(describe(error));

    revalidateContent(CACHE_TAGS.posts);
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${postId}`);
    return ok();
  } catch (error) {
    return fail(error, "Could not save the post.");
  }
}

export async function deletePost(postId: string): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.posts);
    revalidatePath("/admin/posts");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the post.");
  }
}

/* ------------------------------------------------------------ categories */

const categorySchema = z.object({
  slug: slugSchema,
  name: localized,
  sort_order: z.number().int().min(0).max(9999),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export async function saveCategory(
  id: string | null,
  input: CategoryInput,
): Promise<ActionResult<string>> {
  try {
    await assertStaff();
    const parsed = categorySchema.parse(input);
    const supabase = await createSupabaseServerClient();

    if (id) {
      const { error } = await supabase.from("post_categories").update(parsed).eq("id", id);
      if (error) throw new Error(describe(error));
      revalidateContent(CACHE_TAGS.categories);
      revalidatePath("/admin/categories");
      return ok(id);
    }

    const { data, error } = await supabase
      .from("post_categories")
      .insert(parsed)
      .select("id")
      .single();

    if (error) throw new Error(describe(error));

    revalidateContent(CACHE_TAGS.categories);
    revalidatePath("/admin/categories");
    return ok(data.id as string);
  } catch (error) {
    return fail(error, "Could not save the category.");
  }
}

export async function deleteCategory(id: string): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("post_categories").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.categories, CACHE_TAGS.posts);
    revalidatePath("/admin/categories");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the category.");
  }
}
