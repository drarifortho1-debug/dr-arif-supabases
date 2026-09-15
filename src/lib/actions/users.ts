"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { assertAdmin } from "@/lib/auth";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

const roleSchema = z.enum(["admin", "editor"]);

const createSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
  full_name: z.string().trim().max(120),
  role: roleSchema,
});

const updateSchema = z.object({
  full_name: z.string().trim().max(120),
  role: roleSchema,
  is_active: z.boolean(),
});

export type CreateUserInput = z.infer<typeof createSchema>;
export type UpdateUserInput = z.infer<typeof updateSchema>;

function serviceKeyMissing(): string {
  return "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (and to Vercel) to manage users.";
}

/** How many active administrators exist — used to protect the last one. */
async function activeAdminCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("is_active", true);
  return count ?? 0;
}

export async function createStaffUser(input: CreateUserInput): Promise<ActionResult<string>> {
  try {
    await assertAdmin();
    const parsed = createSchema.parse(input);

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error(serviceKeyMissing());

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.full_name, role: parsed.role },
    });

    if (error) throw new Error(error.message);

    // The trigger already created the profile; make sure the role matches
    // even when the trigger ran with an older definition.
    await admin
      .from("profiles")
      .update({ full_name: parsed.full_name, role: parsed.role })
      .eq("id", data.user.id);

    revalidatePath("/admin/users");
    return ok(data.user.id);
  } catch (error) {
    return fail(error, "Could not create the user.");
  }
}

export async function updateStaffUser(
  userId: string,
  input: UpdateUserInput,
): Promise<ActionResult<undefined>> {
  try {
    const session = await assertAdmin();
    const parsed = updateSchema.parse(input);

    const demotingSelf =
      userId === session.userId && (parsed.role !== "admin" || !parsed.is_active);

    if (demotingSelf && (await activeAdminCount()) <= 1) {
      throw new Error("You are the only administrator. Promote someone else first.");
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("profiles").update(parsed).eq("id", userId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/users");
    return ok();
  } catch (error) {
    return fail(error, "Could not update the user.");
  }
}

export async function deleteStaffUser(userId: string): Promise<ActionResult<undefined>> {
  try {
    const session = await assertAdmin();

    if (userId === session.userId) {
      throw new Error("You cannot delete your own account while signed in.");
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error(serviceKeyMissing());

    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/users");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the user.");
  }
}
