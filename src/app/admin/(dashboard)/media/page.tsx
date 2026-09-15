import type { Metadata } from "next";

import { MediaLibrary } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { MediaRow } from "@/lib/cms/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Media library" };

export default async function AdminMediaPage() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <>
      <PageHeader
        title="Media library"
        description="Images used across pages, posts and the logo. Files are stored in Supabase Storage."
      />
      <MediaLibrary items={(data ?? []) as MediaRow[]} />
    </>
  );
}
