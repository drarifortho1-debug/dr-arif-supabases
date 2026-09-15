import type { MenuNode } from "@/lib/cms/queries";
import { getTreatments } from "@/lib/cms/queries";
import { localePath, t, type Locale } from "@/lib/i18n";
import { isExternalHref } from "@/components/site/ui";

/** Plain, serialisable shape handed to the client-side navigation. */
export interface NavChild {
  label: string;
  desc: string;
  href: string;
  external: boolean;
}

export interface NavItem extends NavChild {
  children: NavChild[];
}

function toChild(
  label: string,
  desc: string,
  url: string,
  locale: Locale,
  newTab = false,
): NavChild {
  const external = isExternalHref(url);
  return {
    label,
    desc,
    href: external ? url : localePath(locale, url),
    external: external || newTab,
  };
}

/**
 * Build the navigation for a locale.
 *
 * A menu item flagged `auto_children` (the "চিকিৎসা সেবা" dropdown on the
 * original site) has its children filled from the enabled treatments, so a new
 * treatment page appears in the menu automatically.
 */
export async function buildNav(nodes: MenuNode[], locale: Locale): Promise<NavItem[]> {
  const needsTreatments = nodes.some((node) => node.auto_children);
  const treatments = needsTreatments ? await getTreatments() : [];

  return nodes
    .map((node) => {
      const children: NavChild[] = node.auto_children
        ? treatments.map((treatment) =>
            toChild(
              t(treatment.nav_label, locale),
              t(treatment.nav_desc, locale),
              `/our-treatments/${treatment.slug}`,
              locale,
            ),
          )
        : (node.children ?? []).map((child) =>
            toChild(t(child.label, locale), "", child.url, locale, child.open_in_new_tab),
          );

      return {
        ...toChild(t(node.label, locale), "", node.url, locale, node.open_in_new_tab),
        children,
      };
    })
    .filter((item) => item.label !== "");
}
