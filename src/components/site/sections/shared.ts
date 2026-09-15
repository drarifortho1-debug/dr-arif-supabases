import type { Json, SiteSettingsRow } from "@/lib/cms/database.types";
import { t, type Locale, type Localized } from "@/lib/i18n";

export type SectionData = Record<string, Json | undefined>;

export interface SectionProps {
  data: SectionData;
  locale: Locale;
  settings: SiteSettingsRow;
  /** Stable id of the section row, used for scoped CSS. */
  sectionId: string;
}

/** Read a plain (non-localized) string field. */
export function sx(data: SectionData, key: string, fallback = ""): string {
  const value = data?.[key];
  return typeof value === "string" ? value : fallback;
}

/** Read a localized string field. */
export function sl(data: SectionData, key: string, locale: Locale, fallback = ""): string {
  return t(data?.[key] as Localized, locale, fallback);
}

/** Read a repeater field. */
export function sa(data: SectionData, key: string): SectionData[] {
  const value = data?.[key];
  return Array.isArray(value) ? (value as SectionData[]) : [];
}

export function sb(data: SectionData, key: string, fallback = false): boolean {
  const value = data?.[key];
  return typeof value === "boolean" ? value : fallback;
}

export function sn(data: SectionData, key: string, fallback = 0): number {
  const value = data?.[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return fallback;
}

/** Repeater of `{ text }` rows -> array of strings for the current locale. */
export function slist(data: SectionData, key: string, locale: Locale, field = "text"): string[] {
  return sa(data, key)
    .map((item) => sl(item, field, locale))
    .filter(Boolean);
}

const COLUMN_CLASSES: Record<string, string> = {
  "1": "mx-auto max-w-4xl",
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export function columnClass(value: string | undefined, fallback = "3"): string {
  return COLUMN_CLASSES[value ?? fallback] ?? COLUMN_CLASSES[fallback];
}
