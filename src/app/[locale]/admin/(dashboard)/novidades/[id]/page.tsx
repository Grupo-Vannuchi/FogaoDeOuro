import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { InformationForm } from "@/components/admin/information-form";
import { getInformationById } from "@/lib/admin-queries";
import { informationToForm } from "@/lib/information-form";
import { localize } from "@/lib/content";
import { resolveLocale } from "@/i18n/routing";

export default async function EditInformationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations("admin.informations");

  const information = await getInformationById(id);
  if (!information) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/novidades"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("title")}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("editTitle", { title: localize(information.title, locale) })}
        </h1>
      </div>

      <InformationForm
        mode="edit"
        informationId={information.id}
        defaultValues={informationToForm(information)}
      />
    </div>
  );
}
