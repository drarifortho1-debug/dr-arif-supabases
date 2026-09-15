import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { SiteSettingsRow } from "@/lib/cms/database.types";
import { FALLBACK_SETTINGS } from "@/lib/cms/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Site settings" };

export default async function AdminSettingsPage() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  const settings = { ...FALLBACK_SETTINGS, ...(data ?? {}) } as SiteSettingsRow;

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Name, logo, contact details, social links and SEO defaults for the whole website."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
