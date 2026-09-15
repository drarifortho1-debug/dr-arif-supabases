import { ChevronDown, ChevronUp, ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ActionButton } from "@/components/admin/action-button";
import { CreateTreatmentForm } from "@/components/admin/create-treatment-form";
import { EmptyState, PageHeader, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { deleteTreatment, reorderTreatment } from "@/lib/actions/treatments";
import { requireStaff } from "@/lib/auth";
import type { TreatmentRow } from "@/lib/cms/database.types";
import { DEFAULT_LOCALE, localePath, t } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Treatments" };

export default async function AdminTreatmentsPage() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("treatments")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const treatments = (data ?? []) as TreatmentRow[];

  return (
    <>
      <PageHeader
        title="Treatment pages"
        description="Each row is a page under /our-treatments and an entry in the header dropdown."
        actions={<CreateTreatmentForm />}
      />

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      ) : treatments.length === 0 ? (
        <EmptyState
          title="No treatment pages yet"
          description="Add one to create a page with causes, treatment options, a comparison table and FAQs."
        />
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white">
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>URL</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((treatment, index) => {
                const name = t(treatment.nav_label, "bn") || treatment.slug;
                const href = localePath(DEFAULT_LOCALE, `/our-treatments/${treatment.slug}`);

                return (
                  <tr key={treatment.id} className="hover:bg-ink-50/60">
                    <Td>
                      <Link
                        href={`/admin/treatments/${treatment.id}`}
                        className="font-medium text-ink-900 hover:text-brand-700"
                      >
                        {name}
                      </Link>
                      <span className="block text-xs text-ink-400">
                        {t(treatment.nav_desc, "bn")}
                      </span>
                    </Td>
                    <Td>
                      <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs text-ink-600">
                        {href}
                      </code>
                    </Td>
                    <Td>
                      <StatusBadge status={treatment.enabled ? "published" : "draft"} />
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionButton
                          action={reorderTreatment.bind(null, treatment.id, -1)}
                          title="Move up"
                          className="h-8 w-8 p-0"
                        >
                          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                        </ActionButton>
                        <ActionButton
                          action={reorderTreatment.bind(null, treatment.id, 1)}
                          title="Move down"
                          className="h-8 w-8 p-0"
                        >
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                        </ActionButton>
                        <Link
                          href={`/admin/treatments/${treatment.id}`}
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on the website"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                        <ActionButton
                          action={deleteTreatment.bind(null, treatment.id)}
                          confirm={`Delete "${name}"? The page and its menu entry disappear.`}
                          title="Delete"
                          className="h-8 w-8 p-0 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </ActionButton>
                        <span className="sr-only">{index}</span>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
}
