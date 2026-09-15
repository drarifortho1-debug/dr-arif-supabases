"use client";

import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, EmptyState, FormRow, Input, Table, Td, Th } from "@/components/admin/ui";
import { deleteCategory, saveCategory, type CategoryInput } from "@/lib/actions/posts";
import type { PostCategoryRow } from "@/lib/cms/database.types";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { slugify } from "@/lib/utils";

const EMPTY: CategoryInput = { slug: "", name: {}, sort_order: 0 };

export function CategoryManager({ categories }: { categories: PostCategoryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<{ id: string | null; form: CategoryInput } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startNew() {
    setEditing({ id: null, form: { ...EMPTY, sort_order: categories.length } });
    setError(null);
  }

  function startEdit(category: PostCategoryRow) {
    setEditing({
      id: category.id,
      form: {
        slug: category.slug,
        name: (category.name ?? {}) as Record<string, string>,
        sort_order: category.sort_order,
      },
    });
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;

    setBusy(true);
    setError(null);

    const result = await saveCategory(editing.id, editing.form);
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setEditing(null);
    router.refresh();
  }

  async function remove(category: PostCategoryRow) {
    if (!window.confirm(`Delete "${category.name.en ?? category.slug}"? Posts keep their content but lose this category.`)) {
      return;
    }
    setBusy(true);
    const result = await deleteCategory(category.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {editing ? (
        <form
          onSubmit={submit}
          className="rounded-xl border border-brand-200 bg-brand-50/40 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">
              {editing.id ? "Edit category" : "New category"}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Cancel"
              className="rounded-lg p-1 text-ink-400 hover:bg-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {LOCALES.map((locale) => (
              <FormRow key={locale} label={`Name (${LOCALE_LABELS[locale]})`}>
                <Input
                  value={editing.form.name[locale] ?? ""}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      form: {
                        ...editing.form,
                        name: { ...editing.form.name, [locale]: event.target.value },
                        slug:
                          !editing.id && locale === "en" && !editing.form.slug
                            ? slugify(event.target.value)
                            : editing.form.slug,
                      },
                    })
                  }
                />
              </FormRow>
            ))}

            <FormRow label="Slug" required>
              <Input
                required
                value={editing.form.slug}
                onChange={(event) =>
                  setEditing({ ...editing, form: { ...editing.form, slug: event.target.value } })
                }
                onBlur={(event) =>
                  setEditing({
                    ...editing,
                    form: {
                      ...editing.form,
                      slug: slugify(event.target.value) || event.target.value,
                    },
                  })
                }
              />
            </FormRow>

            <FormRow label="Order">
              <Input
                type="number"
                min={0}
                value={editing.form.sort_order}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    form: { ...editing.form, sort_order: Number(event.target.value) || 0 },
                  })
                }
              />
            </FormRow>
          </div>

          {error ? (
            <div className="mt-4">
              <Alert tone="error">{error}</Alert>
            </div>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Save category
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <Button onClick={startNew}>
            <Plus className="h-4 w-4" aria-hidden />
            New category
          </Button>
        </div>
      )}

      {!editing && error ? <Alert tone="error">{error}</Alert> : null}

      {categories.length === 0 ? (
        <EmptyState
          title="No categories"
          description="Categories let visitors filter the blog. They are optional."
        />
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white">
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Slug</Th>
                <Th>Order</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-ink-50/60">
                  <Td className="font-medium text-ink-900">
                    {category.name.en || "—"}
                    {category.name.bn ? (
                      <span className="ml-2 text-xs font-normal text-ink-400">
                        {category.name.bn}
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">{category.slug}</code>
                  </Td>
                  <Td>{category.sort_order}</Td>
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => startEdit(category)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        disabled={busy}
                        onClick={() => void remove(category)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
