"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { assertStaff } from "@/lib/auth";
import { CACHE_TAGS, revalidateContent } from "@/lib/cms/revalidate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const localized = z.record(z.string(), z.string().max(4000));
const optionalUrl = z.string().trim().max(1000).optional();

const settingsSchema = z.object({
  site_name: localized,
  tagline: localized,
  logo_url: z.string().max(1000).nullable(),
  favicon_url: z.string().max(1000).nullable(),
  default_locale: z.enum(["bn", "en"]),
  enabled_locales: z.array(z.enum(["bn", "en"])).min(1),
  seo: z.object({
    title: localized.optional(),
    description: localized.optional(),
    keywords: localized.optional(),
    og_image: z.string().max(1000).optional(),
  }),
  contact: z.object({
    phone: z.string().trim().max(60).optional(),
    emergency_phone: z.string().trim().max(60).optional(),
    email: z.string().trim().max(200).optional(),
    whatsapp: z.string().trim().max(60).optional(),
    address: localized.optional(),
    hours: localized.optional(),
    map: z.string().trim().max(2000).optional(),
  }),
  socials: z.object({
    facebook: optionalUrl,
    youtube: optionalUrl,
    instagram: optionalUrl,
    linkedin: optionalUrl,
    twitter: optionalUrl,
    whatsapp: optionalUrl,
  }),
  footer: z.object({
    about: localized.optional(),
    copyright: localized.optional(),
  }),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export async function saveSettings(input: SettingsInput): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const parsed = settingsSchema.parse(input);

    // The default language must be one of the enabled ones.
    if (!parsed.enabled_locales.includes(parsed.default_locale)) {
      parsed.enabled_locales = [parsed.default_locale, ...parsed.enabled_locales];
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, ...parsed }, { onConflict: "id" });

    if (error) throw new Error(error.message);

    revalidateContent(CACHE_TAGS.settings);
    revalidatePath("/admin/settings");
    return ok();
  } catch (error) {
    return fail(error, "Could not save the settings.");
  }
}
