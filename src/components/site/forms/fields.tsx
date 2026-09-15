"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-ink-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
        {hint ? <span className="ml-1 text-xs font-normal text-ink-400">({hint})</span> : null}
      </span>
      {children}
    </label>
  );
}

/** Hidden input that traps naive spam bots. */
export function Honeypot() {
  return (
    <div className="hidden" aria-hidden>
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormMessage({
  status,
  message,
}: {
  status: "idle" | "success" | "error";
  message: string;
}) {
  if (status === "idle" || !message) return null;

  return (
    <p
      role="status"
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        status === "success"
          ? "bg-brand-50 text-brand-800"
          : "bg-red-50 text-red-700",
      )}
    >
      {message}
    </p>
  );
}
