import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/sidebar";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The admin panel always renders per request. Without this, a build that
 * runs without Supabase keys would prerender these routes as a static
 * redirect and keep serving it after the keys are added.
 */
export const dynamic = "force-dynamic";

/** Counts shown as badges next to Appointments and Messages. */
async function getInboxCounts() {
  const supabase = await createSupabaseServerClient();

  const [appointments, messages] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return {
    appointments: appointments.count ?? 0,
    messages: messages.count ?? 0,
  };
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireStaff();
  const counts = await getInboxCounts();

  return (
    <div className="lg:pl-64">
      <AdminSidebar
        name={session.profile.full_name}
        email={session.email}
        role={session.profile.role}
        counts={counts}
      />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
    </div>
  );
}
