/**
 * Bilingual helpers.
 *
 * Every piece of editable text in the CMS is stored as a JSONB object keyed by
 * locale, e.g. `{ "bn": "আমাদের সম্পর্কে", "en": "About us" }`. `t()` reads one
 * locale out of such an object and falls back to the other locale when the
 * editor has not filled it in yet, so a half-translated site still renders.
 *
 * URL scheme: the default locale (Bangla) is served WITHOUT a prefix so the
 * original drarifortho.com links keep working (`/about-us`), while English
 * lives under `/en/...`. `proxy.ts` rewrites the unprefixed URLs to the
 * internal `/bn/...` route.
 */

export const LOCALES = ["bn", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = isLocale(process.env.NEXT_PUBLIC_DEFAULT_LOCALE)
  ? process.env.NEXT_PUBLIC_DEFAULT_LOCALE
  : "bn";

export const LOCALE_LABELS: Record<Locale, string> = {
  bn: "বাংলা",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  bn: "BN",
  en: "EN",
};

/** Value used for the <html lang> attribute and Intl formatting. */
export const LOCALE_TAG: Record<Locale, string> = {
  bn: "bn-BD",
  en: "en-US",
};

/** A translatable string as stored in the database. */
export type Localized = Partial<Record<Locale, string>> | null | undefined;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "bn" ? "en" : "bn";
}

/** Read `locale` out of a localized value, falling back to any filled locale. */
export function t(value: Localized, locale: Locale, fallback = ""): string {
  if (!value || typeof value !== "object") return fallback;

  const preferred = value[locale];
  if (typeof preferred === "string" && preferred.trim() !== "") return preferred;

  for (const candidate of LOCALES) {
    const alt = value[candidate];
    if (typeof alt === "string" && alt.trim() !== "") return alt;
  }

  return fallback;
}

/** True when at least one locale has content. */
export function hasText(value: Localized): boolean {
  return t(value, DEFAULT_LOCALE).trim() !== "";
}

/** Build an empty localized object, used as a form default. */
export function emptyLocalized(): Record<Locale, string> {
  return LOCALES.reduce(
    (acc, locale) => ({ ...acc, [locale]: "" }),
    {} as Record<Locale, string>,
  );
}

function isExternalHref(path: string): boolean {
  return (
    /^(https?:)?\/\//.test(path) ||
    path.startsWith("#") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  );
}

/**
 * Prefix an internal path with the active locale.
 * Default locale: `/about-us` stays `/about-us`. Other locales: `/en/about-us`.
 */
export function localePath(locale: Locale, path = "/"): string {
  if (isExternalHref(path)) return path;

  const clean = path.startsWith("/") ? path : `/${path}`;
  const unprefixed = stripLocale(clean);

  if (locale === DEFAULT_LOCALE) return unprefixed;
  return unprefixed === "/" ? `/${locale}` : `/${locale}${unprefixed}`;
}

/** Strip a leading locale segment from a pathname (`/en/about` -> `/about`). */
export function stripLocale(pathname: string): string {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (isLocale(maybeLocale)) {
    const remainder = rest.join("/");
    return remainder ? `/${remainder}` : "/";
  }
  return pathname || "/";
}

/** Which locale a browser pathname belongs to. */
export function localeFromPathname(pathname: string): Locale {
  const [, maybeLocale] = pathname.split("/");
  return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}
