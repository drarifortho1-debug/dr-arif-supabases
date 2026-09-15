import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TreatmentEditor } from "@/components/admin/treatment-editor";
import { requireStaff } from "@/lib/auth";
import type { TreatmentRow } from "@/lib/cms/database.types";
import { t } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface EditorProps {
  params: Promise<{ id: string }>;
}

async function loadTreatment(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("treatments").select("*").eq("id", id).maybeSingle();
  return (data as TreatmentRow) ?? null;
}

export async function generateMetadata({ params }: EditorProps): Promise<Metadata> {
  const { id } = await params;
  const treatment = await loadTreatment(id);
  return { title: treatment ? t(treatment.nav_label, "bn") || "Treatment" : "Treatment" };
}

export default async function AdminTreatmentEditor({ params }: EditorProps) {
  await requireStaff();

  const { id } = await params;
  const treatment = await loadTreatment(id);

  if (!treatment) notFound();

  return (
    <>
      <Link
        href="/admin/treatments"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All treatments
      </Link>

      <TreatmentEditor treatment={treatment} />
    </>
  );
}
