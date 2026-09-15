import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { AppointmentForm } from "@/components/site/forms/appointment-form";
import { ContactForm } from "@/components/site/forms/contact-form";
import { SectionHeader, SectionShell } from "@/components/site/ui";
import { getDictionary } from "@/lib/dictionary";
import { t } from "@/lib/i18n";
import { telHref } from "@/lib/image";

import { sa, sb, sl, sx, type SectionProps } from "./shared";

/* ------------------------------------------------------ appointment */

export function AppointmentFormSection({ data, locale }: SectionProps) {
  const departments = sa(data, "departments")
    .map((item) => sl(item, "name", locale))
    .filter(Boolean);

  return (
    <SectionShell background={sx(data, "background", "slate")} anchor={sx(data, "anchor")}>
      <SectionHeader
        badge={sl(data, "badge", locale)}
        heading={sl(data, "heading", locale)}
        subtitle={sl(data, "subtitle", locale)}
        align="center"
      />
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <AppointmentForm locale={locale} departments={departments} note={sl(data, "note", locale)} />
      </div>
    </SectionShell>
  );
}

/* ---------------------------------------------------------- contact */

export function ContactFormSection({ data, locale, settings }: SectionProps) {
  const dict = getDictionary(locale);
  const showDetails = sb(data, "show_details", true);
  const contact = settings.contact ?? {};
  const address = t(contact.address, locale);
  const hours = t(contact.hours, locale);

  const details = [
    contact.phone && { icon: Phone, label: dict.phone, value: contact.phone, href: telHref(contact.phone) },
    contact.email && { icon: Mail, label: dict.email, value: contact.email, href: `mailto:${contact.email}` },
    address && { icon: MapPin, label: "", value: address, href: undefined },
    hours && { icon: Clock, label: dict.openingHours, value: hours, href: undefined },
  ].filter(Boolean) as Array<{
    icon: typeof Phone;
    label: string;
    value: string;
    href?: string;
  }>;

  const hasDetails = showDetails && details.length > 0;

  return (
    <SectionShell background={sx(data, "background", "white")} anchor={sx(data, "anchor")}>
      <SectionHeader
        badge={sl(data, "badge", locale)}
        heading={sl(data, "heading", locale)}
        subtitle={sl(data, "subtitle", locale)}
        align="center"
      />

      <div className={`mt-2 grid gap-10 ${hasDetails ? "lg:grid-cols-2" : "mx-auto max-w-3xl"}`}>
        {hasDetails ? (
          <ul className="flex flex-col gap-5">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-light">
                  <detail.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5">
                  {detail.label ? (
                    <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      {detail.label}
                    </span>
                  ) : null}
                  {detail.href ? (
                    <a
                      href={detail.href}
                      dir="ltr"
                      className="text-base font-medium text-slate-800 hover:text-blue-light"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <span className="text-base leading-relaxed whitespace-pre-line text-slate-700">
                      {detail.value}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ContactForm locale={locale} />
        </div>
      </div>
    </SectionShell>
  );
}
