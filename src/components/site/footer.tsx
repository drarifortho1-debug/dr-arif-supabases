import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { SOCIAL_ICONS, SOCIAL_LABELS, type SocialKey } from "@/components/social-icons";
import { buildNav } from "@/components/site/nav";
import { SafeImage } from "@/components/site/ui";
import type { SiteSettingsRow } from "@/lib/cms/database.types";
import { getMenu } from "@/lib/cms/queries";
import { getDictionary } from "@/lib/dictionary";
import { localePath, t, type Locale } from "@/lib/i18n";
import { telHref } from "@/lib/image";
import { toBanglaDigits } from "@/lib/utils";

/** Split a long name over two lines, as the original footer does. */
function splitName(name: string): [string, string] {
  const parts = name.split(" ");
  if (parts.length < 2) return [name, ""];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}

export async function SiteFooter({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettingsRow;
}) {
  const dict = getDictionary(locale);

  const [quickMenu, legalMenu] = await Promise.all([getMenu("footer"), getMenu("footer_legal")]);
  const [quickLinks, legalLinks] = await Promise.all([
    buildNav(quickMenu, locale),
    buildNav(legalMenu, locale),
  ]);

  const doctor = settings.doctor ?? {};
  const socials = settings.socials ?? {};
  const chambers = settings.chambers ?? [];

  const siteName = t(settings.site_name, locale, "Doctor");
  const doctorName = t(doctor.name, locale) || siteName;
  const [nameLine1, nameLine2] = splitName(doctorName);

  const year = new Date().getFullYear();
  const displayYear = locale === "bn" ? toBanglaDigits(year) : String(year);
  const copyright =
    t(settings.footer?.copyright, locale) ||
    `© ${displayYear} ${siteName}. ${dict.allRightsReserved}.`;

  const socialEntries = (Object.keys(SOCIAL_ICONS) as SocialKey[])
    .map((key) => ({ key, href: socials[key] }))
    .filter((entry): entry is { key: SocialKey; href: string } => Boolean(entry.href));

  return (
    <footer className="mt-auto w-full bg-primary-dark text-white/60">
      <div className="max-container pt-20 pb-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* identity */}
          <div className="space-y-4 text-left md:col-span-4">
            {settings.logo_url ? (
              <SafeImage
                src={settings.logo_url}
                width={120}
                height={61}
                alt={siteName}
                className="h-auto w-30 brightness-0 invert"
              />
            ) : null}

            <h3 className="text-3xl font-bold tracking-tight text-white">
              {nameLine1}
              {nameLine2 ? (
                <>
                  <br />
                  {nameLine2}
                </>
              ) : null}
            </h3>

            {t(doctor.tagline, locale) ? (
              <p className="text-sm font-bold tracking-widest text-blue-light uppercase">
                {t(doctor.tagline, locale)}
              </p>
            ) : null}

            <div className="space-y-1 leading-relaxed text-white/50">
              {t(doctor.degrees, locale) ? (
                <p className="font-semibold text-white/70">{t(doctor.degrees, locale)}</p>
              ) : null}
              {t(doctor.university, locale) ? <p>{t(doctor.university, locale)}</p> : null}
              {t(doctor.position, locale) ? <p>{t(doctor.position, locale)}</p> : null}
            </div>

            {socialEntries.length > 0 ? (
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {socialEntries.map(({ key, href }) => {
                  const IconComponent = SOCIAL_ICONS[key];
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-semibold text-white/50 transition-colors hover:text-white"
                    >
                      <IconComponent className="h-4 w-4" />
                      {SOCIAL_LABELS[key]}
                      <ArrowUpRight size={14} aria-hidden />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* links */}
          <div className="text-left md:col-span-3 md:pl-8">
            {quickLinks.length > 0 ? (
              <>
                <h4 className="mb-6 text-xs font-bold tracking-widest text-white uppercase">
                  {dict.quickLinks}
                </h4>
                <ul className="space-y-3.5">
                  {quickLinks.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="block text-sm font-medium text-white/50 transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {legalLinks.length > 0 ? (
              <>
                <h4 className="mt-8 mb-6 text-xs font-bold tracking-widest text-white uppercase">
                  {dict.legalTitle}
                </h4>
                <ul className="space-y-3.5">
                  {legalLinks.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="block text-sm font-medium text-white/50 transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          {/* chambers */}
          <div className="text-left md:col-span-5">
            {chambers.length > 0 ? (
              <>
                <h4 className="mb-6 text-xs font-bold tracking-widest text-white uppercase">
                  {dict.chambers}
                </h4>
                <div className="space-y-5">
                  {chambers.map((chamber, index) => (
                    <div
                      key={index}
                      className="space-y-0.5 border-l border-white/10 pl-3 font-medium text-white/50"
                    >
                      <h5 className="font-semibold text-white">{t(chamber.name, locale)}</h5>
                      <p className="w-8/12">{t(chamber.location, locale)}</p>
                      <p className="font-semibold text-blue-light">{t(chamber.schedule, locale)}</p>
                      {chamber.phone ? (
                        <a
                          href={telHref(chamber.phone)}
                          dir="ltr"
                          className="block font-bold text-white/70 hover:text-white"
                        >
                          {chamber.phone}
                        </a>
                      ) : null}
                      {chamber.phone2 ? (
                        <a
                          href={telHref(chamber.phone2)}
                          dir="ltr"
                          className="block font-bold text-white/70 hover:text-white"
                        >
                          {chamber.phone2}
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs font-medium text-white/50">{copyright}</p>
          <Link
            href={localePath(locale, "/")}
            className="text-xs font-medium text-white/40 transition-colors hover:text-white/70"
          >
            {siteName}
          </Link>
        </div>
      </div>
    </footer>
  );
}
