import type { Metadata } from "next";

import { InboxList, type InboxEntry } from "@/components/admin/inbox-list";
import { StatusFilter } from "@/components/admin/status-filter";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { ContactMessageRow, InboxStatus } from "@/lib/cms/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Messages" };

const STATUSES: InboxStatus[] = ["new", "read", "archived"];

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireStaff();

  const { status = "" } = await searchParams;
  const filter = STATUSES.includes(status as InboxStatus) ? (status as InboxStatus) : null;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (filter) query = query.eq("status", filter);

  const { data } = await query;
  const rows = (data ?? []) as ContactMessageRow[];

  const entries: InboxEntry[] = rows.map((row) => ({
    id: row.id,
    status: row.status,
    created_at: row.created_at,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    meta: [
      row.subject ? { label: "Subject", value: row.subject } : null,
      { label: "Language", value: row.locale.toUpperCase() },
    ].filter((item): item is { label: string; value: string } => Boolean(item)),
  }));

  return (
    <>
      <PageHeader
        title="Messages"
        description="Messages sent through the contact form on the website."
      />
      <StatusFilter basePath="/admin/messages" current={filter ?? ""} />
      <InboxList table="contact_messages" entries={entries} />
    </>
  );
}
