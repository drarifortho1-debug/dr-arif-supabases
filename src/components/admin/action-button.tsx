"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { buttonClass } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/actions/types";
import { cn } from "@/lib/utils";

/**
 * Runs a bound Server Action (e.g. `deletePage.bind(null, id)`) with an
 * optional confirmation prompt, and surfaces the error it returns.
 */
export function ActionButton({
  action,
  confirm,
  children,
  variant = "secondary",
  size = "sm",
  className,
  title,
  redirectTo,
  onDone,
}: {
  action: () => Promise<ActionResult<unknown>>;
  confirm?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  className?: string;
  title?: string;
  redirectTo?: string;
  onDone?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run() {
    if (confirm && !window.confirm(confirm)) return;
    setError(null);

    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone?.();
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  return (
    <span className="relative inline-flex flex-col items-end">
      <button
        type="button"
        title={title}
        onClick={run}
        disabled={pending}
        className={cn(buttonClass(variant, size), className)}
      >
        {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
        {children}
      </button>
      {error ? (
        <span className="absolute right-0 top-full z-10 mt-1 w-max max-w-xs rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white shadow-lg">
          {error}
        </span>
      ) : null}
    </span>
  );
}
