"use client";

import { CheckCircle2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Field, FormMessage, Honeypot, inputClass } from "@/components/site/forms/fields";
import { submitAppointment, type FormState } from "@/lib/actions/public";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

const INITIAL: FormState = { status: "idle", message: "" };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AppointmentForm({
  locale,
  departments,
  note,
}: {
  locale: Locale;
  departments: string[];
  note?: string;
}) {
  const dict = getDictionary(locale);
  const [state, action] = useActionState(submitAppointment, INITIAL);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-600" aria-hidden />
        <h3 className="text-lg font-semibold text-brand-900">{dict.thankYouTitle}</h3>
        <p className="text-sm text-brand-800">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={dict.name} required>
          <input name="name" required maxLength={120} className={inputClass} autoComplete="name" />
        </Field>

        <Field label={dict.phone} required>
          <input
            name="phone"
            required
            maxLength={40}
            inputMode="tel"
            className={inputClass}
            autoComplete="tel"
          />
        </Field>

        <Field label={dict.email} hint={dict.optional}>
          <input name="email" type="email" className={inputClass} autoComplete="email" />
        </Field>

        <Field label={dict.department}>
          <select name="department" className={inputClass} defaultValue="">
            <option value="">{dict.selectDepartment}</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </Field>

        <Field label={dict.preferredDate}>
          <input name="preferred_date" type="date" className={inputClass} />
        </Field>

        <Field label={dict.preferredTime}>
          <input name="preferred_time" type="time" className={inputClass} />
        </Field>
      </div>

      <Field label={dict.message} hint={dict.optional}>
        <textarea name="message" rows={3} maxLength={2000} className={inputClass} />
      </Field>

      <FormMessage status={state.status} message={state.message} />

      <SubmitButton label={dict.submitAppointment} pendingLabel={dict.sending} />

      {note ? <p className="text-center text-xs text-ink-500">{note}</p> : null}
    </form>
  );
}
