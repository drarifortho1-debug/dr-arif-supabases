"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { assertStaff } from "@/lib/auth";
import { CACHE_TAGS, revalidateContent } from "@/lib/cms/revalidate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const localized = z.record(z.string(), z.string().max(20000));
const rows = z.array(z.record(z.string(), z.unknown())).max(60);

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(140)
  .regex(/^[^\s/?#%]+$/, "Slug cannot contain spaces or the characters / ? # %");

const treatmentSchema = z.object({
  slug: slugSchema,
  nav_label: localized,
  nav_desc: localized,
  enabled: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
  hero_image: z.string().max(1000).nullable(),
  hero_image_alt: localized,
  title: localized,
  subtitle: localized,
  meta_title: localized,
  meta_description: localized,
  causes: rows,
  treatments: rows,
  symptoms: localized,
  doctor_advice: localized,
  faq: rows,
  cta_subtitle: localized,
  table_title: localized,
  table_headers: rows,
  table_rows: rows,
  dos: rows,
  donts: rows,
});

export type TreatmentInput = z.infer<typeof treatmentSchema>;

function describe(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "That slug is already used by another treatment.";
  return error.message;
}

export async function createTreatment(input: {
  slug: string;
  nav_label: Record<string, string>;
}): Promise<ActionResult<string>> {
  try {
    await assertStaff();

    const slug = slugSchema.parse(input.slug);
    const navLabel = localized.parse(input.nav_label ?? {});

    const supabase = await createSupabaseServerClient();

    const { count } = await supabase
      .from("treatments")
      .select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("treatments")
      .insert({
        slug,
        nav_label: navLabel,
        title: navLabel,
        enabled: false,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error) throw new Error(describe(error));

    revalidatePath("/admin/treatments");
    return ok(data.id as string);
  } catch (error) {
    return fail(error, "Could not create the treatment page.");
  }
}

export async function saveTreatment(
  id: string,
  input: TreatmentInput,
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const parsed = treatmentSchema.parse(input);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("treatments")
      .update(parsed as never)
      .eq("id", id);

    if (error) throw new Error(describe(error));

    // The header dropdown is built from treatments, so menus refresh too.
    revalidateContent(CACHE_TAGS.treatments, CACHE_TAGS.menus);
    revalidatePath("/admin/treatments");
    revalidatePath(`/admin/treatments/${id}`);
    return ok();
  } catch (error) {
    return fail(error, "Could not save the treatment page.");
  }
}

export async function deleteTreatment(id: string): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("treatments").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.treatments, CACHE_TAGS.menus);
    revalidatePath("/admin/treatments");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the treatment page.");
  }
}

/** Move a treatment up or down in the menu order. */
export async function reorderTreatment(
  id: string,
  direction: -1 | 1,
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { data: all, error } = await supabase
      .from("treatments")
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
        .from("treatments")
        .update({ sort_order: order })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
    }

    revalidateContent(CACHE_TAGS.treatments, CACHE_TAGS.menus);
    revalidatePath("/admin/treatments");
    return ok();
  } catch (error) {
    return fail(error, "Could not reorder the treatments.");
  }
}
