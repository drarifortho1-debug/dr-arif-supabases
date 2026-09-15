import { Activity, Briefcase, CheckCircle2, GraduationCap, HelpCircle, Quote } from "lucide-react";

import { Icon } from "@/components/icon";
import { Badge } from "@/components/site/ui";
import { getDictionary } from "@/lib/dictionary";
import { lines } from "@/lib/image";

import { sa, sl, slist, sx, type SectionProps } from "./shared";

/** The full "about the doctor" page body, ported from the original site. */
export function AboutProfileSection({ data, locale }: SectionProps) {
  const dict = getDictionary(locale);
  const stats = sa(data, "stats");
  const education = sa(data, "education");
  const profession = slist(data, "profession", locale);
  const specialties = sa(data, "specialties");
  const services = sa(data, "services");
  const faq = sa(data, "faq");
  const gratitude = sl(data, "gratitude_quote", locale);

  return (
    <div id={sx(data, "anchor") || undefined} className="flex flex-col bg-white text-slate-900 selection:bg-blue-100">
      {/* hero */}
      <section className="relative overflow-hidden border-b border-slate-100 py-24 md:py-32">
        <div className="max-container relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <Badge text={sl(data, "badge", locale)} />
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {sl(data, "name", locale)}{" "}
            {sl(data, "name_highlight", locale) ? (
              <span className="text-blue-light">{sl(data, "name_highlight", locale)}</span>
            ) : null}
          </h1>
          <div className="mx-auto max-w-2xl space-y-3 text-lg text-slate-600 md:text-xl">
            <p className="font-bold text-slate-800">{sl(data, "degrees", locale)}</p>
            <p>{sl(data, "university", locale)}</p>
            <p className="text-base">{sl(data, "position", locale)}</p>
            {sl(data, "specialty_tag", locale) ? (
              <div className="mt-4 inline-block rounded-full border border-blue-100 bg-blue-50/50 px-6 py-2 font-bold text-blue-light">
                {sl(data, "specialty_tag", locale)}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* stats */}
      {stats.length > 0 ? (
        <section className="relative z-20 -mt-8 bg-white py-12">
          <div className="max-container grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg md:p-8"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-light transition-colors duration-300 group-hover:bg-blue-light group-hover:text-white">
                  <Icon name={sx(stat, "icon")} className="h-6 w-6" />
                </div>
                <div className="mb-1 text-2xl font-black text-slate-800 md:text-3xl">{sl(stat, "value", locale)}</div>
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase md:text-xs">{sl(stat, "label", locale)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-5xl space-y-24 px-6 py-20">
        {/* bio */}
        {sl(data, "bio", locale) ? (
          <div>
            <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold text-slate-900">{sl(data, "bio_heading", locale)}</h2>
            <p className="text-lg leading-loose whitespace-pre-line text-slate-600">{sl(data, "bio", locale)}</p>
          </div>
        ) : null}

        {/* education & profession */}
        {education.length > 0 || profession.length > 0 ? (
          <div>
            <h2 className="mb-8 text-center text-3xl font-bold text-slate-900 md:text-left">{sl(data, "education_heading", locale)}</h2>
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              {education.length > 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 transition-shadow hover:shadow-md">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2.5 text-blue-light shadow-sm">
                      <GraduationCap size={18} aria-hidden />
                    </div>
                    <h3 className="text-xl font-bold text-blue-light">{dict.education}</h3>
                  </div>
                  <div className="space-y-5">
                    {education.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-light" />
                        <div>
                          <p className="font-bold text-blue-dark">{sl(item, "degree", locale)}</p>
                          <p className="mt-1 text-sm text-slate-500">{sl(item, "institution", locale)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {profession.length > 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 transition-shadow hover:shadow-md">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2.5 text-blue-light shadow-sm">
                      <Briefcase size={18} aria-hidden />
                    </div>
                    <h3 className="text-xl font-bold text-blue-light">{dict.profession}</h3>
                  </div>
                  <div className="space-y-4">
                    {profession.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 rounded-xl">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-light" aria-hidden />
                        <span className="font-medium text-blue-dark">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* specialties */}
        {specialties.length > 0 ? (
          <div>
            <div className="mb-10 text-center md:text-left">
              <h2 className="mb-4 text-3xl font-bold text-blue-dark">{sl(data, "specialties_heading", locale)}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {specialties.map((group, index) => (
                <div key={index} className="rounded-xl border border-slate-100 bg-white p-6">
                  <h3 className="mb-5 border-b border-slate-100 pb-3 text-lg font-bold text-blue-light">{sl(group, "category", locale)}</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {lines(sl(group, "tags", locale)).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="cursor-default rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* special services */}
        {services.length > 0 ? (
          <div>
            <h2 className="mb-4 text-center text-3xl font-bold text-slate-900 md:text-left">{sl(data, "services_heading", locale)}</h2>
            {sl(data, "services_intro", locale) ? (
              <p className="mb-8 max-w-3xl text-center leading-relaxed text-slate-600 md:text-left">{sl(data, "services_intro", locale)}</p>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2">
              {services.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-light transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Activity className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="mb-1 text-lg font-bold text-blue-dark">{sl(item, "name", locale)}</p>
                    <p className="text-sm leading-relaxed text-slate-500">{sl(item, "desc", locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* gratitude */}
        {gratitude ? (
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-light to-blue-800 p-8 text-white shadow-xl shadow-blue-900/10 md:p-10">
            <Quote className="absolute -right-6 -bottom-6 h-32 w-32 text-white/10" aria-hidden />
            <h3 className="mb-4 text-lg font-bold text-blue-100">{sl(data, "gratitude_title", locale)}</h3>
            <p className="relative z-10 text-lg leading-relaxed font-medium italic md:text-xl">&quot;{gratitude}&quot;</p>
          </div>
        ) : null}

        {/* faq */}
        {faq.length > 0 ? (
          <div>
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold text-slate-900">{sl(data, "faq_heading", locale)}</h2>
              <p className="text-slate-500">{sl(data, "faq_subtitle", locale)}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {faq.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all hover:border-blue-100 hover:bg-white">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="mt-0.5 h-6 w-6 shrink-0 text-blue-light" aria-hidden />
                    <div>
                      <p className="mb-2 font-bold text-slate-900">{sl(item, "q", locale)}</p>
                      <p className="text-sm leading-relaxed text-slate-600">{sl(item, "a", locale)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
