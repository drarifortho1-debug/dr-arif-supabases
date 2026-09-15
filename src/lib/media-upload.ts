"use client";

import { registerMedia } from "@/lib/actions/media";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { formatBytes } from "@/lib/utils";

export const ACCEPTED_IMAGE_TYPES =
  "image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Strip characters that make Storage paths awkward. */
function safeFilename(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "file";
}

/**
 * Uploads files straight from the browser to Supabase Storage and registers
 * each one in the `media` table. Throws on the first failure.
 */
export async function uploadMediaFiles(files: File[]): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(`${file.name} is larger than ${formatBytes(MAX_UPLOAD_BYTES)}.`);
    }

    const folder = new Date().toISOString().slice(0, 7); // e.g. 2026-09
    const path = `${folder}/${crypto.randomUUID()}-${safeFilename(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

    const result = await registerMedia({
      path,
      url: publicUrl,
      filename: file.name,
      mime_type: file.type,
      size: file.size,
    });

    if (!result.ok) throw new Error(result.error);
  }
}
