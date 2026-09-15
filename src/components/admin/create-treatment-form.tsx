"use client";

import { LoaderCircle, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, FormRow, Input } from "@/components/admin/ui";
import { createTreatment } from "@/lib/actions/treatments";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { slugify } from "@/lib/utils";

export function CreateTreatmentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  function setLabel(locale: string, value: string) {
    setLabels((current) => ({ ...current, [locale]: value }));
    if (!slugTouched && locale === "en") setSlug(slugify(value));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result = await createTreatment({ slug: slug.trim(), nav_label: labels });
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/admin/treatments/${result.data}`);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden />
        New treatment
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

      <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Create a treatment page</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              It starts hidden; turn it on once the content is ready.
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
            <FormRow key={locale} label={`Menu name (${LOCALE_LABELS[locale]})`}>
              <Input
                value={labels[locale] ?? ""}
                onChange={(event) => setLabel(locale, event.target.value)}
                placeholder={locale === "bn" ? "হাঁটু ব্যথা" : "Knee pain"}
                autoFocus={locale === LOCALES[0]}
              />
            </FormRow>
          ))}

          <FormRow
            label="Slug"
            required
            help={`Used in the URL: /our-treatments/${slug || "knee-pain-treatment-cumilla"}`}
          >
            <Input
              value={slug}
              required
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              onBlur={(event) => setSlug(slugify(event.target.value) || event.target.value)}
              placeholder="knee-pain-treatment-cumilla"
            />
          </FormRow>

          {error ? <Alert tone="error">{error}</Alert> : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !slug.trim()}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Create treatment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
