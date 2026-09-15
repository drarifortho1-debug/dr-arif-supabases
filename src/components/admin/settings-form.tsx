"use client";

import { CircleAlert, CircleCheck, LoaderCircle, Save } from "lucide-react";
import { useState } from "react";

import { Toggle } from "@/components/admin/field-renderer";
import { ImagePicker } from "@/components/admin/media-picker";
import {
  Alert,
  Button,
  FormRow,
  Input,
  Label,
  Panel,
  Select,
  Textarea,
} from "@/components/admin/ui";
import { SOCIAL_LABELS, type SocialKey } from "@/components/social-icons";
import { saveSettings, type SettingsInput } from "@/lib/actions/settings";
import type { SiteSettingsRow } from "@/lib/cms/database.types";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = "general" | "contact" | "social" | "seo" | "footer";

const TABS: Array<[Tab, string]> = [
  ["general", "General"],
  ["contact", "Contact"],
  ["social", "Social media"],
  ["seo", "SEO defaults"],
  ["footer", "Footer"],
];

const SOCIAL_KEYS: SocialKey[] = ["facebook", "youtube", "instagram", "linkedin", "twitter", "whatsapp"];

export function SettingsForm({ settings }: { settings: SiteSettingsRow }) {
  const [form, setForm] = useState<SettingsInput>({
    site_name: (settings.site_name ?? {}) as Record<string, string>,
    tagline: (settings.tagline ?? {}) as Record<string, string>,
    logo_url: settings.logo_url,
    favicon_url: settings.favicon_url,
    default_locale: settings.default_locale ?? "bn",
    enabled_locales: settings.enabled_locales?.length ? settings.enabled_locales : ["bn", "en"],
    seo: {
      title: (settings.seo?.title ?? {}) as Record<string, string>,
      description: (settings.seo?.description ?? {}) as Record<string, string>,
      keywords: (settings.seo?.keywords ?? {}) as Record<string, string>,
      og_image: settings.seo?.og_image ?? "",
    },
    contact: {
      phone: settings.contact?.phone ?? "",
      emergency_phone: settings.contact?.emergency_phone ?? "",
      email: settings.contact?.email ?? "",
      whatsapp: settings.contact?.whatsapp ?? "",
      address: (settings.contact?.address ?? {}) as Record<string, string>,
      hours: (settings.contact?.hours ?? {}) as Record<string, string>,
      map: settings.contact?.map ?? "",
    },
    socials: {
      facebook: settings.socials?.facebook ?? "",
      youtube: settings.socials?.youtube ?? "",
      instagram: settings.socials?.instagram ?? "",
      linkedin: settings.socials?.linkedin ?? "",
      twitter: settings.socials?.twitter ?? "",
      whatsapp: settings.socials?.whatsapp ?? "",
    },
    footer: {
      about: (settings.footer?.about ?? {}) as Record<string, string>,
      copyright: (settings.footer?.copyright ?? {}) as Record<string, string>,
    },
  });

  const [tab, setTab] = useState<Tab>("general");
  const [locale, setLocale] = useState<Locale>(LOCALES[0]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  function update(recipe: (current: SettingsInput) => SettingsInput) {
    setForm(recipe);
    setDirty(true);
    setMessage(null);
  }

  const localizedInput = (
    get: (current: SettingsInput) => Record<string, string> | undefined,
    set: (current: SettingsInput, next: Record<string, string>) => SettingsInput,
    multiline = false,
  ) => {
    const value = get(form)?.[locale] ?? "";
    const onChange = (text: string) =>
      update((current) => set(current, { ...(get(current) ?? {}), [locale]: text }));

    return multiline ? (
      <Textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    ) : (
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    );
  };

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await saveSettings(form);
    setSaving(false);
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }
    setDirty(false);
    setMessage({ tone: "success", text: "Settings saved and live." });
  }

  const hint = LOCALE_LABELS[locale];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                tab === value ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
            {LOCALES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  item === locale ? "bg-brand-600 text-white" : "text-ink-500 hover:text-ink-800",
                )}
              >
                {LOCALE_LABELS[item]}
              </button>
            ))}
          </div>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
        </div>
      </div>

      {message ? (
        <Alert tone={message.tone}>
          <span className="flex items-center gap-2">
            {message.tone === "success" ? (
              <CircleCheck className="h-4 w-4" aria-hidden />
            ) : (
              <CircleAlert className="h-4 w-4" aria-hidden />
            )}
            {message.text}
          </span>
        </Alert>
      ) : null}

      {tab === "general" ? (
        <Panel title="General">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Site name" hint={hint} required>
              {localizedInput(
                (c) => c.site_name,
                (c, next) => ({ ...c, site_name: next }),
              )}
            </FormRow>
            <FormRow label="Tagline" hint={hint}>
              {localizedInput(
                (c) => c.tagline,
                (c, next) => ({ ...c, tagline: next }),
              )}
            </FormRow>
            <FormRow label="Logo" help="Shown in the header and footer. Leave empty to use the site name.">
              <ImagePicker
                value={form.logo_url ?? ""}
                onChange={(url) => update((c) => ({ ...c, logo_url: url || null }))}
              />
            </FormRow>
            <FormRow label="Favicon" help="A square PNG or SVG.">
              <ImagePicker
                value={form.favicon_url ?? ""}
                onChange={(url) => update((c) => ({ ...c, favicon_url: url || null }))}
              />
            </FormRow>
            <FormRow label="Default language" help="Visitors landing on / are sent here.">
              <Select
                value={form.default_locale}
                onChange={(event) =>
                  update((c) => ({ ...c, default_locale: event.target.value as Locale }))
                }
              >
                {LOCALES.map((item) => (
                  <option key={item} value={item}>
                    {LOCALE_LABELS[item]}
                  </option>
                ))}
              </Select>
            </FormRow>
            <div className="flex flex-col gap-2">
              <Label>Languages shown in the switcher</Label>
              {LOCALES.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Toggle
                    checked={form.enabled_locales.includes(item)}
                    onChange={(checked) =>
                      update((c) => ({
                        ...c,
                        enabled_locales: checked
                          ? Array.from(new Set([...c.enabled_locales, item]))
                          : c.enabled_locales.filter((l) => l !== item),
                      }))
                    }
                    label={LOCALE_LABELS[item]}
                  />
                  <span className="text-sm text-ink-700">{LOCALE_LABELS[item]}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      ) : null}

      {tab === "contact" ? (
        <Panel
          title="Contact details"
          description="Used in the header, footer and the Contact section."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Phone">
              <Input
                dir="ltr"
                value={form.contact.phone ?? ""}
                onChange={(event) =>
                  update((c) => ({ ...c, contact: { ...c.contact, phone: event.target.value } }))
                }
                placeholder="+880 1XXX-XXXXXX"
              />
            </FormRow>
            <FormRow label="Emergency hotline">
              <Input
                dir="ltr"
                value={form.contact.emergency_phone ?? ""}
                onChange={(event) =>
                  update((c) => ({
                    ...c,
                    contact: { ...c.contact, emergency_phone: event.target.value },
                  }))
                }
              />
            </FormRow>
            <FormRow label="Email">
              <Input
                type="email"
                value={form.contact.email ?? ""}
                onChange={(event) =>
                  update((c) => ({ ...c, contact: { ...c.contact, email: event.target.value } }))
                }
              />
            </FormRow>
            <FormRow label="WhatsApp number">
              <Input
                dir="ltr"
                value={form.contact.whatsapp ?? ""}
                onChange={(event) =>
                  update((c) => ({ ...c, contact: { ...c.contact, whatsapp: event.target.value } }))
                }
              />
            </FormRow>
            <FormRow label="Address" hint={hint} wide>
              {localizedInput(
                (c) => c.contact.address,
                (c, next) => ({ ...c, contact: { ...c.contact, address: next } }),
                true,
              )}
            </FormRow>
            <FormRow label="Opening hours" hint={hint} wide help="Line breaks are kept.">
              {localizedInput(
                (c) => c.contact.hours,
                (c, next) => ({ ...c, contact: { ...c.contact, hours: next } }),
                true,
              )}
            </FormRow>
            <FormRow
              label="Map"
              wide
              help="A place name (e.g. Dhanmondi 32, Dhaka) or a Google Maps embed URL."
            >
              <Input
                value={form.contact.map ?? ""}
                onChange={(event) =>
                  update((c) => ({ ...c, contact: { ...c.contact, map: event.target.value } }))
                }
              />
            </FormRow>
          </div>
        </Panel>
      ) : null}

      {tab === "social" ? (
        <Panel title="Social media" description="Leave a field empty to hide that icon.">
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_KEYS.map((key) => (
              <FormRow key={key} label={SOCIAL_LABELS[key]}>
                <Input
                  dir="ltr"
                  value={form.socials[key] ?? ""}
                  placeholder="https://"
                  onChange={(event) =>
                    update((c) => ({ ...c, socials: { ...c.socials, [key]: event.target.value } }))
                  }
                />
              </FormRow>
            ))}
          </div>
        </Panel>
      ) : null}

      {tab === "seo" ? (
        <Panel
          title="SEO defaults"
          description="Used when a page or post does not set its own title and description."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="Default title" hint={hint}>
              {localizedInput(
                (c) => c.seo.title,
                (c, next) => ({ ...c, seo: { ...c.seo, title: next } }),
              )}
            </FormRow>
            <FormRow label="Default share image">
              <ImagePicker
                value={form.seo.og_image ?? ""}
                onChange={(url) => update((c) => ({ ...c, seo: { ...c.seo, og_image: url } }))}
              />
            </FormRow>
            <FormRow label="Default description" hint={hint} wide>
              {localizedInput(
                (c) => c.seo.description,
                (c, next) => ({ ...c, seo: { ...c.seo, description: next } }),
                true,
              )}
            </FormRow>
          </div>
        </Panel>
      ) : null}

      {tab === "footer" ? (
        <Panel title="Footer">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="About text" hint={hint} wide help="Short paragraph under the logo.">
              {localizedInput(
                (c) => c.footer.about,
                (c, next) => ({ ...c, footer: { ...c.footer, about: next } }),
                true,
              )}
            </FormRow>
            <FormRow
              label="Copyright line"
              hint={hint}
              wide
              help="Leave empty for an automatic © year line."
            >
              {localizedInput(
                (c) => c.footer.copyright,
                (c, next) => ({ ...c, footer: { ...c.footer, copyright: next } }),
              )}
            </FormRow>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
