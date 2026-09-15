import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/ui";
import { VideoManager } from "@/components/admin/video-manager";
import { requireStaff } from "@/lib/auth";
import type { VideoRow } from "@/lib/cms/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Videos" };

export default async function AdminVideosPage() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Videos"
        description="YouTube videos shown on the home page and the video gallery page."
      />
      <VideoManager videos={(data ?? []) as VideoRow[]} />
    </>
  );
}
