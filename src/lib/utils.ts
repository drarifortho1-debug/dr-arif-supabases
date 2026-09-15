import { LOCALE_TAG, type Locale } from "@/lib/i18n";

/** Tiny className joiner (keeps us free of a runtime dependency). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * URL-safe slug. Bangla titles produce no ASCII characters, so when the result
 * would be empty we keep the original letters (Postgres and browsers both
 * handle percent-encoded unicode paths fine) and only sanitise separators.
 */
export function slugify(input: string): string {
  const trimmed = (input ?? "").trim().toLowerCase();
  if (!trimmed) return "";

  const ascii = trimmed
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii;

  return trimmed
    .replace(/[\s/\\?#%&=+.,:;'"!()[\]{}]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BANGLA_DIGITS[Number(d)]);
}

export function formatDate(
  value: string | Date | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale: Locale = "en",
): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Extract the video id from any common YouTube URL shape. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /[?&]v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

/** Rough reading time in minutes from an HTML string. */
export function readingTime(html: string): number {
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function excerptFromHtml(html: string, length = 160): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

/** Build a Google Maps embed src from a plain place query or a pasted URL. */
export function mapEmbedSrc(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  if (raw.includes("google.com/maps/embed")) {
    const srcMatch = raw.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : raw;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(raw)}&output=embed`;
}

export function isExternalUrl(url: string): boolean {
  return /^(https?:)?\/\//.test(url) || url.startsWith("mailto:") || url.startsWith("tel:");
}

/** Uniform "unexpected failure" text for server actions. */
export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
