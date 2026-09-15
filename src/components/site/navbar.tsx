"use client";

import { ChevronDown, Menu, Phone, PhoneCall, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/site/language-switcher";
import type { NavChild, NavItem } from "@/components/site/nav";
import { SafeImage } from "@/components/site/ui";
import { getDictionary } from "@/lib/dictionary";
import { localePath, type Locale } from "@/lib/i18n";
import { telHref } from "@/lib/image";
import { cn } from "@/lib/utils";

function NavAnchor({
  item,
  className,
  onClick,
  children,
}: {
  item: NavChild;
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        className={className}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function Navbar({
  locale,
  locales,
  items,
  logo,
  logoAlt,
  ctaLabel,
  ctaPhone,
  showCta,
}: {
  locale: Locale;
  locales: Locale[];
  items: NavItem[];
  logo: string;
  logoAlt: string;
  ctaLabel: string;
  ctaPhone: string;
  showCta: boolean;
}) {
  const dict = getDictionary(locale);
  const pathname = usePathname() ?? "/";

  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);

  // Close everything when the route changes (derived during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setOpenMenu(null);
    setOpenMobileMenu(null);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeAll = () => {
    setOpen(false);
    setOpenMenu(null);
    setOpenMobileMenu(null);
  };

  return (
    <header className="relative z-40 w-full border-b border-slate-100 bg-white">
      <div className="max-container">
        <div className="flex h-22 items-center justify-between">
          <Link href={localePath(locale, "/")} aria-label={dict.backHome}>
            {logo ? (
              <SafeImage className="h-14 w-auto" src={logo} width={130} height={100} alt={logoAlt} priority />
            ) : (
              <span className="text-lg font-bold text-blue-dark">{logoAlt}</span>
            )}
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {items.map((item) =>
              item.children.length > 0 ? (
                <div
                  key={`${item.href}-${item.label}`}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.href)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === item.href ? null : item.href)}
                    aria-haspopup="true"
                    aria-expanded={openMenu === item.href}
                    className="flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2 text-[15px] font-semibold text-blue-dark transition-all duration-200 hover:bg-slate-50 hover:text-blue-light"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform duration-200", openMenu === item.href && "rotate-180")}
                      aria-hidden
                    />
                  </button>

                  {openMenu === item.href ? (
                    <div className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3">
                      <div className="w-[620px] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl shadow-slate-200/60">
                        <div className="grid grid-cols-2 gap-1">
                          {item.children.map((child) => (
                            <NavAnchor
                              key={`${child.href}-${child.label}`}
                              item={child}
                              onClick={closeAll}
                              className="group rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                            >
                              <span className="block text-[14px] font-semibold text-blue-dark group-hover:text-blue-light">
                                {child.label}
                              </span>
                              {child.desc ? (
                                <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                                  {child.desc}
                                </span>
                              ) : null}
                            </NavAnchor>
                          ))}
                        </div>

                        <div className="mt-2 border-t border-slate-100 pt-2">
                          <NavAnchor
                            item={item}
                            onClick={closeAll}
                            className="block rounded-xl px-3 py-2.5 text-[14px] font-semibold text-blue-light transition-colors hover:bg-slate-50"
                          >
                            {dict.allTreatments}
                          </NavAnchor>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <NavAnchor
                  key={`${item.href}-${item.label}`}
                  item={item}
                  className="rounded-xl px-3 py-2 text-[15px] font-semibold text-blue-dark transition-all duration-200 hover:bg-slate-50 hover:text-blue-light"
                >
                  {item.label}
                </NavAnchor>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            {locales.length > 1 ? (
              <div className="hidden lg:block">
                <LanguageSwitcher locale={locale} available={locales} />
              </div>
            ) : null}

            {showCta && ctaPhone ? (
              <div className="hidden items-center lg:flex">
                <a href={telHref(ctaPhone)} className="primary-btn">
                  <PhoneCall className="h-4 w-4" aria-hidden />
                  <span className="pt-0.5">{ctaLabel}</span>
                </a>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="cursor-pointer rounded-xl border border-transparent p-2.5 transition-all hover:border-slate-100 hover:bg-slate-50 lg:hidden"
              aria-label={dict.menu}
            >
              <Menu className="text-slate-700" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={dict.close}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity duration-300"
            onClick={closeAll}
          />

          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <span className="text-base font-bold text-slate-900">{dict.menu}</span>
              <button
                type="button"
                onClick={closeAll}
                aria-label={dict.close}
                className="cursor-pointer rounded-xl border border-slate-100 p-2.5 transition-colors hover:bg-slate-50"
              >
                <X className="h-5 w-5 text-slate-700" aria-hidden />
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto py-6">
              {items.map((item) =>
                item.children.length > 0 ? (
                  <div key={`${item.href}-${item.label}`}>
                    <button
                      type="button"
                      onClick={() => setOpenMobileMenu(openMobileMenu === item.href ? null : item.href)}
                      aria-expanded={openMobileMenu === item.href}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-light"
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openMobileMenu === item.href && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </button>

                    {openMobileMenu === item.href ? (
                      <div className="mt-1 ml-3 space-y-0.5 border-l border-slate-100 pl-3">
                        {item.children.map((child) => (
                          <NavAnchor
                            key={`${child.href}-${child.label}`}
                            item={child}
                            onClick={closeAll}
                            className="block rounded-xl px-4 py-2.5 text-[15px] text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-light"
                          >
                            {child.label}
                          </NavAnchor>
                        ))}
                        <NavAnchor
                          item={item}
                          onClick={closeAll}
                          className="block rounded-xl px-4 py-2.5 text-[15px] font-semibold text-blue-light transition-all hover:bg-slate-50"
                        >
                          {dict.allTreatments}
                        </NavAnchor>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <NavAnchor
                    key={`${item.href}-${item.label}`}
                    item={item}
                    onClick={closeAll}
                    className="block rounded-xl px-4 py-3.5 text-base font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-light"
                  >
                    {item.label}
                  </NavAnchor>
                ),
              )}
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              {locales.length > 1 ? <LanguageSwitcher locale={locale} available={locales} /> : null}
              {showCta && ctaPhone ? (
                <a href={telHref(ctaPhone)} className="primary-btn w-full justify-center">
                  <Phone className="h-4 w-4" aria-hidden />
                  <span>{ctaLabel}</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
