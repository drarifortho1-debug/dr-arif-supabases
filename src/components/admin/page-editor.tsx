"use client";

import {
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AddSectionDialog } from "@/components/admin/add-section-dialog";
import { FieldRenderer, Toggle } from "@/components/admin/field-renderer";
import { ImagePicker } from "@/components/admin/media-picker";
import {
  Alert,
  Button,
  FormRow,
  Input,
  Label,
  Panel,
  Select,
  Textarea,
} from "@/components/admin/ui";
import { Icon } from "@/components/icon";
import { savePage, type PageMetaInput } from "@/lib/actions/pages";
import type { PageRow, SectionRow } from "@/lib/cms/database.types";
import { defaultSectionData, getSectionDef } from "@/lib/cms/sections";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { cn, slugify } from "@/lib/utils";

interface EditorSection {
  key: string;
  id: string | null;
  type: string;
  data: Record<string, unknown>;
  is_visible: boolean;
}

type Tab = "sections" | "settings" | "seo";

function toEditorSections(rows: SectionRow[]): EditorSection[] {
  return rows.map((row) => ({
    key: row.id,
    id: row.id,
    type: row.type,
    data: (row.data ?? {}) as Record<string, unknown>,
    is_visible: row.is_visible,
  }));
}

export function PageEditor({
  page,
  sections: initialSections,
}: {
  page: PageRow;
  sections: SectionRow[];
}) {
  const [meta, setMeta] = useState<PageMetaInput>({
    slug: page.slug,
    title: (page.title ?? {}) as Record<string, string>,
    status: page.status,
    is_home: page.is_home,
    seo_title: (page.seo_title ?? {}) as Record<string, string>,
    seo_description: (page.seo_description ?? {}) as Record<string, string>,
    og_image: page.og_image,
    sort_order: page.sort_order,
  });

  const [sections, setSections] = useState<EditorSection[]>(() =>
    toEditorSections(initialSections),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initialSections[0]?.id ?? null,
  );
  const [tab, setTab] = useState<Tab>("sections");
  const [locale, setLocale] = useState<Locale>(LOCALES[0]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  const selected = sections.find((section) => section.key === selectedKey) ?? null;
  const selectedDef = selected ? getSectionDef(selected.type) : undefined;

  const previewHref = useMemo(
    () => (page.is_home ? `/${locale}` : `/${locale}/${meta.slug}`),
    [page.is_home, locale, meta.slug],
  );

  /* ----------------------------------------------------------- mutations */

  function touch() {
    setDirty(true);
    setMessage(null);
  }

  function patchMeta(patch: Partial<PageMetaInput>) {
    setMeta((current) => ({ ...current, ...patch }));
    touch();
  }

  function patchLocalizedMeta(
    key: "title" | "seo_title" | "seo_description",
    text: string,
  ) {
    setMeta((current) => ({ ...current, [key]: { ...current[key], [locale]: text } }));
    touch();
  }

  function addSection(type: string) {
    const section: EditorSection = {
      key: `new-${crypto.randomUUID()}`,
      id: null,
      type,
      data: defaultSectionData(type),
      is_visible: true,
    };
    setSections((current) => [...current, section]);
    setSelectedKey(section.key);
    setTab("sections");
    touch();
  }

  function updateSectionData(key: string, fieldName: string, value: unknown) {
    setSections((current) =>
      current.map((section) =>
        section.key === key
          ? { ...section, data: { ...section.data, [fieldName]: value } }
          : section,
      ),
    );
    touch();
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next;
    });
    touch();
  }

  function duplicateSection(key: string) {
    setSections((current) => {
      const index = current.findIndex((section) => section.key === key);
      if (index === -1) return current;
      const copy: EditorSection = {
        ...current[index],
        key: `new-${crypto.randomUUID()}`,
        id: null,
        data: JSON.parse(JSON.stringify(current[index].data)),
      };
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
    touch();
  }

  function removeSection(key: string) {
    setSections((current) => current.filter((section) => section.key !== key));
    if (selectedKey === key) setSelectedKey(null);
    touch();
  }

  /* ---------------------------------------------------------------- save */

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const result = await savePage(
      page.id,
      meta,
      sections.map((section) => ({
        id: section.id,
        type: section.type,
        data: section.data,
        is_visible: section.is_visible,
      })),
    );

    setSaving(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }

    // Adopt the ids the database assigned to newly created sections, so the
    // next save updates them instead of inserting duplicates.
    const ids = result.data.sectionIds;
    setSections((current) =>
      current.map((section, index) => ({
        ...section,
        id: ids[index] ?? section.id,
        key: ids[index] ?? section.key,
      })),
    );
    setSelectedKey((current) => {
      const index = sections.findIndex((section) => section.key === current);
      return index === -1 ? current : (ids[index] ?? current);
    });

    setDirty(false);
    setMessage({ tone: "success", text: "Saved. The live site is already updated." });
  }

  /* --------------------------------------------------------- keyboard/UX */

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
  }, [saving, meta, sections]);

  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /* -------------------------------------------------------------- render */

  return (
    <div className="flex flex-col gap-5">
      {/* ------------------------------------------------------- toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink-900">
            {meta.title[locale] || meta.title.en || meta.title.bn || "Untitled page"}
          </h1>
          <p className="mt-0.5 truncate text-sm text-ink-500">
            /{locale}/{page.is_home ? "" : meta.slug}
          </p>
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
                  item === locale
                    ? "bg-brand-600 text-white"
                    : "text-ink-500 hover:text-ink-800",
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

      {/* ---------------------------------------------------------- tabs */}
      <div className="flex gap-1 border-b border-ink-200">
        {(
          [
            ["sections", `Sections (${sections.length})`],
            ["settings", "Page settings"],
            ["seo", "SEO"],
          ] as Array<[Tab, string]>
        ).map(([value, label]) => (
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

      {/* ------------------------------------------------------ sections */}
      {tab === "sections" ? (
        <div className="grid gap-5 lg:grid-cols-[19rem_1fr]">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
              {sections.map((section, index) => {
                const def = getSectionDef(section.type);
                const active = section.key === selectedKey;

                return (
                  <div
                    key={section.key}
                    className={cn(
                      "flex items-center gap-1 rounded-lg border bg-white px-2 py-2 transition-colors",
                      active ? "border-brand-500 ring-2 ring-brand-100" : "border-ink-200",
                      !section.is_visible && "opacity-60",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedKey(section.key)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon name={def?.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink-800">
                          {def?.label ?? section.type}
                        </span>
                        <span className="block text-[11px] text-ink-400">#{index + 1}</span>
                      </span>
                    </button>

                    <div className="flex flex-col">
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => moveSection(index, -1)}
                        className="rounded p-0.5 text-ink-400 hover:text-ink-700 disabled:opacity-25"
                      >
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={index === sections.length - 1}
                        onClick={() => moveSection(index, 1)}
                        className="rounded p-0.5 text-ink-400 hover:text-ink-700 disabled:opacity-25"
                      >
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="secondary" onClick={() => setAdding(true)} className="w-full">
              <Plus className="h-4 w-4" aria-hidden />
              Add section
            </Button>
          </div>

          <div>
            {selected && selectedDef ? (
              <Panel
                title={selectedDef.label}
                description={selectedDef.description}
                actions={
                  <>
                    <button
                      type="button"
                      title={selected.is_visible ? "Hide on the website" : "Show on the website"}
                      onClick={() => {
                        setSections((current) =>
                          current.map((section) =>
                            section.key === selected.key
                              ? { ...section, is_visible: !section.is_visible }
                              : section,
                          ),
                        );
                        touch();
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
                    >
                      {selected.is_visible ? (
                        <>
                          <Eye className="h-3.5 w-3.5" aria-hidden /> Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" aria-hidden /> Hidden
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      title="Duplicate section"
                      onClick={() => duplicateSection(selected.key)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                    </button>

                    <button
                      type="button"
                      title="Delete section"
                      onClick={() => {
                        if (window.confirm("Delete this section? This cannot be undone.")) {
                          removeSection(selected.key);
                        }
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedDef.fields.map((field) => (
                    <FieldRenderer
                      key={field.name}
                      field={field}
                      locale={locale}
                      value={selected.data[field.name]}
                      onChange={(value) => updateSectionData(selected.key, field.name, value)}
                    />
                  ))}
                </div>
              </Panel>
            ) : (
              <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white/60 p-8 text-center">
                <h3 className="text-sm font-semibold text-ink-700">
                  {sections.length === 0 ? "This page is empty" : "No section selected"}
                </h3>
                <p className="max-w-sm text-sm text-ink-500">
                  {sections.length === 0
                    ? "Add your first section to start building the page."
                    : "Pick a section on the left to edit its content."}
                </p>
                {sections.length === 0 ? (
                  <Button variant="primary" onClick={() => setAdding(true)}>
                    <Plus className="h-4 w-4" aria-hidden />
                    Add section
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------ settings */}
      {tab === "settings" ? (
        <Panel title="Page settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Title" hint={LOCALE_LABELS[locale]} required>
              <Input
                value={meta.title[locale] ?? ""}
                onChange={(event) => patchLocalizedMeta("title", event.target.value)}
                placeholder="About us"
              />
            </FormRow>

            <FormRow
              label="Slug"
              required
              help="The URL segment. The home page ignores this."
            >
              <Input
                value={meta.slug}
                onChange={(event) => patchMeta({ slug: event.target.value })}
                onBlur={(event) =>
                  patchMeta({ slug: slugify(event.target.value) || event.target.value })
                }
                placeholder="about-us"
              />
            </FormRow>

            <FormRow label="Status">
              <Select
                value={meta.status}
                onChange={(event) =>
                  patchMeta({ status: event.target.value as "draft" | "published" })
                }
              >
                <option value="draft">Draft — hidden from visitors</option>
                <option value="published">Published — live on the website</option>
              </Select>
            </FormRow>

            <FormRow label="Order in menus" help="Lower numbers come first.">
              <Input
                type="number"
                min={0}
                value={meta.sort_order}
                onChange={(event) => patchMeta({ sort_order: Number(event.target.value) || 0 })}
              />
            </FormRow>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Toggle
                checked={meta.is_home}
                onChange={(checked) => patchMeta({ is_home: checked })}
                label="Use as home page"
              />
              <div>
                <Label>Use as the home page</Label>
                <p className="text-xs text-ink-400">
                  This page will be served at / — any other home page is unset automatically.
                </p>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}

      {/* ----------------------------------------------------------- seo */}
      {tab === "seo" ? (
        <Panel
          title="Search engine optimisation"
          description="Leave blank to fall back to the page title and the site defaults."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Meta title" hint={LOCALE_LABELS[locale]}>
              <Input
                value={meta.seo_title[locale] ?? ""}
                onChange={(event) => patchLocalizedMeta("seo_title", event.target.value)}
                maxLength={70}
              />
            </FormRow>

            <FormRow label="Social share image">
              <ImagePicker
                value={meta.og_image ?? ""}
                onChange={(url) => patchMeta({ og_image: url || null })}
              />
            </FormRow>

            <FormRow
              label="Meta description"
              hint={LOCALE_LABELS[locale]}
              wide
              help="Around 155 characters works best in search results."
            >
              <Textarea
                rows={3}
                value={meta.seo_description[locale] ?? ""}
                onChange={(event) => patchLocalizedMeta("seo_description", event.target.value)}
                maxLength={300}
              />
            </FormRow>
          </div>
        </Panel>
      ) : null}

      <AddSectionDialog open={adding} onClose={() => setAdding(false)} onPick={addSection} />
    </div>
  );
}
