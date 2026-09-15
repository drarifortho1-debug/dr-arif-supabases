"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { Icon } from "@/components/icon";
import { SECTION_DEFS, SECTION_GROUPS } from "@/lib/cms/sections";

/** Catalogue of section types, grouped by purpose. */
export function AddSectionDialog({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/50"
      />

      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Add a section</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Pick a block to append to the page. You can reorder it afterwards.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {SECTION_GROUPS.map((group) => {
            const defs = SECTION_DEFS.filter((def) => def.group === group);
            if (defs.length === 0) return null;

            return (
              <section key={group} className="mb-6 last:mb-0">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  {group}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {defs.map((def) => (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => {
                        onPick(def.type);
                        onClose();
                      }}
                      className="flex items-start gap-3 rounded-xl border border-ink-200 p-3 text-left transition-all hover:border-brand-400 hover:bg-brand-50/40"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon name={def.icon} className="h-4.5 w-4.5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">
                          {def.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                          {def.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
