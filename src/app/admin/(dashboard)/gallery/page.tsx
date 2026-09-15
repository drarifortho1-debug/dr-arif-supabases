import type { Metadata } from "next";

import { GalleryManager } from "@/components/admin/gallery-manager";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { GalleryRow } from "@/lib/cms/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Photo gallery"
        description="Shown on the About page and in any gallery section set to use the gallery tab."
      />
      <GalleryManager images={(data ?? []) as GalleryRow[]} />
    </>
  );
}
