"use client";

import { ChevronDown, ChevronUp, LoaderCircle, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { MediaPickerDialog } from "@/components/admin/media-picker";
import { Alert, Button, EmptyState } from "@/components/admin/ui";
import { addGalleryImages, deleteGalleryImage, reorderLibraryItem } from "@/lib/actions/library";
import type { GalleryRow } from "@/lib/cms/database.types";
import { ACCEPTED_IMAGE_TYPES, uploadMediaFiles } from "@/lib/media-upload";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function GalleryManager({ images }: { images: GalleryRow[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(key: string, task: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(key);
    setError(null);
    const result = await task();
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  /** Upload straight into the gallery: store the files, then add the rows. */
  async function handleFiles(files: FileList | null) {
    const list = files ? Array.from(files) : [];
    if (list.length === 0) return;

    setBusy("upload");
    setError(null);
    try {
      await uploadMediaFiles(list);

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("media")
        .select("url")
        .order("created_at", { ascending: false })
        .limit(list.length);

      const urls = (data ?? []).map((row) => row.url as string).reverse();
      if (urls.length > 0) {
        const result = await addGalleryImages(urls);
        if (!result.ok) throw new Error(result.error);
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          multiple
          hidden
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <Button variant="secondary" onClick={() => setPicking(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Add from library
        </Button>
        <Button onClick={() => inputRef.current?.click()} disabled={busy === "upload"}>
          {busy === "upload" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Upload className="h-4 w-4" aria-hidden />
          )}
          Upload images
        </Button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {images.length === 0 ? (
        <EmptyState
          title="The gallery is empty"
          description="Gallery photos appear on the About page and in any gallery section set to 'Gallery tab'."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <figure
              key={image.id}
              className="flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white"
            >
              <div className="relative aspect-square w-full bg-ink-100">
                <Image
                  src={image.image_url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <figcaption className="flex items-center justify-between gap-1.5 p-2">
                <span className="text-xs text-ink-400">#{index + 1}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0 || busy === image.id}
                    onClick={() => void run(image.id, () => reorderLibraryItem("gallery", image.id, -1))}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === images.length - 1 || busy === image.id}
                    onClick={() => void run(image.id, () => reorderLibraryItem("gallery", image.id, 1))}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    disabled={busy === image.id}
                    onClick={() => {
                      if (window.confirm("Remove this photo from the gallery?")) {
                        void run(image.id, () => deleteGalleryImage(image.id));
                      }
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        onSelect={(url) => void run("add", () => addGalleryImages([url]))}
      />
    </div>
  );
}
