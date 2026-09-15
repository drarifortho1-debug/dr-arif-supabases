"use client";

import { Archive, Check, LoaderCircle, Mail, Phone, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { EmptyState, StatusBadge } from "@/components/admin/ui";
import { deleteInboxItem, setInboxStatus, type InboxTable } from "@/lib/actions/inbox";
import type { InboxStatus } from "@/lib/cms/database.types";
import { cn, formatDateTime } from "@/lib/utils";

export interface InboxEntry {
  id: string;
  status: InboxStatus;
  created_at: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  /** Short labelled facts shown under the name (date, department, subject…). */
  meta: Array<{ label: string; value: string }>;
  message?: string | null;
}

export function InboxList({ table, entries }: { table: InboxTable; entries: InboxEntry[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(id: string, task: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(id);
    setError(null);
    const result = await task();
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  function toggle(entry: InboxEntry) {
    const next = openId === entry.id ? null : entry.id;
    setOpenId(next);
    // Opening a new entry marks it as read.
    if (next && entry.status === "new") {
      void run(entry.id, () => setInboxStatus(table, entry.id, "read"));
    }
  }

  if (entries.length === 0) {
    return <EmptyState title="Nothing here" description="New submissions from the website will appear in this list." />;
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {error}
        </p>
      ) : null}

      {entries.map((entry) => {
        const open = openId === entry.id;
        return (
          <article
            key={entry.id}
            className={cn(
              "rounded-xl border bg-white transition-colors",
              entry.status === "new" ? "border-brand-300" : "border-ink-200",
            )}
          >
            <button
              type="button"
              onClick={() => toggle(entry)}
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-left"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm text-ink-900",
                      entry.status === "new" ? "font-semibold" : "font-medium",
                    )}
                  >
                    {entry.name}
                  </span>
                  <StatusBadge status={entry.status} />
                </span>
                <span className="flex flex-wrap gap-x-3 text-xs text-ink-500">
                  {entry.meta.map((item) => (
                    <span key={item.label}>
                      <span className="text-ink-400">{item.label}:</span> {item.value}
                    </span>
                  ))}
                </span>
              </span>
              <span className="text-xs text-ink-400">{formatDateTime(entry.created_at)}</span>
            </button>

            {open ? (
              <div className="border-t border-ink-100 px-4 py-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  {entry.phone ? (
                    <a
                      href={`tel:${entry.phone.replace(/\s+/g, "")}`}
                      dir="ltr"
                      className="inline-flex items-center gap-1.5 text-brand-700 hover:underline"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                      {entry.phone}
                    </a>
                  ) : null}
                  {entry.email ? (
                    <a
                      href={`mailto:${entry.email}`}
                      className="inline-flex items-center gap-1.5 text-brand-700 hover:underline"
                    >
                      <Mail className="h-4 w-4" aria-hidden />
                      {entry.email}
                    </a>
                  ) : null}
                </div>

                {entry.message ? (
                  <p className="mt-3 whitespace-pre-line rounded-lg bg-ink-50 p-3 text-sm leading-relaxed text-ink-700">
                    {entry.message}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.status !== "read" ? (
                    <ActionChip
                      busy={busy === entry.id}
                      onClick={() => run(entry.id, () => setInboxStatus(table, entry.id, "read"))}
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden /> Mark as read
                    </ActionChip>
                  ) : null}
                  {entry.status !== "archived" ? (
                    <ActionChip
                      busy={busy === entry.id}
                      onClick={() =>
                        run(entry.id, () => setInboxStatus(table, entry.id, "archived"))
                      }
                    >
                      <Archive className="h-3.5 w-3.5" aria-hidden /> Archive
                    </ActionChip>
                  ) : (
                    <ActionChip
                      busy={busy === entry.id}
                      onClick={() => run(entry.id, () => setInboxStatus(table, entry.id, "new"))}
                    >
                      Move back to new
                    </ActionChip>
                  )}
                  <ActionChip
                    danger
                    busy={busy === entry.id}
                    onClick={() => {
                      if (window.confirm("Delete this submission permanently?")) {
                        void run(entry.id, () => deleteInboxItem(table, entry.id));
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                  </ActionChip>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function ActionChip({
  busy,
  danger,
  onClick,
  children,
}: {
  busy: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors disabled:opacity-50",
        danger
          ? "border-ink-200 text-ink-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          : "border-ink-200 text-ink-700 hover:bg-ink-50",
      )}
    >
      {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
