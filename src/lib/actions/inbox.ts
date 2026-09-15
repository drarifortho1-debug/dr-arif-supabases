"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { assertStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const tableSchema = z.enum(["appointments", "contact_messages"]);
const statusSchema = z.enum(["new", "read", "archived"]);

export type InboxTable = z.infer<typeof tableSchema>;

const PATHS: Record<InboxTable, string> = {
  appointments: "/admin/appointments",
  contact_messages: "/admin/messages",
};

export async function setInboxStatus(
  table: InboxTable,
  id: string,
  status: "new" | "read" | "archived",
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const parsedTable = tableSchema.parse(table);
    const parsedStatus = statusSchema.parse(status);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from(parsedTable)
      .update({ status: parsedStatus })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath(PATHS[parsedTable]);
    revalidatePath("/admin", "layout");
    return ok();
  } catch (error) {
    return fail(error, "Could not update the status.");
  }
}

export async function deleteInboxItem(
  table: InboxTable,
  id: string,
): Promise<ActionResult<undefined>> {
  try {
    await assertStaff();
    const parsedTable = tableSchema.parse(table);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from(parsedTable).delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath(PATHS[parsedTable]);
    revalidatePath("/admin", "layout");
    return ok();
  } catch (error) {
    return fail(error, "Could not delete the item.");
  }
}
