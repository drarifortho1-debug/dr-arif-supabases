"use client";

import { CircleAlert, LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Input, Label } from "@/components/admin/ui";
import { signInAction, signUpAction, type AuthState } from "@/lib/actions/auth";

const INITIAL: AuthState = { error: null };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-brand-300"
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {label}
    </button>
  );
}

export function LoginForm({ mode, next }: { mode: "signin" | "setup"; next: string }) {
  const action = mode === "setup" ? signUpAction : signInAction;
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      {mode === "setup" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" autoComplete="name" placeholder="Jane Doe" />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@clinic.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" required>
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "setup" ? "new-password" : "current-password"}
          placeholder={mode === "setup" ? "At least 8 characters" : "••••••••"}
        />
      </div>

      {state.error ? (
        <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}

      <Submit label={mode === "setup" ? "Create administrator" : "Sign in"} />
    </form>
  );
}
