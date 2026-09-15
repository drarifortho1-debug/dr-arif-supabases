"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertStaff } from "@/lib/auth";
import type { LocalizedJson } from "@/lib/cms/database.types";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const registerSchema = z.object({
  path: z.string().min(1).max(400),
  url: z.url(),
  filename: z.string().min(1).max(300),
  mime_type: z.string().max(120).optional(),
  size: z.number().int().nonnegative().optional(),
});

export type RegisterMediaInput = z.infer<typeof registerSchema>;

/**
 * Records a file that the browser has already uploaded straight to Supabase
 * Storage. Doing the transfer client-side keeps large images out of the Server
 * Action request body.
 */
export async function registerMedia(input: RegisterMediaInput): Promise<ActionResult<string>> {
  try {
    const session = await assertStaff();
    const data = registerSchema.parse(input);

    const supabase = await createSupabaseServerClient();
    const { data: row, error } = await supabase
      .from("media")
      .insert({
        bucket: MEDIA_BUCKET,
        path: data.path,
        url: data.url,
        filename: data.filename,
        mime_type: data.mime_type ?? null,
        size: data.size ?? null,
        uploaded_by: session.userId,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/media");
    return ok(row.id as string);
  } catch (error) {
    return fail(error, "Could not save the uploaded file.");
  }
}

export async function deleteMedia(id: string): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { data: row, error: readError } = await supabase
      .from("media")
      .select("bucket, path")
      .eq("id", id)
      .maybeSingle();

    if (readError) throw new Error(readError.message);
    if (!row) throw new Error("That file no longer exists.");

    // Remove the object first; if this fails we keep the row so the file is
    // still reachable from the library rather than becoming an orphan.
    const { error: storageError } = await supabase.storage
      .from(row.bucket ?? MEDIA_BUCKET)
      .remove([row.path as string]);

    if (storageError) throw new Error(storageError.message);

    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/media");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the file.");
  }
}

export async function updateMediaAlt(
  id: string,
  alt: LocalizedJson,
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("media").update({ alt }).eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/media");
    return ok();
  } catch (error) {
    return fail(error, "Could not update the description.");
  }
}
