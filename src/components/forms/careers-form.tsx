"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { submitCareerLead } from "@/app/actions/leads";
import { readAttribution } from "@/lib/attribution";
import { careerSchema, type CareerInput } from "@/lib/validations/lead";

export function CareersForm() {
  const t = useTranslations("careers.form");
  const tv = useTranslations("validation");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const schema = careerSchema({
    nameMin: tv("nameMin"),
    emailInvalid: tv("emailInvalid"),
    messageMin: tv("messageMin"),
    required: tv("required"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CareerInput>({ resolver: zodResolver(schema) });

  async function onSubmit(data: CareerInput) {
    setStatus("idle");
    const result = await submitCareerLead(
      { ...data, ...readAttribution() },
      locale,
    );
    if (result.ok) {
      reset();
      setStatus("success");
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center"
      >
        <CheckCircle2 className="size-10 text-brand" />
        <p className="text-pretty">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Honeypot — hidden from humans; bots fill it and get dropped server-side. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] size-0 opacity-0"
        {...register("hp")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
        </div>
        <div>
          <Label htmlFor="role">{t("role")}</Label>
          <Input id="role" {...register("role")} />
        </div>
      </div>

      <div>
        <Label htmlFor="portfolio">{t("portfolio")}</Label>
        <Input
          id="portfolio"
          type="url"
          placeholder="https://"
          aria-invalid={Boolean(errors.portfolio)}
          {...register("portfolio")}
        />
        <FieldError>{errors.portfolio?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea
          id="message"
          placeholder={t("messagePlaceholder")}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
        <FieldError>{errors.message?.message}</FieldError>
      </div>

      {status === "error" ? (
        <p role="alert" className="text-sm text-red-500">
          {t("error")}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting} className="sm:self-start">
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
