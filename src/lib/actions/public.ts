"use server";

import { z } from "zod";

import { createSupabasePublicClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { tr } from "@/lib/dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

/**
 * Server Actions for the two public forms. They insert through the anonymous
 * client, which the RLS policy allows for INSERT only — a visitor can submit
 * but can never read anybody's submissions.
 */

export interface FormState {
  status: "idle" | "success" | "error";
  message: string;
}

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const appointmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  email: z.union([z.email(), z.literal("")]).optional(),
  preferred_date: z.string().trim().max(20).optional(),
  preferred_time: z.string().trim().max(40).optional(),
  department: z.string().trim().max(120).optional(),
  message: optionalText,
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(4).max(4000),
});

function localeFrom(formData: FormData): Locale {
  const value = formData.get("locale");
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Bots fill hidden fields; humans leave them empty. */
function looksLikeSpam(formData: FormData): boolean {
  const honeypot = formData.get("website");
  return typeof honeypot === "string" && honeypot.trim() !== "";
}

function emptyToNull(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value.trim() : null;
}

export async function submitAppointment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = localeFrom(formData);

  // Silently accept spam so the bot does not learn anything.
  if (looksLikeSpam(formData)) {
    return { status: "success", message: tr(locale, "appointmentSuccess") };
  }

  if (!isSupabaseConfigured()) {
    return { status: "error", message: tr(locale, "errorOccurred") };
  }

  const parsed = appointmentSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    preferred_date: formData.get("preferred_date") ?? "",
    preferred_time: formData.get("preferred_time") ?? "",
    department: formData.get("department") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: tr(locale, "requiredFields") };
  }

  const supabase = createSupabasePublicClient();
  const { error } = await supabase.from("appointments").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: emptyToNull(parsed.data.email),
    preferred_date: emptyToNull(parsed.data.preferred_date),
    preferred_time: emptyToNull(parsed.data.preferred_time),
    department: emptyToNull(parsed.data.department),
    message: emptyToNull(parsed.data.message),
    locale,
  });

  if (error) {
    return { status: "error", message: tr(locale, "errorOccurred") };
  }

  return { status: "success", message: tr(locale, "appointmentSuccess") };
}

export async function submitContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = localeFrom(formData);

  if (looksLikeSpam(formData)) {
    return { status: "success", message: tr(locale, "messageSuccess") };
  }

  if (!isSupabaseConfigured()) {
    return { status: "error", message: tr(locale, "errorOccurred") };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { status: "error", message: tr(locale, "requiredFields") };
  }

  const supabase = createSupabasePublicClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: emptyToNull(parsed.data.email),
    phone: emptyToNull(parsed.data.phone),
    subject: emptyToNull(parsed.data.subject),
    message: parsed.data.message,
    locale,
  });

  if (error) {
    return { status: "error", message: tr(locale, "errorOccurred") };
  }

  return { status: "success", message: tr(locale, "messageSuccess") };
}
