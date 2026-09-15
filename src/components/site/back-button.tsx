"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

export function BackButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const dict = getDictionary(locale);

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-light"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden />
      {dict.goBack}
    </button>
  );
}
