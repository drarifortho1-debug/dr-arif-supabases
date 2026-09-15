"use client";

import { CircleAlert, CircleCheck, ExternalLink, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { ImagePicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  Alert,
  Button,
  FormRow,
  Input,
  Panel,
  Select,
  Textarea,
} from "@/components/admin/ui";
import { savePost, type PostInput } from "@/lib/actions/posts";
import type { PostCategoryRow, PostRow } from "@/lib/cms/database.types";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { cn, slugify } from "@/lib/utils";

export function PostEditor({
  post,
  categories,
}: {
  post: PostRow;
  categories: PostCategoryRow[];
}) {
  const [form, setForm] = useState<PostInput>({
    slug: post.slug,
    title: (post.title ?? {}) as Record<string, string>,
    excerpt: (post.excerpt ?? {}) as Record<string, string>,
    content: (post.content ?? {}) as Record<string, string>,
    cover_image: post.cover_image,
    category_id: post.category_id,
    status: post.status,
    published_at: post.published_at,
    seo_title: (post.seo_title ?? {}) as Record<string, string>,
    seo_description: (post.seo_description ?? {}) as Record<string, string>,
  });

  const [locale, setLocale] = useState<Locale>(LOCALES[0]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  function patch(next: Partial<PostInput>) {
    setForm((current) => ({ ...current, ...next }));
    setDirty(true);
    setMessage(null);
  }

  function patchLocalized(
    key: "title" | "excerpt" | "content" | "seo_title" | "seo_description",
    value: string,
  ) {
    setForm((current) => ({ ...current, [key]: { ...current[key], [locale]: value } }));
    setDirty(true);
    setMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const result = await savePost(post.id, form);
    setSaving(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }

    setDirty(false);
    setMessage({ tone: "success", text: "Saved. The live site is already updated." });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!saving) void handleSave();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, form]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink-900">
            {form.title[locale] || form.title.en || form.title.bn || "Untitled post"}
          </h1>
          <p className="mt-0.5 truncate text-sm text-ink-500">/{locale}/blog/{form.slug}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
            {LOCALES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  item === locale ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-800",
                )}
              >
                {LOCALE_LABELS[item]}
              </button>
            ))}
          </div>

          <a
            href={`/${locale}/blog/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 hover:bg-ink-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Preview
          </a>

          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
        </div>
      </div>

      {message ? (
        <Alert tone={message.tone}>
          <span className="flex items-center gap-2">
            {message.tone === "success" ? (
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {message.text}
          </span>
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-5">
          <Panel title="Content">
            <div className="flex flex-col gap-4">
              <FormRow label="Title" hint={LOCALE_LABELS[locale]} required>
                <Input
                  value={form.title[locale] ?? ""}
                  onChange={(event) => patchLocalized("title", event.target.value)}
                />
              </FormRow>

              <FormRow
                label="Excerpt"
                hint={LOCALE_LABELS[locale]}
                help="A short summary shown on cards and in search results."
              >
                <Textarea
                  rows={2}
                  maxLength={400}
                  value={form.excerpt[locale] ?? ""}
                  onChange={(event) => patchLocalized("excerpt", event.target.value)}
                />
              </FormRow>

              <FormRow label="Body" hint={LOCALE_LABELS[locale]}>
                <RichTextEditor
                  key={locale}
                  minHeight={380}
                  value={form.content[locale] ?? ""}
                  onChange={(html) => patchLocalized("content", html)}
                />
              </FormRow>
            </div>
          </Panel>

          <Panel title="SEO" description="Leave blank to reuse the title and excerpt.">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Meta title" hint={LOCALE_LABELS[locale]}>
                <Input
                  maxLength={70}
                  value={form.seo_title[locale] ?? ""}
                  onChange={(event) => patchLocalized("seo_title", event.target.value)}
                />
              </FormRow>
              <FormRow label="Meta description" hint={LOCALE_LABELS[locale]} wide>
                <Textarea
                  rows={3}
                  maxLength={300}
                  value={form.seo_description[locale] ?? ""}
                  onChange={(event) => patchLocalized("seo_description", event.target.value)}
                />
              </FormRow>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Publishing">
            <div className="flex flex-col gap-4">
              <FormRow label="Status">
                <Select
                  value={form.status}
                  onChange={(event) =>
                    patch({ status: event.target.value as "draft" | "published" })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </FormRow>

              <FormRow label="Publish date" help="Leave empty to use the moment you publish.">
                <Input
                  type="datetime-local"
                  value={form.published_at ? form.published_at.slice(0, 16) : ""}
                  onChange={(event) =>
                    patch({
                      published_at: event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null,
                    })
                  }
                />
              </FormRow>

              <FormRow label="Slug" required>
                <Input
                  value={form.slug}
                  onChange={(event) => patch({ slug: event.target.value })}
                  onBlur={(event) =>
                    patch({ slug: slugify(event.target.value) || event.target.value })
                  }
                />
              </FormRow>

              <FormRow label="Category">
                <Select
                  value={form.category_id ?? ""}
                  onChange={(event) => patch({ category_id: event.target.value || null })}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name.en || category.name.bn || category.slug}
                    </option>
                  ))}
                </Select>
              </FormRow>
            </div>
          </Panel>

          <Panel title="Cover image">
            <ImagePicker
              value={form.cover_image ?? ""}
              onChange={(url) => patch({ cover_image: url || null })}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}
