import { FileText } from "lucide-react";

import { Icon } from "@/components/icon";
import { Badge } from "@/components/site/ui";
import { getDictionary } from "@/lib/dictionary";
import { t } from "@/lib/i18n";
import { lines } from "@/lib/image";

import { sa, sb, sl, sx, type SectionProps } from "./shared";

/**
 * Terms, privacy policy and disclaimer all use this one block: a list of
 * titled cards plus an optional contact box that pulls the doctor's details
 * from Site settings.
 */
export function LegalCardsSection({ data, locale, settings }: SectionProps) {
  const dict = getDictionary(locale);
  const items = sa(data, "items");
  const contact = settings.contact ?? {};
  const doctor = settings.doctor ?? {};
  const chambers = settings.chambers ?? [];

  const phones = [contact.phone, contact.emergency_phone].filter(Boolean).join(", ");

  return (
    <main
      id={sx(data, "anchor") || undefined}
      className="flex flex-col bg-slate-50 pt-10 pb-20 text-slate-900"
    >
      <section className="px-4 py-12 text-center">
        <div className="max-container">
          <div className="mb-4">
            <Badge text={sl(data, "badge", locale)} />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-blue-dark md:text-4xl">
            {sl(data, "heading", locale)}
          </h1>
          {sl(data, "intro", locale) ? (
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              {sl(data, "intro", locale)}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl space-y-6 px-4 sm:px-6">
        {items.map((item, index) => {
          const bullets = lines(sl(item, "list", locale));
          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-light/30 hover:shadow-md md:p-8"
            >
              <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-light">
                  <Icon name={sx(item, "icon")} className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-blue-dark">{sl(item, "title", locale)}</h2>
              </div>

              {sl(item, "content", locale) ? (
                <p className="text-justify text-sm leading-relaxed text-slate-600 md:text-base">
                  {sl(item, "content", locale)}
                </p>
              ) : null}

              {bullets.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      <span className="text-sm text-slate-600 md:text-base">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}

        {sb(data, "show_contact", true) ? (
          <div className="relative mt-12 overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:p-10">
            <div className="relative z-10">
              <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-blue-dark">
                <FileText className="h-6 w-6 text-blue-light" aria-hidden />
                {sl(data, "contact_heading", locale)}
              </h2>
              {sl(data, "contact_intro", locale) ? (
                <p className="mb-6 text-sm text-slate-600 md:text-base">
                  {sl(data, "contact_intro", locale)}
                </p>
              ) : null}

              <div className="grid gap-8">
                <div>
                  <h3 className="mb-1 text-lg font-bold text-slate-800">{t(doctor.name, locale)}</h3>
                  <p className="mb-4 text-sm text-slate-600">{t(doctor.tagline, locale)}</p>
                  {phones ? (
                    <p className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-light uppercase">
                        {dict.phone}
                      </span>
                      <span dir="ltr">{phones}</span>
                    </p>
                  ) : null}
                </div>

                {chambers.length > 0 ? (
                  <div>
                    <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-bold text-blue-dark">
                      {dict.chambers}
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-700">
                      {chambers.map((chamber, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-light" />
                          {[t(chamber.name, locale), t(chamber.location, locale)]
                            .filter(Boolean)
                            .join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
