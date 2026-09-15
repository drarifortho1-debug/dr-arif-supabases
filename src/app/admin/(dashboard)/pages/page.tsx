import { Copy, ExternalLink, Home, Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ActionButton } from "@/components/admin/action-button";
import { CreatePageForm } from "@/components/admin/create-page-form";
import {
  EmptyState,
  PageHeader,
  StatusBadge,
  Table,
  Td,
  Th,
} from "@/components/admin/ui";
import { deletePage, duplicatePage } from "@/lib/actions/pages";
import { requireStaff } from "@/lib/auth";
import type { PageRow } from "@/lib/cms/database.types";
import { DEFAULT_LOCALE, t } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Pages" };

export default async function AdminPagesList() {
  await requireStaff();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("is_home", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const pages = (data ?? []) as PageRow[];

  return (
    <>
      <PageHeader
        title="Pages"
        description="Every page on the website is built from sections you choose here."
        actions={<CreatePageForm />}
      />

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      ) : pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Create your first page, then add sections such as a hero banner, services and a contact form."
        />
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white">
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>URL</Th>
                <Th>Status</Th>
                <Th>Last updated</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const title = t(page.title, "en") || t(page.title, "bn") || "Untitled";
                const href = page.is_home
                  ? `/${DEFAULT_LOCALE}`
                  : `/${DEFAULT_LOCALE}/${page.slug}`;

                return (
                  <tr key={page.id} className="hover:bg-ink-50/60">
                    <Td>
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="flex items-center gap-2 font-medium text-ink-900 hover:text-brand-700"
                      >
                        {page.is_home ? (
                          <Home className="h-3.5 w-3.5 text-brand-600" aria-label="Home page" />
                        ) : null}
                        {title}
                      </Link>
                    </Td>
                    <Td>
                      <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs text-ink-600">
                        {href}
                      </code>
                    </Td>
                    <Td>
                      <StatusBadge status={page.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-ink-500">
                      {formatDateTime(page.updated_at)}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/pages/${page.id}`}
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
                          action={duplicatePage.bind(null, page.id)}
                          title="Duplicate"
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3.5 w-3.5" aria-hidden />
                        </ActionButton>

                        <ActionButton
                          action={deletePage.bind(null, page.id)}
                          confirm={`Delete "${title}" and all of its sections? This cannot be undone.`}
                          title="Delete"
                          className="h-8 w-8 border-ink-200 p-0 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </ActionButton>
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
