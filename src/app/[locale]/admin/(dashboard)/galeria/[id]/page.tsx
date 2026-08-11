import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GalleryPhotoForm } from "@/components/admin/gallery-photo-form";
import { getGalleryPhotoById } from "@/lib/admin-queries";
import { photoToForm } from "@/lib/gallery-form";
import { resolveLocale } from "@/i18n/routing";

export default async function EditGalleryPhotoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations("admin.galeria");

  const photo = await getGalleryPhotoById(id);
  if (!photo) notFound();

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
        <h1 className="text-2xl font-bold tracking-tight">{t("editTitle")}</h1>
      </div>

      <GalleryPhotoForm
        mode="edit"
        photoId={photo.id}
        defaultValues={photoToForm(photo)}
      />
    </div>
  );
}
