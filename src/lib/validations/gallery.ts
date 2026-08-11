import { z } from "zod";
import { locales, type Locale } from "@/i18n/routing";

/**
 * Validação do editor da galeria. Uma foto tem imagem (obrigatória), legenda
 * opcional e os flags de ordem/publicação.
 *
 * O formulário do cliente coleta valores planos e os mapeia para esta forma
 * antes de enviar; a server action revalida com o mesmo schema, como boundary.
 */

/** Opcional em todos os locales — a legenda pode ficar em branco. */
function optionalLocalizedText(max: number) {
  return z.object(
    Object.fromEntries(
      locales.map((l) => [l, z.string().trim().max(max)]),
    ) as Record<Locale, z.ZodString>,
  );
}

export const galleryPhotoSchema = z.object({
  image: z.string().trim().url().max(500),
  caption: optionalLocalizedText(200),
  order: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});

export type GalleryPhotoInput = z.infer<typeof galleryPhotoSchema>;
