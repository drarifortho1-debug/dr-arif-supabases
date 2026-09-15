"use client";

import { Check, Copy, ImageIcon, LoaderCircle, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Alert, Button, EmptyState } from "@/components/admin/ui";
import { deleteMedia } from "@/lib/actions/media";
import type { MediaRow } from "@/lib/cms/database.types";
import { ACCEPTED_IMAGE_TYPES, uploadMediaFiles } from "@/lib/media-upload";
import { formatBytes, formatDateTime } from "@/lib/utils";

export function MediaLibrary({ items }: { items: MediaRow[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleFiles(files: FileList | File[] | null) {
    const list = files ? Array.from(files) : [];
    if (list.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      await uploadMediaFiles(list);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function copyUrl(item: MediaRow) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Could not copy to the clipboard.");
    }
  }

  async function remove(item: MediaRow) {
    if (!window.confirm(`Delete ${item.filename}? Pages that use it will show a placeholder.`)) {
      return;
    }
    setDeleting(item.id);
    setError(null);
    const result = await deleteMedia(item.id);
    setDeleting(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-brand-500 bg-brand-50" : "border-ink-300 bg-white"
        }`}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          {uploading ? (
            <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden />
          ) : (
            <Upload className="h-6 w-6" aria-hidden />
          )}
        </span>
        <div>
          <p className="text-sm font-medium text-ink-800">
            {uploading ? "Uploading…" : "Drag and drop images here"}
          </p>
          <p className="mt-0.5 text-xs text-ink-500">PNG, JPG, WebP, AVIF, GIF or SVG · up to 8 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          multiple
          hidden
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          Choose files
        </Button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {items.length === 0 ? (
        <EmptyState
          title="The library is empty"
          description="Upload photos of your clinic, doctors and treatments to use them in pages and posts."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white"
            >
              <div className="relative aspect-4/3 w-full bg-ink-100">
                {item.mime_type?.startsWith("image/") ? (
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-ink-300">
                    <ImageIcon className="h-8 w-8" aria-hidden />
                  </span>
                )}
              </div>

              <figcaption className="flex flex-col gap-1 p-3">
                <span className="truncate text-xs font-medium text-ink-800" title={item.filename}>
                  {item.filename}
                </span>
                <span className="text-[11px] text-ink-400">
                  {formatBytes(item.size)} · {formatDateTime(item.created_at)}
                </span>

                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => void copyUrl(item)}
                    className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 text-xs font-medium text-ink-600 hover:bg-ink-50"
                  >
                    {copied === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-brand-600" aria-hidden /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden /> Copy URL
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    disabled={deleting === item.id}
                    onClick={() => void remove(item)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    {deleting === item.id ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    )}
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
