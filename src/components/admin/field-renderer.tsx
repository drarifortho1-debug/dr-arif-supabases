"use client";

import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Icon } from "@/components/icon";
import { ImagePicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button, Input, Label, Select, Textarea, fieldClass } from "@/components/admin/ui";
import { ICON_OPTIONS, emptyRepeaterItem, type FieldDef } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type AnyRecord = Record<string, unknown>;

/* --------------------------------------------------------------- helpers */

function localizedValue(value: unknown, locale: Locale): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const text = (value as AnyRecord)[locale];
    return typeof text === "string" ? text : "";
  }
  return "";
}

function setLocalized(value: unknown, locale: Locale, text: string): AnyRecord {
  const base = value && typeof value === "object" && !Array.isArray(value) ? { ...(value as AnyRecord) } : {};
  base[locale] = text;
  return base;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asArray(value: unknown): AnyRecord[] {
  return Array.isArray(value) ? (value as AnyRecord[]) : [];
}

/** Row title for a repeater entry. */
function itemTitle(field: FieldDef, item: AnyRecord, locale: Locale, index: number): string {
  const key = field.itemLabel;
  if (key) {
    const raw = item[key];
    const text = typeof raw === "string" ? raw : localizedValue(raw, locale);
    if (text.trim()) return text.length > 60 ? `${text.slice(0, 60)}…` : text;
  }
  return `Item ${index + 1}`;
}

/* -------------------------------------------------------------- renderer */

export function FieldRenderer({
  field,
  value,
  onChange,
  locale,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (next: unknown) => void;
  locale: Locale;
}) {
  if (field.type === "repeater") {
    return <RepeaterField field={field} value={value} onChange={onChange} locale={locale} />;
  }

  return (
    <div className={cn("flex flex-col gap-1.5", field.wide && "sm:col-span-2")}>
      <Label hint={field.localized ? locale.toUpperCase() : undefined}>{field.label}</Label>
      <FieldControl field={field} value={value} onChange={onChange} locale={locale} />
      {field.help ? <p className="text-xs text-ink-400">{field.help}</p> : null}
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  locale,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (next: unknown) => void;
  locale: Locale;
}) {
  switch (field.type) {
    case "textarea":
      return field.localized ? (
        <Textarea
          rows={3}
          value={localizedValue(value, locale)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(setLocalized(value, locale, event.target.value))}
        />
      ) : (
        <Textarea
          rows={3}
          value={asString(value)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "code":
      return (
        <Textarea
          rows={10}
          spellCheck={false}
          value={asString(value)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="font-mono text-xs leading-relaxed"
        />
      );

    case "richtext":
      return (
        <RichTextEditor
          key={`${field.name}-${locale}`}
          value={field.localized ? localizedValue(value, locale) : asString(value)}
          onChange={(html) =>
            onChange(field.localized ? setLocalized(value, locale, html) : html)
          }
        />
      );

    case "image":
      return <ImagePicker value={asString(value)} onChange={onChange} label={field.label} />;

    case "number":
      return (
        <Input
          type="number"
          min={field.min}
          max={field.max}
          value={typeof value === "number" ? value : ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? null : Number(event.target.value))
          }
        />
      );

    case "boolean":
      return (
        <Toggle checked={value === true} onChange={(checked) => onChange(checked)} />
      );

    case "select":
      return (
        <Select value={asString(value)} onChange={(event) => onChange(event.target.value)}>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );

    case "icon":
      return <IconPicker value={asString(value)} onChange={onChange} />;

    case "url":
      return (
        <Input
          type="text"
          value={asString(value)}
          placeholder={field.placeholder ?? "/contact or https://…"}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    default:
      return field.localized ? (
        <Input
          value={localizedValue(value, locale)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(setLocalized(value, locale, event.target.value))}
        />
      ) : (
        <Input
          value={asString(value)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

/* ---------------------------------------------------------------- toggle */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
        checked ? "bg-brand-600" : "bg-ink-300",
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

/* ----------------------------------------------------------- icon picker */

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className={cn(fieldClass, "flex items-center gap-2 text-left")}
      >
        <Icon name={value} className="h-5 w-5 text-brand-600" />
        <span className="flex-1 truncate">{value || "Choose an icon"}</span>
        <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-1 grid max-h-64 w-full grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-ink-200 bg-white p-2 shadow-lg">
            {ICON_OPTIONS.map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-md transition-colors hover:bg-brand-50",
                  value === name ? "bg-brand-600 text-white hover:bg-brand-600" : "text-ink-600",
                )}
              >
                <Icon name={name} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------- repeater */

function RepeaterField({
  field,
  value,
  onChange,
  locale,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (next: unknown) => void;
  locale: Locale;
}) {
  const items = asArray(value);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const subFields = field.fields ?? [];

  const update = (next: AnyRecord[]) => onChange(next);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    update(next);
    setOpenIndex(to);
  };

  return (
    <div className={cn("flex flex-col gap-2", field.wide && "sm:col-span-2")}>
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <span className="text-xs text-ink-400">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          const expanded = openIndex === index;
          return (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-ink-200 bg-white"
            >
              <div className="flex items-center gap-1 bg-ink-50 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex(expanded ? null : index)}
                  className="flex flex-1 items-center gap-2 text-left text-sm font-medium text-ink-800"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-ink-200 text-[11px] font-semibold text-ink-600">
                    {index + 1}
                  </span>
                  <span className="truncate">{itemTitle(field, item, locale, index)}</span>
                </button>

                <IconAction
                  label="Move up"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden />
                </IconAction>
                <IconAction
                  label="Move down"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                >
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </IconAction>
                <IconAction
                  label="Duplicate"
                  onClick={() => {
                    const next = [...items];
                    next.splice(index + 1, 0, JSON.parse(JSON.stringify(item)));
                    update(next);
                  }}
                >
                  <Copy className="h-4 w-4" aria-hidden />
                </IconAction>
                <IconAction
                  label="Delete"
                  danger
                  onClick={() => {
                    update(items.filter((_, i) => i !== index));
                    setOpenIndex(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </IconAction>
              </div>

              {expanded ? (
                <div className="grid gap-4 border-t border-ink-100 p-4 sm:grid-cols-2">
                  {subFields.map((subField) => (
                    <FieldRenderer
                      key={subField.name}
                      field={subField}
                      value={item[subField.name]}
                      locale={locale}
                      onChange={(next) => {
                        const updated = [...items];
                        updated[index] = { ...item, [subField.name]: next };
                        update(updated);
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-fit"
        onClick={() => {
          const next = [...items, emptyRepeaterItem(subFields)];
          update(next);
          setOpenIndex(next.length - 1);
        }}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {field.addLabel ?? "Add item"}
      </Button>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30",
        danger
          ? "text-ink-400 hover:bg-red-50 hover:text-red-600"
          : "text-ink-400 hover:bg-white hover:text-ink-700",
      )}
    >
      {children}
    </button>
  );
}
