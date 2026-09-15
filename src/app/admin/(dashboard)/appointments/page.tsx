import type { Metadata } from "next";

import { InboxList, type InboxEntry } from "@/components/admin/inbox-list";
import { StatusFilter } from "@/components/admin/status-filter";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { AppointmentRow, InboxStatus } from "@/lib/cms/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Appointments" };

const STATUSES: InboxStatus[] = ["new", "read", "archived"];

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireStaff();

  const { status = "" } = await searchParams;
  const filter = STATUSES.includes(status as InboxStatus) ? (status as InboxStatus) : null;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (filter) query = query.eq("status", filter);

  const { data } = await query;
  const rows = (data ?? []) as AppointmentRow[];

  const entries: InboxEntry[] = rows.map((row) => ({
    id: row.id,
    status: row.status,
    created_at: row.created_at,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    meta: [
      row.department ? { label: "Department", value: row.department } : null,
      row.preferred_date
        ? { label: "Date", value: formatDate(row.preferred_date, "en") }
        : null,
      row.preferred_time ? { label: "Time", value: row.preferred_time } : null,
      { label: "Language", value: row.locale.toUpperCase() },
    ].filter((item): item is { label: string; value: string } => Boolean(item)),
  }));

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Requests submitted through the appointment form on the website."
      />
      <StatusFilter basePath="/admin/appointments" current={filter ?? ""} />
      <InboxList table="appointments" entries={entries} />
    </>
  );
}
