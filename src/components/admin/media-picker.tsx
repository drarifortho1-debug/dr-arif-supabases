"use client";

import { Check, ImageIcon, LoaderCircle, Search, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button, Input } from "@/components/admin/ui";
import type { MediaRow } from "@/lib/cms/database.types";
import { ACCEPTED_IMAGE_TYPES, uploadMediaFiles } from "@/lib/media-upload";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  // Mount the panel only while open, so every opening starts with a fresh
  // load and no stale state lingers between uses.
  if (!open) return null;
  return <MediaPickerPanel onClose={onClose} onSelect={onSelect} />;
}

function MediaPickerPanel({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Bumping this re-runs the fetch (used after an upload).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: loadError } = await supabase
          .from("media")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);

        if (cancelled) return;
        if (loadError) throw new Error(loadError.message);
        setItems((data ?? []) as MediaRow[]);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Could not load the media library.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      await uploadMediaFiles(Array.from(files));
      setReloadKey((key) => key + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const visible = query.trim()
    ? items.filter((item) => item.filename.toLowerCase().includes(query.trim().toLowerCase()))
    : items;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/50"
      />

      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[80vh] sm:rounded-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-900">Media library</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-5 py-3">
          <div className="relative flex-1 min-w-48">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by file name"
              className="pl-9"
            />
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
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            variant="primary"
          >
            {uploading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>

        {error ? (
          <p className="mx-5 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </p>
        ) : null}

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-full items-center justify-center text-ink-400">
              <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-ink-400">
              <ImageIcon className="h-10 w-10" aria-hidden />
              <p className="text-sm">No images yet. Upload your first one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group flex flex-col overflow-hidden rounded-xl border border-ink-200 text-left transition-all hover:border-brand-400 hover:shadow-md"
                >
                  <span className="relative block aspect-4/3 w-full bg-ink-100">
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      sizes="200px"
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute inset-0 hidden items-center justify-center bg-brand-600/80 group-hover:flex">
                      <Check className="h-7 w-7 text-white" aria-hidden />
                    </span>
                  </span>
                  <span className="truncate px-2.5 py-2 text-xs text-ink-600">
                    {item.filename}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Image field used by the section builder and the post editor. */
export function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-50",
          )}
        >
          {value ? (
            <Image
              src={value}
              alt={label ?? "Selected image"}
              fill
              sizes="112px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full items-center justify-center text-ink-300">
              <ImageIcon className="h-6 w-6" aria-hidden />
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
            <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            {value ? "Change" : "Choose image"}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onSelect={onChange} />
    </>
  );
}
