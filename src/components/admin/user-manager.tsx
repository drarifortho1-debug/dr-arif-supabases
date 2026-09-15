"use client";

import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Toggle } from "@/components/admin/field-renderer";
import {
  Alert,
  Button,
  FormRow,
  Input,
  Select,
  StatusBadge,
  Table,
  Td,
  Th,
} from "@/components/admin/ui";
import {
  createStaffUser,
  deleteStaffUser,
  updateStaffUser,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/actions/users";
import type { ProfileRow } from "@/lib/cms/database.types";
import { formatDateTime } from "@/lib/utils";

type Mode =
  | { kind: "create"; form: CreateUserInput }
  | { kind: "edit"; id: string; email: string; form: UpdateUserInput };

export function UserManager({
  users,
  currentUserId,
}: {
  users: ProfileRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!mode) return;
    setBusy(true);
    setError(null);

    const result =
      mode.kind === "create"
        ? await createStaffUser(mode.form)
        : await updateStaffUser(mode.id, mode.form);

    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMode(null);
    router.refresh();
  }

  async function remove(user: ProfileRow) {
    if (!window.confirm(`Remove ${user.email}? They will no longer be able to sign in.`)) return;
    setBusy(true);
    setError(null);
    const result = await deleteStaffUser(user.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {mode ? (
        <form onSubmit={submit} className="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">
              {mode.kind === "create" ? "Add a team member" : `Edit ${mode.email}`}
            </h2>
            <button
              type="button"
              onClick={() => setMode(null)}
              aria-label="Cancel"
              className="rounded-lg p-1 text-ink-400 hover:bg-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {mode.kind === "create" ? (
              <>
                <FormRow label="Email" required>
                  <Input
                    type="email"
                    required
                    value={mode.form.email}
                    onChange={(event) =>
                      setMode({ ...mode, form: { ...mode.form, email: event.target.value } })
                    }
                  />
                </FormRow>
                <FormRow label="Temporary password" required help="Share it privately; they can change it later.">
                  <Input
                    type="text"
                    required
                    minLength={8}
                    value={mode.form.password}
                    onChange={(event) =>
                      setMode({ ...mode, form: { ...mode.form, password: event.target.value } })
                    }
                  />
                </FormRow>
              </>
            ) : null}

            <FormRow label="Full name">
              <Input
                value={mode.form.full_name}
                onChange={(event) =>
                  setMode({ ...mode, form: { ...mode.form, full_name: event.target.value } } as Mode)
                }
              />
            </FormRow>

            <FormRow label="Role" help="Editors manage content; admins also manage users.">
              <Select
                value={mode.form.role}
                onChange={(event) =>
                  setMode({
                    ...mode,
                    form: { ...mode.form, role: event.target.value as "admin" | "editor" },
                  } as Mode)
                }
              >
                <option value="editor">Editor</option>
                <option value="admin">Administrator</option>
              </Select>
            </FormRow>

            {mode.kind === "edit" ? (
              <div className="flex items-center gap-3">
                <Toggle
                  checked={mode.form.is_active}
                  onChange={(is_active) => setMode({ ...mode, form: { ...mode.form, is_active } })}
                  label="Active"
                />
                <span className="text-sm text-ink-700">
                  {mode.form.is_active ? "Active — can sign in" : "Suspended — cannot sign in"}
                </span>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="mt-4">
              <Alert tone="error">{error}</Alert>
            </div>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setMode(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {mode.kind === "create" ? "Create account" : "Save changes"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <Button
            onClick={() =>
              setMode({
                kind: "create",
                form: { email: "", password: "", full_name: "", role: "editor" },
              })
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add team member
          </Button>
        </div>
      )}

      {!mode && error ? <Alert tone="error">{error}</Alert> : null}

      <div className="rounded-xl border border-ink-200 bg-white">
        <Table>
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-ink-50/60">
                <Td>
                  <span className="block font-medium text-ink-900">
                    {user.full_name || "—"}
                    {user.id === currentUserId ? (
                      <span className="ml-2 text-xs font-normal text-ink-400">(you)</span>
                    ) : null}
                  </span>
                  <span className="block text-xs text-ink-500">{user.email}</span>
                </Td>
                <Td>
                  <StatusBadge status={user.role} />
                </Td>
                <Td>
                  <span className={user.is_active ? "text-brand-700" : "text-ink-400"}>
                    {user.is_active ? "Active" : "Suspended"}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-xs text-ink-500">
                  {formatDateTime(user.created_at)}
                </Td>
                <Td>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() =>
                        setMode({
                          kind: "edit",
                          id: user.id,
                          email: user.email,
                          form: {
                            full_name: user.full_name,
                            role: user.role,
                            is_active: user.is_active,
                          },
                        })
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      title="Remove"
                      disabled={busy || user.id === currentUserId}
                      onClick={() => void remove(user)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
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
    </div>
  );
}
