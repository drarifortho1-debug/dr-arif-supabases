import { Navbar } from "@/components/site/navbar";
import { buildNav } from "@/components/site/nav";
import type { SiteSettingsRow } from "@/lib/cms/database.types";
import { enabledLocales, getMenu } from "@/lib/cms/queries";
import { getDictionary } from "@/lib/dictionary";
import { t, type Locale } from "@/lib/i18n";

export async function SiteHeader({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettingsRow;
}) {
  const dict = getDictionary(locale);
  const menu = await getMenu("header");
  const items = await buildNav(menu, locale);

  const siteName = t(settings.site_name, locale, "Doctor");
  const contact = settings.contact ?? {};

  return (
    <Navbar
      locale={locale}
      locales={enabledLocales(settings)}
      items={items}
      logo={settings.logo_url ?? "/logo.png"}
      logoAlt={siteName}
      ctaLabel={dict.callUs}
      ctaPhone={contact.phone ?? ""}
      showCta={Boolean(contact.phone)}
    />
  );
}
