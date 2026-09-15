"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { assertStaff } from "@/lib/auth";
import type { MenuLocation } from "@/lib/cms/database.types";
import { CACHE_TAGS, revalidateContent } from "@/lib/cms/revalidate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const localized = z.record(z.string(), z.string().max(200));

const leafSchema = z.object({
  label: localized,
  url: z.string().trim().min(1).max(1000),
  open_in_new_tab: z.boolean(),
});

const itemSchema = leafSchema.extend({
  children: z.array(leafSchema).max(50),
});

const menuSchema = z.object({
  location: z.enum(["header", "footer"]),
  items: z.array(itemSchema).max(50),
});

export type MenuItemInput = z.infer<typeof itemSchema>;
export type MenuLeafInput = z.infer<typeof leafSchema>;

/**
 * Replaces the whole menu. Menu items are not referenced anywhere else, so
 * wiping and re-inserting is both simpler and safe.
 */
export async function saveMenu(
  location: MenuLocation,
  items: MenuItemInput[],
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const parsed = menuSchema.parse({ location, items });

    const supabase = await createSupabaseServerClient();

    // Ensure the menu row exists.
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .upsert({ location: parsed.location }, { onConflict: "location" })
      .select("id")
      .single();

    if (menuError) throw new Error(menuError.message);
    const menuId = menu.id as string;

    const { error: clearError } = await supabase.from("menu_items").delete().eq("menu_id", menuId);
    if (clearError) throw new Error(clearError.message);

    for (const [index, item] of parsed.items.entries()) {
      const { data: parent, error: parentError } = await supabase
        .from("menu_items")
        .insert({
          menu_id: menuId,
          parent_id: null,
          label: item.label,
          url: item.url,
          open_in_new_tab: item.open_in_new_tab,
          sort_order: index,
        })
        .select("id")
        .single();

      if (parentError) throw new Error(parentError.message);

      if (item.children.length > 0) {
        const { error: childError } = await supabase.from("menu_items").insert(
          item.children.map((child, childIndex) => ({
            menu_id: menuId,
            parent_id: parent.id as string,
            label: child.label,
            url: child.url,
            open_in_new_tab: child.open_in_new_tab,
            sort_order: childIndex,
          })),
        );
        if (childError) throw new Error(childError.message);
      }
    }

    revalidateContent(CACHE_TAGS.menus);
    revalidatePath("/admin/menus");
    return ok();
  } catch (error) {
    return fail(error, "Could not save the menu.");
  }
}
