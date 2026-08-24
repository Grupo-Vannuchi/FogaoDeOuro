import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { GalleryPhotoCard } from "@/components/gallery-photo-card";
import { buttonVariants } from "@/components/ui/button";
import { getGalleryPhotos } from "@/lib/queries";
import type { Locale } from "@/i18n/routing";

export async function GalleryPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.galeria");
  const tc = await getTranslations("common");
  /**
   * Posições alternadas (2ª, 4ª, 6ª), não as três primeiras: a Experiência e a
   * /galeria abrem com fotos diferentes, e a ordem cadastrada reserva essas
   * posições para salão e serviço — uma prévia com três pratos seria só um eco
   * do topo da galeria. Abaixo de seis fotos o filtro deixaria a seção quase
   * vazia, então aí vale o começo da lista.
   */
  const all = await getGalleryPhotos(locale);
  const photos = (all.length >= 6 ? all.filter((_, i) => i % 2 === 1) : all).slice(
    0,
    3,
  );

  if (photos.length === 0) return null;

  return (
    <Section id="galeria">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          align="left"
        />
        <Link
          href="/galeria"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {tc("viewAllGallery")}
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <Reveal key={photo.id} delay={(i % 3) * 90} className="h-full">
            <GalleryPhotoCard photo={photo} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
