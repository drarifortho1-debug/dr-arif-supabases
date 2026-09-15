import { AlertTriangle, Check, ChevronDown, Stethoscope, X } from "lucide-react";

import { SafeImage } from "@/components/site/ui";
import type { SiteSettingsRow, TreatmentRow } from "@/lib/cms/database.types";
import { getDictionary } from "@/lib/dictionary";
import { t, type Locale } from "@/lib/i18n";
import { cells } from "@/lib/image";

/** Rows are stored as "cell | cell | cell" strings, as in the admin form. */
function tableRows(rows: TreatmentRow["table_rows"], locale: Locale): string[][] {
  return rows
    .map((row) => t(row.text as Record<string, string>, locale))
    .filter(Boolean)
    .map((row) => cells(row));
}

function textList(items: TreatmentRow["dos"], locale: Locale): string[] {
  return items.map((item) => t(item.text as Record<string, string>, locale)).filter(Boolean);
}

export function TreatmentDetail({
  treatment,
  locale,
}: {
  treatment: TreatmentRow;
  locale: Locale;
  settings: SiteSettingsRow;
}) {
  const dict = getDictionary(locale);

  const title = t(treatment.title, locale);
  const causes = treatment.causes;
  const treatmentOptions = treatment.treatments;
  const faq = treatment.faq;
  const headers = treatment.table_headers
    .map((header) => t(header.text as Record<string, string>, locale))
    .filter(Boolean);
  const rows = tableRows(treatment.table_rows, locale);
  const dos = textList(treatment.dos, locale);
  const donts = textList(treatment.donts, locale);

  return (
    <div className="flex min-h-screen animate-fade-up flex-col bg-white">
      {treatment.hero_image ? (
        <section className="pt-8">
          <div className="max-container">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
              <SafeImage
                src={treatment.hero_image}
                width={1920}
                height={800}
                alt={t(treatment.hero_image_alt, locale) || title}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-b border-slate-100 py-12 md:py-16">
        <div className="max-container">
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-blue-dark md:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {t(treatment.subtitle, locale)}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-container space-y-12">
          {causes.length > 0 ? (
            <div>
              <h2 className="mb-6 text-xl font-bold text-blue-dark md:text-2xl">{dict.causes}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {causes.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-blue-light/20 hover:shadow-sm"
                  >
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-light/10 text-xs font-bold text-blue-light">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-blue-dark">
                        {t(item.title as Record<string, string>, locale)}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {t(item.description as Record<string, string>, locale)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {treatmentOptions.length > 0 ? (
            <div>
              <h2 className="mb-6 text-xl font-bold text-blue-dark md:text-2xl">
                {dict.treatmentTypes}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {treatmentOptions.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-blue-light/20 hover:shadow-sm"
                  >
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-light/10 text-xs font-bold text-blue-light">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-blue-dark">
                        {t(item.name as Record<string, string>, locale)}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {t(item.description as Record<string, string>, locale)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {headers.length > 0 && rows.length > 0 ? (
            <div>
              <h2 className="mb-6 text-xl font-bold text-blue-dark md:text-2xl">
                {t(treatment.table_title, locale)}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[500px] text-sm md:text-base">
                  <thead>
                    <tr className="bg-blue-dark">
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-bold tracking-wider text-white uppercase"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`border-b border-slate-100 last:border-0 ${
                          rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-slate-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {dos.length > 0 || donts.length > 0 ? (
            <div>
              <h2 className="mb-6 text-xl font-bold text-blue-dark md:text-2xl">
                {dict.adviceGuidance}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-green-200 bg-green-50/50 p-5 md:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" aria-hidden />
                    <h4 className="text-base font-bold text-green-800">{dict.dos}</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {dos.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-green-800 md:text-base">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 md:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <X className="h-5 w-5 text-red-600" aria-hidden />
                    <h4 className="text-base font-bold text-red-800">{dict.donts}</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {donts.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-red-800 md:text-base">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {t(treatment.symptoms, locale) ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-amber-800 md:text-xl">{dict.symptoms}</h3>
              </div>
              <p className="text-sm leading-relaxed text-amber-900/80 md:text-base">
                {t(treatment.symptoms, locale)}
              </p>
            </div>
          ) : null}

          {t(treatment.doctor_advice, locale) ? (
            <div className="rounded-2xl border border-blue-light/20 bg-blue-light/5 p-6 md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-light/10">
                  <Stethoscope className="h-5 w-5 text-blue-light" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-blue-dark md:text-xl">{dict.whenToSeeDoctor}</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                {t(treatment.doctor_advice, locale)}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {faq.length > 0 ? (
        <section className="py-16 md:py-20">
          <div className="max-container">
            <h2 className="mb-8 text-2xl font-bold text-blue-dark md:text-3xl">{dict.faqTitle}</h2>
            <div className="space-y-3">
              {faq.map((item, index) => (
                <details key={index} className="group overflow-hidden rounded-xl border border-slate-100">
                  <summary className="flex w-full cursor-pointer list-none items-center justify-between bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100/60 md:p-5 [&::-webkit-details-marker]:hidden">
                    <span className="pr-4 text-sm font-bold text-blue-dark md:text-base">
                      {t(item.question as Record<string, string>, locale)}
                    </span>
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="bg-white p-4 text-sm leading-relaxed text-slate-700 md:p-5 md:text-base">
                    {t(item.answer as Record<string, string>, locale)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
