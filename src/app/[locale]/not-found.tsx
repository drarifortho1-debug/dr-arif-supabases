import Link from "next/link";

import { getDictionary } from "@/lib/dictionary";
import { DEFAULT_LOCALE, localePath } from "@/lib/i18n";

/**
 * The not-found boundary sits under `[locale]`, but Next renders it without
 * `params`, so it uses the default locale's copy.
 */
export default function NotFound() {
  const dict = getDictionary(DEFAULT_LOCALE);

  return (
    <div className="max-container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="text-7xl font-bold text-blue-light/30">404</span>
      <h1 className="text-2xl font-bold text-blue-dark sm:text-3xl">{dict.notFoundTitle}</h1>
      <p className="max-w-md text-slate-600">{dict.notFoundText}</p>
      <Link
        href={localePath(DEFAULT_LOCALE, "/")}
        className="primary-btn mt-2"
      >
        {dict.backHome}
      </Link>
    </div>
  );
}
