/**
 * `next/image` only optimises hosts listed in next.config.ts. Images from
 * anywhere else (an old imgbb link an editor pasted, for example) are rendered
 * unoptimised instead of crashing the page.
 */
export function isOptimizableImage(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;

  try {
    const url = new URL(src);
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
    return url.hostname === supabase;
  } catch {
    return false;
  }
}

/** Extract the id from any common YouTube URL shape (or accept a bare id). */
export function getYouTubeId(url: string | null | undefined): string {
  if (!url) return "";
  const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/);
  if (match && match[2].length === 11) return match[2];
  const trimmed = url.trim();
  return /^[A-Za-z0-9_-]{11}$/.test(trimmed) ? trimmed : "";
}

/** Split a textarea into non-empty trimmed lines. */
export function lines(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Split "a | b | c" into cells. */
export function cells(value: string | null | undefined): string[] {
  return (value ?? "").split("|").map((cell) => cell.trim());
}

/** Digits-only phone for tel: links. */
export function telHref(phone: string | null | undefined): string {
  return `tel:${(phone ?? "").replace(/[^0-9+]/g, "")}`;
}
