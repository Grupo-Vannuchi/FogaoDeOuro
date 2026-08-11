import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GalleryPhotoForm } from "@/components/admin/gallery-photo-form";
import { emptyGalleryPhotoForm } from "@/lib/gallery-form";
import { resolveLocale } from "@/i18n/routing";

export default async function NewGalleryPhotoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("admin.galeria");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/galeria"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("title")}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("new")}</h1>
      </div>

      <GalleryPhotoForm mode="create" defaultValues={emptyGalleryPhotoForm()} />
    </div>
  );
}
