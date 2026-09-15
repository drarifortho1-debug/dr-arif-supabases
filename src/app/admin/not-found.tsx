import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="text-6xl font-bold text-ink-200">404</span>
      <h1 className="text-xl font-bold text-ink-900">Not found</h1>
      <p className="max-w-sm text-sm text-ink-500">
        That item may have been deleted, or the link is wrong.
      </p>
      <Link
        href="/admin"
        className="mt-2 inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to the dashboard
      </Link>
    </main>
  );
}
