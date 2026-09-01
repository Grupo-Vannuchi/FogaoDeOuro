import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { GalleryPhotoView } from "@/lib/queries";

/**
 * Uma foto da galeria.
 *
 * **Sem legenda visível.** A página existe para mostrar fotos, e uma linha de
 * texto sob cada uma quebrava o ritmo da grade: só seis das vinte e três
 * tinham legenda, então a grade alternava fotos com e sem rodapé e as fileiras
 * saíam desalinhadas.
 *
 * A legenda continua no banco e continua sendo usada — como `alt`. Apagá-la
 * deixaria as vinte e três com a mesma descrição genérica para quem usa leitor
 * de tela, que é o oposto de "só as imagens".
 */
export async function GalleryPhotoCard({ photo }: { photo: GalleryPhotoView }) {
  const t = await getTranslations("galeria");
  return (
    <Image
      src={photo.image}
      alt={photo.caption || t("photoAlt")}
      width={640}
      height={480}
      className="aspect-[4/3] w-full rounded-xl object-cover"
    />
  );
}
