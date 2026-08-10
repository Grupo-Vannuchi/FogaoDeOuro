import { z } from "zod";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";

/**
 * Validação do editor de cardápio. Categoria e item.
 *
 * ⚠️ Não existe campo de preço, de propósito: a diretriz do cliente proíbe
 * publicar valores e o buffet é por quilo. Não adicione um.
 *
 * O formulário do cliente coleta valores planos e os mapeia para estas formas
 * antes de enviar; a server action revalida com o mesmo schema, como boundary.
 */

/** Constrói um validador `{ pt }`: o locale padrão é obrigatório, os demais não. */
function localizedText(max: number) {
  return z.object(
    Object.fromEntries(
      locales.map((l) => [
        l,
        l === defaultLocale
          ? z.string().trim().min(1, "Required").max(max)
          : z.string().trim().max(max),
      ]),
    ) as Record<Locale, z.ZodString>,
  );
}

/** Opcional em todos os locales — usado por descrições. */
function optionalLocalizedText(max: number) {
  return z.object(
    Object.fromEntries(
      locales.map((l) => [l, z.string().trim().max(max)]),
    ) as Record<Locale, z.ZodString>,
  );
}

const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use minúsculas, números e hífens");

const url = z.string().trim().url().max(500);

export const menuCategorySchema = z.object({
  slug,
  name: localizedText(80),
  description: optionalLocalizedText(300),
  order: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});

export const menuItemSchema = z.object({
  slug,
  categoryId: z.string().trim().min(1),
  name: localizedText(120),
  description: optionalLocalizedText(600),
  image: z.union([url, z.literal("")]),
  available: z.boolean(),
  order: z.coerce.number().int().min(0).max(9999),
  tags: z.array(z.string().trim().min(1).max(40)).max(10),
  /// 1 = segunda … 5 = sexta. O restaurante não abre no fim de semana.
  weekday: z.union([z.coerce.number().int().min(1).max(5), z.null()]),
});

export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
