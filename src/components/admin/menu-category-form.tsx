"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { Link, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import {
  categoryFormToInput,
  type MenuCategoryFormValues,
} from "@/lib/menu-form";
import {
  createMenuCategory,
  updateMenuCategory,
  type MenuActionResult,
} from "@/app/actions/menu";

const localeLabel = (locale: string) => locale.toUpperCase();

export function MenuCategoryForm({
  mode,
  categoryId,
  defaultValues,
}: {
  mode: "create" | "edit";
  categoryId?: string;
  defaultValues: MenuCategoryFormValues;
}) {
  const t = useTranslations("admin.cardapio");
  const tv = useTranslations("validation");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  /*
   * A contrapartida de trocar `disabled` por `aria-disabled` no botão: o clique
   * continua chegando durante o envio. Sem esta guarda, dois cliques viram dois
   * registros iguais.
   */
  const enviando = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MenuCategoryFormValues>({ defaultValues });

  /*
   * ⚠️ O `try/catch` é o caso em que a ação NÃO CHEGA A RESPONDER — rede caída,
   * servidor reiniciando, publicação no meio da requisição. A resposta
   * `{ ok: false }` já era tratada; esta não era. Sem o `catch`,
   * `setServerError` nunca roda: o react-hook-form devolve `isSubmitting` a
   * false no seu próprio `finally` e RELANÇA, então o botão destrava e a tela
   * não muda em nada. Quem estava cadastrando conclui que salvou, sai da tela,
   * e o registro não existe.
   */
  async function onSubmit(values: MenuCategoryFormValues) {
    if (enviando.current) return;
    enviando.current = true;
    try {
      setServerError(null);
      const input = categoryFormToInput(values);
      const result: MenuActionResult =
        mode === "edit" && categoryId
          ? await updateMenuCategory(categoryId, input)
          : await createMenuCategory(input);

      if (result.ok) {
        router.push("/admin/cardapio");
        router.refresh();
      } else if (result.error === "duplicate") {
        setServerError(t("errorDuplicate"));
      } else {
        setServerError(t("errorUnknown"));
      }
    } catch {
      setServerError(t("errorUnknown"));
    } finally {
      enviando.current = false;
    }
  }

  const required = { required: tv("required") };

  return (
    <form onSubmit={(evento) => handleSubmit(onSubmit)(evento)} className="flex flex-col gap-8" noValidate>
      {/* Basics */}
      <fieldset className="rounded-xl border border-border bg-card p-5">
        <legend className="px-1 text-sm font-semibold">{t("sectionBasics")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="slug">{t("categorySlug")}</Label>
            <Input
              id="slug"
              placeholder="entradas"
              aria-invalid={Boolean(errors.slug)}
              {...register("slug", required)}
            />
            <FieldError>{errors.slug?.message}</FieldError>
            <p className="mt-1 text-xs text-muted-foreground">{t("categorySlugHint")}</p>
          </div>
          <div>
            <Label htmlFor="order">{t("order")}</Label>
            <Input id="order" type="number" inputMode="numeric" {...register("order")} />
          </div>
        </div>
      </fieldset>

      {/* Bilingual content, one block per locale */}
      {locales.map((locale) => (
        <fieldset key={locale} className="rounded-xl border border-border bg-card p-5">
          <legend className="px-1 text-sm font-semibold">
            {t("sectionContent", { locale: localeLabel(locale) })}
          </legend>
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor={`name-${locale}`}>{t("categoryName")}</Label>
              <Input
                id={`name-${locale}`}
                aria-invalid={Boolean(errors.name?.[locale])}
                {...register(`name.${locale}` as const, locale === locales[0] ? required : {})}
              />
              <FieldError>{errors.name?.[locale]?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor={`description-${locale}`}>{t("categoryDescription")}</Label>
              <Textarea
                id={`description-${locale}`}
                aria-invalid={Boolean(errors.description?.[locale])}
                {...register(`description.${locale}` as const)}
              />
              <FieldError>{errors.description?.[locale]?.message}</FieldError>
            </div>
          </div>
        </fieldset>
      ))}

      {/* Flags */}
      <fieldset className="rounded-xl border border-border bg-card p-5">
        <legend className="px-1 text-sm font-semibold">{t("sectionVisibility")}</legend>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="size-4 accent-brand" {...register("published")} />
          {t("published")}
        </label>
      </fieldset>

      {serverError ? (
        <p role="alert" className="text-sm text-danger">
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" aria-disabled={isSubmitting}>
          {isSubmitting ? t("saving") : t("save")}
        </Button>
        <Link
          href="/admin/cardapio"
          className="inline-flex h-13 items-center px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
