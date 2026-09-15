"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { assertStaff } from "@/lib/auth";
import { CACHE_TAGS, revalidateContent } from "@/lib/cms/revalidate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* ---------------------------------------------------------------- schemas */

const localized = z.record(z.string(), z.string().max(20000));

/** Slugs may contain Bangla characters, but never a space or a path separator. */
const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(120)
  .regex(/^[^\s/?#%]+$/, "Slug cannot contain spaces or the characters / ? # %");

const pageMetaSchema = z.object({
  slug: slugSchema,
  title: localized,
  status: z.enum(["draft", "published"]),
  is_home: z.boolean(),
  seo_title: localized,
  seo_description: localized,
  og_image: z.string().max(1000).nullable(),
  sort_order: z.number().int().min(0).max(9999),
});

const sectionSchema = z.object({
  id: z.string().uuid().nullable(),
  type: z.string().min(1).max(60),
  data: z.record(z.string(), z.unknown()),
  is_visible: z.boolean(),
});

export type PageMetaInput = z.infer<typeof pageMetaSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;

function describe(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "That slug is already used by another page.";
  return error.message;
}

/* ---------------------------------------------------------------- create */

export async function createPage(input: {
  slug: string;
  title: Record<string, string>;
}): Promise<ActionResult<string>> {
  try {
    await assertStaff();

    const slug = slugSchema.parse(input.slug);
    const title = localized.parse(input.title ?? {});

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("pages")
      .insert({ slug, title, status: "draft", is_home: false })
      .select("id")
      .single();

    if (error) throw new Error(describe(error));

    revalidatePath("/admin/pages");
    return ok(data.id as string);
  } catch (error) {
    return fail(error, "Could not create the page.");
  }
}

/* ------------------------------------------------------------------ save */

/**
 * Saves page settings and its full section list in one go.
 *
 * Sections are reconciled rather than wiped and re-inserted, so existing rows
 * keep their ids (and any future references to them stay valid).
 */
export async function savePage(
  pageId: string,
  meta: PageMetaInput,
  sections: SectionInput[],
): Promise<ActionResult<{ sectionIds: Array<string | null> }>> {
  try {
    await assertStaff();

    const parsedMeta = pageMetaSchema.parse(meta);
    const parsedSections = z.array(sectionSchema).max(60).parse(sections);

    const supabase = await createSupabaseServerClient();

    // Only one page may be the home page.
    if (parsedMeta.is_home) {
      const { error: clearError } = await supabase
        .from("pages")
        .update({ is_home: false })
        .neq("id", pageId)
        .eq("is_home", true);
      if (clearError) throw new Error(clearError.message);
    }

    const { error: pageError } = await supabase
      .from("pages")
      .update(parsedMeta)
      .eq("id", pageId);

    if (pageError) throw new Error(describe(pageError));

    // Remove sections the editor deleted.
    const keepIds = parsedSections
      .map((section) => section.id)
      .filter((id): id is string => Boolean(id));

    const { data: existing, error: existingError } = await supabase
      .from("sections")
      .select("id")
      .eq("page_id", pageId);

    if (existingError) throw new Error(existingError.message);

    const removed = (existing ?? [])
      .map((row) => row.id as string)
      .filter((id) => !keepIds.includes(id));

    if (removed.length > 0) {
      const { error: deleteError } = await supabase
        .from("sections")
        .delete()
        .in("id", removed);
      if (deleteError) throw new Error(deleteError.message);
    }

    // Update the ones that exist, insert the new ones, and record the order.
    const sectionIds: Array<string | null> = [];

    for (const [index, section] of parsedSections.entries()) {
      const payload = {
        page_id: pageId,
        type: section.type,
        data: section.data as Record<string, never>,
        is_visible: section.is_visible,
        sort_order: index,
      };

      if (section.id) {
        const { error } = await supabase
          .from("sections")
          .update(payload)
          .eq("id", section.id);
        if (error) throw new Error(error.message);
        sectionIds.push(section.id);
      } else {
        const { data, error } = await supabase
          .from("sections")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        sectionIds.push(data.id as string);
      }
    }

    revalidateContent(CACHE_TAGS.pages);
    revalidatePath("/admin/pages");
    revalidatePath(`/admin/pages/${pageId}`);

    return ok({ sectionIds });
  } catch (error) {
    return fail(error, "Could not save the page.");
  }
}

/* ---------------------------------------------------------------- delete */

export async function deletePage(pageId: string): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { data: page } = await supabase
      .from("pages")
      .select("is_home")
      .eq("id", pageId)
      .maybeSingle();

    if (page?.is_home) {
      throw new Error("Set another page as the home page before deleting this one.");
    }

    const { error } = await supabase.from("pages").delete().eq("id", pageId);
    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.pages);
    revalidatePath("/admin/pages");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the page.");
  }
}

/* ------------------------------------------------------------- duplicate */

export async function duplicatePage(pageId: string): Promise<ActionResult<string>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { data: page, error: readError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .maybeSingle();

    if (readError) throw new Error(readError.message);
    if (!page) throw new Error("That page no longer exists.");

    const copyTitle = Object.fromEntries(
      Object.entries(page.title ?? {}).map(([locale, text]) => [locale, `${text} (copy)`]),
    );

    const { data: created, error: insertError } = await supabase
      .from("pages")
      .insert({
        slug: `${page.slug}-copy-${Date.now().toString(36)}`,
        title: copyTitle,
        status: "draft",
        is_home: false,
        seo_title: page.seo_title,
        seo_description: page.seo_description,
        og_image: page.og_image,
        sort_order: page.sort_order,
      })
      .select("id")
      .single();

    if (insertError) throw new Error(describe(insertError));

    const { data: sections, error: sectionsError } = await supabase
      .from("sections")
      .select("type, data, sort_order, is_visible")
      .eq("page_id", pageId)
      .order("sort_order", { ascending: true });

    if (sectionsError) throw new Error(sectionsError.message);

    if (sections && sections.length > 0) {
      const { error } = await supabase.from("sections").insert(
        sections.map((section) => ({ ...section, page_id: created.id as string })),
      );
      if (error) throw new Error(error.message);
    }

    revalidatePath("/admin/pages");
    return ok(created.id as string);
  } catch (error) {
    return fail(error, "Could not duplicate the page.");
  }
}
