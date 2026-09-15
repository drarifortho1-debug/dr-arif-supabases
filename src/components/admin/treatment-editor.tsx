"use client";

import { CircleAlert, CircleCheck, ExternalLink, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { FieldRenderer, Toggle } from "@/components/admin/field-renderer";
import { ImagePicker } from "@/components/admin/media-picker";
import { Alert, Button, FormRow, Input, Label, Panel, Textarea } from "@/components/admin/ui";
import { saveTreatment, type TreatmentInput } from "@/lib/actions/treatments";
import type { TreatmentRow } from "@/lib/cms/database.types";
import type { FieldDef } from "@/lib/cms/sections";
import { LOCALES, LOCALE_LABELS, localePath, type Locale } from "@/lib/i18n";
import { cn, slugify } from "@/lib/utils";

type Tab = "content" | "details" | "seo";

const TABS: Array<[Tab, string]> = [
  ["content", "Content"],
  ["details", "Details & FAQ"],
  ["seo", "Menu & SEO"],
];

/** Repeater definitions reused by the generic FieldRenderer. */
const rep = (
  name: string,
  label: string,
  fields: FieldDef[],
  itemLabel: string,
  addLabel: string,
): FieldDef => ({ name, label, type: "repeater", fields, itemLabel, addLabel, wide: true });

const txt = (name: string, label: string): FieldDef => ({
  name,
  label,
  type: "text",
  localized: true,
});

const area = (name: string, label: string): FieldDef => ({
  name,
  label,
  type: "textarea",
  localized: true,
});

const CAUSES = rep("causes", "Causes", [txt("title", "Title"), area("description", "Description")], "title", "Add cause");
const OPTIONS = rep("treatments", "Treatment options", [txt("name", "Name"), area("description", "Description")], "name", "Add option");
const FAQ = rep("faq", "Questions", [txt("question", "Question"), area("answer", "Answer")], "question", "Add question");
const HEADERS = rep("table_headers", "Table columns", [txt("text", "Column name")], "text", "Add column");
const ROWS = rep("table_rows", "Table rows", [txt("text", "Row — separate cells with |")], "text", "Add row");
const DOS = rep("dos", "Do", [txt("text", "Item")], "text", "Add item");
const DONTS = rep("donts", "Don't", [txt("text", "Item")], "text", "Add item");

export function TreatmentEditor({ treatment }: { treatment: TreatmentRow }) {
  const [form, setForm] = useState<TreatmentInput>({
    slug: treatment.slug,
    nav_label: (treatment.nav_label ?? {}) as Record<string, string>,
    nav_desc: (treatment.nav_desc ?? {}) as Record<string, string>,
    enabled: treatment.enabled,
    sort_order: treatment.sort_order,
    hero_image: treatment.hero_image,
    hero_image_alt: (treatment.hero_image_alt ?? {}) as Record<string, string>,
    title: (treatment.title ?? {}) as Record<string, string>,
    subtitle: (treatment.subtitle ?? {}) as Record<string, string>,
    meta_title: (treatment.meta_title ?? {}) as Record<string, string>,
    meta_description: (treatment.meta_description ?? {}) as Record<string, string>,
    causes: treatment.causes ?? [],
    treatments: treatment.treatments ?? [],
    symptoms: (treatment.symptoms ?? {}) as Record<string, string>,
    doctor_advice: (treatment.doctor_advice ?? {}) as Record<string, string>,
    faq: treatment.faq ?? [],
    cta_subtitle: (treatment.cta_subtitle ?? {}) as Record<string, string>,
    table_title: (treatment.table_title ?? {}) as Record<string, string>,
    table_headers: treatment.table_headers ?? [],
    table_rows: treatment.table_rows ?? [],
    dos: treatment.dos ?? [],
    donts: treatment.donts ?? [],
  });

  const [tab, setTab] = useState<Tab>("content");
  const [locale, setLocale] = useState<Locale>(LOCALES[0]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function patch(next: Partial<TreatmentInput>) {
    setForm((current) => ({ ...current, ...next }));
    setDirty(true);
    setMessage(null);
  }

  function patchLocalized(key: keyof TreatmentInput, value: string) {
    setForm((current) => ({
      ...current,
      [key]: { ...(current[key] as Record<string, string>), [locale]: value },
    }));
    setDirty(true);
    setMessage(null);
  }

  const localizedValue = (key: keyof TreatmentInput) =>
    ((form[key] as Record<string, string>)?.[locale] ?? "");

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await saveTreatment(treatment.id, form);
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

  const hint = LOCALE_LABELS[locale];
  const previewHref = localePath(locale, `/our-treatments/${form.slug}`);

  const repeater = (field: FieldDef) => (
    <FieldRenderer
      field={field}
      locale={locale}
      value={form[field.name as keyof TreatmentInput]}
      onChange={(value) => patch({ [field.name]: value } as Partial<TreatmentInput>)}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink-900">
            {localizedValue("nav_label") || form.slug}
          </h1>
          <p className="mt-0.5 truncate text-sm text-ink-500">{previewHref}</p>
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
            href={previewHref}
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

      <div className="flex gap-1 border-b border-ink-200">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === value
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-800",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "content" ? (
        <div className="flex flex-col gap-5">
          <Panel title="Page header">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Banner image" help="1920×800 works well. Leave empty for no banner.">
                <ImagePicker
                  value={form.hero_image ?? ""}
                  onChange={(url) => patch({ hero_image: url || null })}
                />
              </FormRow>
              <FormRow label="Banner alt text" hint={hint}>
                <Input
                  value={localizedValue("hero_image_alt")}
                  onChange={(event) => patchLocalized("hero_image_alt", event.target.value)}
                />
              </FormRow>
              <FormRow label="Page title (H1)" hint={hint} required wide>
                <Input
                  value={localizedValue("title")}
                  onChange={(event) => patchLocalized("title", event.target.value)}
                />
              </FormRow>
              <FormRow label="Introduction" hint={hint} wide>
                <Textarea
                  rows={4}
                  value={localizedValue("subtitle")}
                  onChange={(event) => patchLocalized("subtitle", event.target.value)}
                />
              </FormRow>
            </div>
          </Panel>

          <Panel title="Causes">{repeater(CAUSES)}</Panel>
          <Panel title="Treatment options">{repeater(OPTIONS)}</Panel>
        </div>
      ) : null}

      {tab === "details" ? (
        <div className="flex flex-col gap-5">
          <Panel title="Symptoms & advice">
            <div className="grid gap-4">
              <FormRow label="Symptoms / when to see a doctor" hint={hint}>
                <Textarea
                  rows={4}
                  value={localizedValue("symptoms")}
                  onChange={(event) => patchLocalized("symptoms", event.target.value)}
                />
              </FormRow>
              <FormRow label="Doctor's advice" hint={hint}>
                <Textarea
                  rows={4}
                  value={localizedValue("doctor_advice")}
                  onChange={(event) => patchLocalized("doctor_advice", event.target.value)}
                />
              </FormRow>
              <FormRow label="Call-to-action message" hint={hint}>
                <Textarea
                  rows={3}
                  value={localizedValue("cta_subtitle")}
                  onChange={(event) => patchLocalized("cta_subtitle", event.target.value)}
                />
              </FormRow>
            </div>
          </Panel>

          <Panel
            title="Comparison table"
            description="Leave the columns empty to hide the table."
          >
            <div className="flex flex-col gap-4">
              <FormRow label="Table title" hint={hint}>
                <Input
                  value={localizedValue("table_title")}
                  onChange={(event) => patchLocalized("table_title", event.target.value)}
                />
              </FormRow>
              {repeater(HEADERS)}
              {repeater(ROWS)}
            </div>
          </Panel>

          <Panel title="Do and don't">
            <div className="grid gap-4 sm:grid-cols-2">
              {repeater(DOS)}
              {repeater(DONTS)}
            </div>
          </Panel>

          <Panel title="Questions and answers">{repeater(FAQ)}</Panel>
        </div>
      ) : null}

      {tab === "seo" ? (
        <Panel title="Menu entry & search engines">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Menu name" hint={hint} required help="Shown in the header dropdown and on cards.">
              <Input
                value={localizedValue("nav_label")}
                onChange={(event) => patchLocalized("nav_label", event.target.value)}
              />
            </FormRow>
            <FormRow label="Menu description" hint={hint}>
              <Input
                value={localizedValue("nav_desc")}
                onChange={(event) => patchLocalized("nav_desc", event.target.value)}
              />
            </FormRow>
            <FormRow label="Slug" required help="Changing this breaks existing links.">
              <Input
                value={form.slug}
                onChange={(event) => patch({ slug: event.target.value })}
                onBlur={(event) => patch({ slug: slugify(event.target.value) || event.target.value })}
              />
            </FormRow>
            <FormRow label="Order in the menu">
              <Input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(event) => patch({ sort_order: Number(event.target.value) || 0 })}
              />
            </FormRow>
            <FormRow label="Meta title" hint={hint} help="Keep it under 60 characters.">
              <Input
                maxLength={90}
                value={localizedValue("meta_title")}
                onChange={(event) => patchLocalized("meta_title", event.target.value)}
              />
            </FormRow>
            <FormRow label="Meta description" hint={hint} help="Keep it under 160 characters.">
              <Textarea
                rows={3}
                maxLength={300}
                value={localizedValue("meta_description")}
                onChange={(event) => patchLocalized("meta_description", event.target.value)}
              />
            </FormRow>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Toggle
                checked={form.enabled}
                onChange={(enabled) => patch({ enabled })}
                label="Show on the website"
              />
              <div>
                <Label>Show on the website</Label>
                <p className="text-xs text-ink-400">
                  When off, the page, the menu entry and the cards all disappear.
                </p>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
