import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MessageCircle, MapPin, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/forms/contact-form";
import { ReserveButton } from "@/components/reserve-button";
import { buttonVariants } from "@/components/ui/button";
import { fullAddress, phoneLink, siteConfig, whatsappLink } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
    ...localeMetadata(locale, "/contato"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tc = await getTranslations("common");
  const { contact } = siteConfig;

  const whatsapp = whatsappLink();
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`;

  const channels: {
    icon: typeof Mail;
    label: string;
    value: string;
    href?: string;
  }[] = [
    { icon: Mail, label: t("labels.email"), value: contact.email, href: `mailto:${contact.email}` },
    { icon: Phone, label: t("labels.phone"), value: contact.phone, href: phoneLink() },
    // Only listed once a number exists — see `hasWhatsapp()` in the site config.
    ...(whatsapp
      ? [
          {
            icon: MessageCircle,
            label: t("labels.whatsapp"),
            value: contact.whatsapp.display,
            href: whatsapp,
          },
        ]
      : []),
    // O endereço continua clicável e abre o Maps; o mapa embutido saiu daqui
    // porque o rodapé já carrega um, algumas centenas de pixels abaixo.
    {
      icon: MapPin,
      label: t("labels.address"),
      value: `${contact.address.street}, ${contact.address.city}/${contact.address.region}`,
      href: mapsLink,
    },
  ];

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* O formulário sozinho, em largura de leitura. Ele já era o assunto da
          página; dividir a linha com a coluna de contatos deixava um vão à
          direita assim que o formulário terminava. */}
      <Section>
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </Section>

      {/* Os canais viram uma faixa abaixo do formulário: em grade eles ocupam a
          largura inteira, que é justamente o espaço que sobrava. */}
      <Section className="border-t border-border bg-muted/30">
        <h2 className="text-balance text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {t("infoTitle")}
        </h2>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => (
            <li
              key={channel.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
                <channel.icon className="size-5" aria-hidden />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {channel.label}
              </p>
              {channel.href ? (
                <a
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-pretty text-sm transition-colors hover:text-brand"
                >
                  {channel.value}
                </a>
              ) : (
                <p className="text-pretty text-sm">{channel.value}</p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ReserveButton size="lg" />
          {/* Convite para avaliar no Google. Sai do config, nunca escrito aqui,
              e só aparece quando há URL — sem perfil, sem botão. */}
          {siteConfig.reviewUrl ? (
            <a
              href={siteConfig.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Star className="size-5" aria-hidden />
              {tc("reviewCta")}
            </a>
          ) : null}
        </div>
      </Section>
    </>
  );
}
