import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ inputs */

export const fieldClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-400";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cn(fieldClass, props.className)} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(fieldClass, "leading-relaxed", props.className)} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cn(fieldClass, "pr-8", props.className)} />;
}

export function Label({
  children,
  hint,
  required,
  htmlFor,
  className,
}: {
  children: ReactNode;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-ink-700", className)}>
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
      {hint ? <span className="ml-1 text-xs font-normal text-ink-400">{hint}</span> : null}
    </label>
  );
}

export function FormRow({
  label,
  hint,
  help,
  required,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  help?: string;
  required?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <Label hint={hint} required={required}>
        {label}
      </Label>
      {children}
      {help ? <p className="text-xs text-ink-400">{help}</p> : null}
    </div>
  );
}

/* ----------------------------------------------------------------- buttons */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
  secondary:
    "border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50 disabled:text-ink-300",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button {...props} className={cn(buttonClass(variant, size), className)} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  target,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  target?: string;
}) {
  if (target === "_blank") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonClass(variant, size), className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(buttonClass(variant, size), className)}>
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------------- surfaces */

export function Panel({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border border-ink-200 bg-white", className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div>
            {title ? <h2 className="text-sm font-semibold text-ink-900">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-xs text-ink-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-ink-50/60 px-6 py-14 text-center">
      <h3 className="text-sm font-semibold text-ink-700">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-ink-500">{description}</p> : null}
      {action}
    </div>
  );
}

/* ----------------------------------------------------------------- badges */

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-brand-50 text-brand-700 ring-brand-200",
    draft: "bg-amber-50 text-amber-700 ring-amber-200",
    new: "bg-blue-50 text-blue-700 ring-blue-200",
    read: "bg-ink-100 text-ink-600 ring-ink-200",
    archived: "bg-ink-100 text-ink-500 ring-ink-200",
    admin: "bg-purple-50 text-purple-700 ring-purple-200",
    editor: "bg-ink-100 text-ink-600 ring-ink-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        styles[status] ?? "bg-ink-100 text-ink-600 ring-ink-200",
      )}
    >
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ table */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-ink-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-ink-100 px-4 py-3 align-middle text-ink-700", className)}>
      {children}
    </td>
  );
}

/* ----------------------------------------------------------------- alerts */

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error" | "warning";
  children: ReactNode;
}) {
  const tones = {
    info: "bg-blue-50 text-blue-800 ring-blue-200",
    success: "bg-brand-50 text-brand-800 ring-brand-200",
    error: "bg-red-50 text-red-800 ring-red-200",
    warning: "bg-amber-50 text-amber-800 ring-amber-200",
  } as const;

  return (
    <div className={cn("rounded-lg px-4 py-3 text-sm ring-1 ring-inset", tones[tone])}>
      {children}
    </div>
  );
}
