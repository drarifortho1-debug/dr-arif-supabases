"use client";

import { LoaderCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, FormRow, Input } from "@/components/admin/ui";
import { createPage } from "@/lib/actions/pages";
import { createPost } from "@/lib/actions/posts";
import type { ActionResult } from "@/lib/actions/types";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { slugify } from "@/lib/utils";

type CreateAction = (input: {
  slug: string;
  title: Record<string, string>;
}) => Promise<ActionResult<string>>;

/**
 * "New page" / "New post" dialog. Collects a title per language plus a slug,
 * creates a draft and jumps into the editor.
 */
function CreateEntryDialog({
  action,
  noun,
  redirectBase,
  urlPrefix,
}: {
  action: CreateAction;
  noun: string;
  redirectBase: string;
  urlPrefix: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  function setTitle(locale: string, value: string) {
    setTitles((current) => ({ ...current, [locale]: value }));
    // Derive the slug from the English title until the editor types their own.
    if (!slugTouched && locale === "en") setSlug(slugify(value));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result = await action({ slug: slug.trim(), title: titles });
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(`${redirectBase}/${result.data}`);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden />
        New {noun}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-ink-950/50"
      />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Create a {noun}</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              It starts as a draft; you will add the content on the next screen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-400 hover:bg-ink-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {LOCALES.map((locale) => (
            <FormRow key={locale} label={`Title (${LOCALE_LABELS[locale]})`}>
              <Input
                value={titles[locale] ?? ""}
                onChange={(event) => setTitle(locale, event.target.value)}
                placeholder={locale === "bn" ? "আমাদের সম্পর্কে" : "About us"}
                autoFocus={locale === LOCALES[0]}
              />
            </FormRow>
          ))}

          <FormRow label="Slug" required help={`Used in the URL: ${urlPrefix}${slug || "example"}`}>
            <Input
              value={slug}
              required
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              onBlur={(event) => setSlug(slugify(event.target.value) || event.target.value)}
              placeholder="about-us"
            />
          </FormRow>

          {error ? <Alert tone="error">{error}</Alert> : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !slug.trim()}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Create {noun}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function CreatePageForm() {
  return (
    <CreateEntryDialog
      action={createPage}
      noun="page"
      redirectBase="/admin/pages"
      urlPrefix="/bn/"
    />
  );
}

export function CreatePostForm() {
  return (
    <CreateEntryDialog
      action={createPost}
      noun="post"
      redirectBase="/admin/posts"
      urlPrefix="/bn/blog/"
    />
  );
}
