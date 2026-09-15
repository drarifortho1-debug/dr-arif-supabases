"use client";

import {
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CornerDownRight,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Toggle } from "@/components/admin/field-renderer";
import { Alert, Button, Input, Label, Panel, Select } from "@/components/admin/ui";
import { saveMenu, type MenuItemInput, type MenuLeafInput } from "@/lib/actions/menus";
import type { MenuLocation } from "@/lib/cms/database.types";
import type { MenuNode } from "@/lib/cms/queries";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface PageOption {
  label: string;
  url: string;
}

function fromNodes(nodes: MenuNode[]): MenuItemInput[] {
  return nodes.map((node) => ({
    label: (node.label ?? {}) as Record<string, string>,
    url: node.url,
    open_in_new_tab: node.open_in_new_tab,
    children: (node.children ?? []).map((child) => ({
      label: (child.label ?? {}) as Record<string, string>,
      url: child.url,
      open_in_new_tab: child.open_in_new_tab,
    })),
  }));
}

const BLANK: MenuLeafInput = { label: {}, url: "/", open_in_new_tab: false };

export function MenuEditor({
  location,
  initial,
  pageOptions,
}: {
  location: MenuLocation;
  initial: MenuNode[];
  pageOptions: PageOption[];
}) {
  const [items, setItems] = useState<MenuItemInput[]>(() => fromNodes(initial));
  const [locale, setLocale] = useState<Locale>(LOCALES[0]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  function commit(next: MenuItemInput[]) {
    setItems(next);
    setDirty(true);
    setMessage(null);
  }

  function addFromPage(option: PageOption) {
    commit([
      ...items,
      {
        label: Object.fromEntries(LOCALES.map((item) => [item, option.label])),
        url: option.url,
        open_in_new_tab: false,
        children: [],
      },
    ]);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await saveMenu(location, items);
    setSaving(false);
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }
    setDirty(false);
    setMessage({ tone: "success", text: "Menu saved and live." });
  }

  const move = (list: MenuLeafInput[], from: number, to: number) => {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    return next;
  };

  return (
    <Panel
      title={location === "header" ? "Header menu" : "Footer menu"}
      description={
        location === "header"
          ? "Main navigation. Items can have one level of dropdown links."
          : "Quick links shown in the footer."
      }
      actions={
        <>
          <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
            {LOCALES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  item === locale ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-800",
                )}
              >
                {LOCALE_LABELS[item]}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden />
            )}
            {saving ? "Saving…" : dirty ? "Save menu" : "Saved"}
          </Button>
        </>
      }
    >
      {message ? (
        <div className="mb-4">
          <Alert tone={message.tone}>
            <span className="flex items-center gap-2">
              {message.tone === "success" ? (
                <CircleCheck className="h-4 w-4" aria-hidden />
              ) : (
                <CircleAlert className="h-4 w-4" aria-hidden />
              )}
              {message.text}
            </span>
          </Alert>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-ink-200">
            <ItemRow
              item={item}
              locale={locale}
              onChange={(next) =>
                commit(items.map((row, i) => (i === index ? { ...row, ...next } : row)))
              }
              onMoveUp={() => commit(move(items, index, index - 1) as MenuItemInput[])}
              onMoveDown={() => commit(move(items, index, index + 1) as MenuItemInput[])}
              onDelete={() => commit(items.filter((_, i) => i !== index))}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
            />

            {location === "header" ? (
              <div className="border-t border-ink-100 bg-ink-50/60 px-3 py-2">
                {item.children.map((child, childIndex) => (
                  <div key={childIndex} className="flex items-start gap-2 py-1">
                    <CornerDownRight className="mt-3 h-4 w-4 shrink-0 text-ink-300" aria-hidden />
                    <div className="flex-1 rounded-lg border border-ink-200 bg-white">
                      <ItemRow
                        item={child}
                        locale={locale}
                        compact
                        onChange={(next) =>
                          commit(
                            items.map((row, i) =>
                              i === index
                                ? {
                                    ...row,
                                    children: row.children.map((c, ci) =>
                                      ci === childIndex ? { ...c, ...next } : c,
                                    ),
                                  }
                                : row,
                            ),
                          )
                        }
                        onMoveUp={() =>
                          commit(
                            items.map((row, i) =>
                              i === index
                                ? { ...row, children: move(row.children, childIndex, childIndex - 1) }
                                : row,
                            ),
                          )
                        }
                        onMoveDown={() =>
                          commit(
                            items.map((row, i) =>
                              i === index
                                ? { ...row, children: move(row.children, childIndex, childIndex + 1) }
                                : row,
                            ),
                          )
                        }
                        onDelete={() =>
                          commit(
                            items.map((row, i) =>
                              i === index
                                ? { ...row, children: row.children.filter((_, ci) => ci !== childIndex) }
                                : row,
                            ),
                          )
                        }
                        canMoveUp={childIndex > 0}
                        canMoveDown={childIndex < item.children.length - 1}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    commit(
                      items.map((row, i) =>
                        i === index ? { ...row, children: [...row.children, { ...BLANK }] } : row,
                      ),
                    )
                  }
                  className="mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add dropdown link
                </button>
              </div>
            ) : null}
          </div>
        ))}

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
            This menu is empty.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => commit([...items, { ...BLANK, children: [] }])}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add custom link
          </Button>

          {pageOptions.length > 0 ? (
            <Select
              className="h-8 w-auto py-0 text-xs"
              value=""
              onChange={(event) => {
                const option = pageOptions.find((item) => item.url === event.target.value);
                if (option) addFromPage(option);
              }}
            >
              <option value="">Add a page…</option>
              {pageOptions.map((option) => (
                <option key={option.url} value={option.url}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

function ItemRow({
  item,
  locale,
  compact = false,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: {
  item: MenuLeafInput;
  locale: Locale;
  compact?: boolean;
  onChange: (next: Partial<MenuLeafInput>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className={cn("grid items-end gap-3 p-3 sm:grid-cols-[1fr_1fr_auto_auto]", compact && "p-2.5")}>
      <div className="flex flex-col gap-1">
        <Label hint={locale.toUpperCase()}>Label</Label>
        <Input
          value={item.label[locale] ?? ""}
          placeholder={locale === "bn" ? "হোম" : "Home"}
          onChange={(event) => onChange({ label: { ...item.label, [locale]: event.target.value } })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Link</Label>
        <Input
          value={item.url}
          placeholder="/about or https://…"
          onChange={(event) => onChange({ url: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>New tab</Label>
        <div className="flex h-10 items-center">
          <Toggle checked={item.open_in_new_tab} onChange={(open_in_new_tab) => onChange({ open_in_new_tab })} />
        </div>
      </div>

      <div className="flex items-center gap-1 self-end">
        <button
          type="button"
          aria-label="Move up"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-30"
        >
          <ChevronUp className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Move down"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 disabled:opacity-30"
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Delete"
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
