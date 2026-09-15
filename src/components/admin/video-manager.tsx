"use client";

import { ChevronDown, ChevronUp, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, EmptyState, FormRow, Input } from "@/components/admin/ui";
import { addVideo, deleteVideo, reorderLibraryItem, updateVideo } from "@/lib/actions/library";
import type { VideoRow } from "@/lib/cms/database.types";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";

export function VideoManager({ videos }: { videos: VideoRow[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(key: string, task: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(key);
    setError(null);
    const result = await task();
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const done = await run("add", () => addVideo({ url, title: titles }));
    if (done) {
      setUrl("");
      setTitles({});
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={submit} className="rounded-xl border border-ink-200 bg-white p-5">
        <div className="grid items-end gap-4 sm:grid-cols-2">
          <FormRow label="YouTube link or video id" required>
            <Input
              value={url}
              required
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </FormRow>
          {LOCALES.map((locale) => (
            <FormRow key={locale} label={`Title (${LOCALE_LABELS[locale]})`} hint="optional">
              <Input
                value={titles[locale] ?? ""}
                onChange={(event) =>
                  setTitles((current) => ({ ...current, [locale]: event.target.value }))
                }
              />
            </FormRow>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={busy === "add" || !url.trim()}>
            {busy === "add" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            Add video
          </Button>
        </div>
      </form>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {videos.length === 0 ? (
        <EmptyState
          title="No videos yet"
          description="Videos appear on the home page and on the video gallery page."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <div key={video.id} className="overflow-hidden rounded-xl border border-ink-200 bg-white">
              <div className="relative aspect-video w-full bg-ink-900">
                <iframe
                  className="h-full w-full border-0"
                  src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0`}
                  title={video.title.bn ?? video.youtube_id}
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <div className="flex flex-col gap-3 p-4">
                {LOCALES.map((locale) => (
                  <Input
                    key={locale}
                    defaultValue={video.title[locale] ?? ""}
                    placeholder={`Title (${LOCALE_LABELS[locale]})`}
                    onBlur={(event) => {
                      const next = { ...video.title, [locale]: event.target.value };
                      if ((video.title[locale] ?? "") === event.target.value) return;
                      void run(video.id, () =>
                        updateVideo(video.id, { title: next as Record<string, string> }),
                      );
                    }}
                  />
                ))}

                <div className="flex items-center justify-between">
                  <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs text-ink-500">
                    {video.youtube_id}
                  </code>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      title="Move up"
                      disabled={index === 0 || busy === video.id}
                      onClick={() => void run(video.id, () => reorderLibraryItem("videos", video.id, -1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      disabled={index === videos.length - 1 || busy === video.id}
                      onClick={() => void run(video.id, () => reorderLibraryItem("videos", video.id, 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      disabled={busy === video.id}
                      onClick={() => {
                        if (window.confirm("Remove this video from the website?")) {
                          void run(video.id, () => deleteVideo(video.id));
                        }
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
