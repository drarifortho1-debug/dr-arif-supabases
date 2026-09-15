import type { Metadata } from "next";

import { Alert, PageHeader } from "@/components/admin/ui";
import { UserManager } from "@/components/admin/user-manager";
import { requireAdmin } from "@/lib/auth";
import type { ProfileRow } from "@/lib/cms/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const serviceKeyReady = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <>
      <PageHeader
        title="Team members"
        description="People who can sign in to this admin panel."
      />

      {!serviceKeyReady ? (
        <div className="mb-5">
          <Alert tone="warning">
            Creating and removing accounts needs{" "}
            <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
            <code className="font-mono">.env.local</code>. Editing roles still works without it.
          </Alert>
        </div>
      ) : null}

      <UserManager users={(data ?? []) as ProfileRow[]} currentUserId={session.userId} />
    </>
  );
}
