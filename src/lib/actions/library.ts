"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { assertStaff } from "@/lib/auth";
import { CACHE_TAGS, revalidateContent } from "@/lib/cms/revalidate";
import { getYouTubeId } from "@/lib/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const localized = z.record(z.string(), z.string().max(400));

/* ------------------------------------------------------------- videos */

export async function addVideo(input: {
  url: string;
  title: Record<string, string>;
}): Promise<ActionResult<string>> {
  try {
    await assertStaff();

    const youtubeId = getYouTubeId(input.url);
    if (!youtubeId) throw new Error("That does not look like a YouTube link or video id.");

    const title = localized.parse(input.title ?? {});
    const supabase = await createSupabaseServerClient();

    const { count } = await supabase.from("videos").select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("videos")
      .insert({ youtube_id: youtubeId, title, sort_order: count ?? 0 })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.videos);
    revalidatePath("/admin/videos");
    return ok(data.id as string);
  } catch (error) {
    return fail(error, "Could not add the video.");
  }
}

export async function updateVideo(
  id: string,
  input: { title: Record<string, string> },
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const title = localized.parse(input.title ?? {});

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("videos").update({ title }).eq("id", id);
    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.videos);
    revalidatePath("/admin/videos");
    return ok();
  } catch (error) {
    return fail(error, "Could not update the video.");
  }
}

export async function deleteVideo(id: string): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.videos);
    revalidatePath("/admin/videos");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the video.");
  }
}

/* ------------------------------------------------------------ gallery */

export async function addGalleryImages(
  urls: string[],
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();

    const list = z.array(z.string().max(1000)).min(1).max(60).parse(urls);
    const supabase = await createSupabaseServerClient();

    const { count } = await supabase.from("gallery").select("id", { count: "exact", head: true });
    const start = count ?? 0;

    const { error } = await supabase.from("gallery").insert(
      list.map((image_url, index) => ({ image_url, alt: {}, sort_order: start + index })),
    );
    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.gallery);
    revalidatePath("/admin/gallery");
    return ok();
  } catch (error) {
    return fail(error, "Could not add the images.");
  }
}

export async function deleteGalleryImage(id: string): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.gallery);
    revalidatePath("/admin/gallery");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the image.");
  }
}

/** Move a video or gallery image one place up or down. */
export async function reorderLibraryItem(
  table: "videos" | "gallery",
  id: string,
  direction: -1 | 1,
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const parsedTable = z.enum(["videos", "gallery"]).parse(table);

    const supabase = await createSupabaseServerClient();
    const { data: all, error } = await supabase
      .from(parsedTable)
      .select("id, sort_order")
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);

    const list = (all ?? []) as Array<{ id: string; sort_order: number }>;
    const index = list.findIndex((row) => row.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= list.length) return ok();

    const reordered = [...list];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    for (const [order, row] of reordered.entries()) {
      if (row.sort_order === order) continue;
      const { error: updateError } = await supabase
        .from(parsedTable)
        .update({ sort_order: order })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
    }

    revalidateContent(parsedTable === "videos" ? CACHE_TAGS.videos : CACHE_TAGS.gallery);
    revalidatePath(`/admin/${parsedTable}`);
    return ok();
  } catch (error) {
    return fail(error, "Could not reorder the items.");
  }
}
