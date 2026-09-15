/** Uniform return shape for every admin Server Action. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok(): ActionResult<undefined>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(error: unknown, fallback = "Something went wrong."): ActionResult<never> {
  if (error instanceof Error && error.message) return { ok: false, error: error.message };
  if (typeof error === "string" && error) return { ok: false, error };
  return { ok: false, error: fallback };
}

/** Form state used with `useActionState`. */
export type FormResult = { status: "idle" | "success" | "error"; message: string };

export const IDLE_FORM: FormResult = { status: "idle", message: "" };
