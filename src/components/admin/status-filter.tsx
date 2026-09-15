import Link from "next/link";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

/** Status tabs for the inbox pages; the filter lives in the URL. */
export function StatusFilter({ basePath, current }: { basePath: string; current: string }) {
  return (
    <div className="mb-4 flex gap-1 rounded-lg bg-ink-100 p-1 w-fit">
      {OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={option.value ? `${basePath}?status=${option.value}` : basePath}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            current === option.value ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800",
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
