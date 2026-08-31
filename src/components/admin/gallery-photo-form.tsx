"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Link, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import {
  photoFormToInput,
  type GalleryPhotoFormValues,
} from "@/lib/gallery-form";
import {
  createGalleryPhoto,
  updateGalleryPhoto,
  type GalleryActionResult,
} from "@/app/actions/gallery";

const localeLabel = (locale: string) => locale.toUpperCase();

export function GalleryPhotoForm({
  mode,
  photoId,
  defaultValues,
}: {
  mode: "create" | "edit";
  photoId?: string;
  defaultValues: GalleryPhotoFormValues;
}) {
  const t = useTranslations("admin.galeria");
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
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GalleryPhotoFormValues>({ defaultValues });

  /*
   * ⚠️ O `try/catch` é o caso em que a ação NÃO CHEGA A RESPONDER — rede caída,
   * servidor reiniciando, publicação no meio da requisição. A resposta
   * `{ ok: false }` já era tratada; esta não era. Sem o `catch`,
   * `setServerError` nunca roda: o react-hook-form devolve `isSubmitting` a
   * false no seu próprio `finally` e RELANÇA, então o botão destrava e a tela
   * não muda em nada. Quem estava cadastrando conclui que salvou, sai da tela,
   * e o registro não existe.
   */
  async function onSubmit(values: GalleryPhotoFormValues) {
    if (enviando.current) return;
    enviando.current = true;
    try {
      setServerError(null);
      const input = photoFormToInput(values);
      const result: GalleryActionResult =
        mode === "edit" && photoId
          ? await updateGalleryPhoto(photoId, input)
          : await createGalleryPhoto(input);

      if (result.ok) {
        router.push("/admin/galeria");
        router.refresh();
      } else {
        setServerError(t("errorUnknown"));
      }
    } catch {
      setServerError(t("errorUnknown"));
    } finally {
      enviando.current = false;
    }
  }

  return (
    <form onSubmit={(evento) => handleSubmit(onSubmit)(evento)} className="flex flex-col gap-8" noValidate>
      {/* Basics */}
      <fieldset className="rounded-xl border border-border bg-card p-5">
        <legend className="px-1 text-sm font-semibold">{t("sectionBasics")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUploadField
              id="image"
              label={t("image")}
              hint={t("imageHint")}
              preset="gallery"
              value={watch("image") ?? ""}
              onChange={(v) => setValue("image", v, { shouldDirty: true })}
            />
          </div>
          <div>
            <Label htmlFor="order">{t("order")}</Label>
            <Input id="order" type="number" inputMode="numeric" {...register("order")} />
            <p className="mt-1 text-xs text-muted-foreground">{t("orderHint")}</p>
          </div>
        </div>
      </fieldset>

      {/* Bilingual content, one block per locale */}
      {locales.map((locale) => (
        <fieldset key={locale} className="rounded-xl border border-border bg-card p-5">
          <legend className="px-1 text-sm font-semibold">
            {t("sectionContent", { locale: localeLabel(locale) })}
          </legend>
          <div>
            <Label htmlFor={`caption-${locale}`}>{t("caption")}</Label>
            <Textarea
              id={`caption-${locale}`}
              aria-invalid={Boolean(errors.caption?.[locale])}
              {...register(`caption.${locale}` as const)}
            />
            <FieldError>{errors.caption?.[locale]?.message}</FieldError>
            <p className="mt-1 text-xs text-muted-foreground">{t("captionHint")}</p>
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
          href="/admin/galeria"
          className="inline-flex h-13 items-center px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
