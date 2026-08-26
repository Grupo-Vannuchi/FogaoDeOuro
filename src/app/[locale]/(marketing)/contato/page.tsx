import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MessageCircle, MapPin, Clock, Star } from "lucide-react";
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
  // O horário já existe no catálogo em dois lugares; reaproveitar evita uma
  // terceira cópia que sairia do ar sozinha na próxima mudança de expediente.
  const tf = await getTranslations("footer");
  const { contact } = siteConfig;

  const whatsapp = whatsappLink();
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`;

  /**
   * Uma linha por canal, sem caixa. A página já tem os campos do formulário
   * logo acima, cada um com sua moldura; repetir molduras aqui embaixo fazia a
   * seção competir com ele em vez de complementá-lo. Fio fino entre as linhas
   * basta para separar, e o dado ganha o peso que o card tirava dele.
   */
  const canais: {
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
    // O horário vem do catálogo onde já existia: uma terceira cópia sairia do
    // ar sozinha na próxima mudança de expediente.
    { icon: Clock, label: t("labels.hours"), value: tf("hours") },
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
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            {t("infoTitle")}
          </h2>

          <ul className="mt-8 border-t border-border">
            {canais.map((canal) => {
              const conteudo = (
                <>
                  <span className="flex items-center gap-3 text-sm text-muted-foreground">
                    <canal.icon className="size-4 shrink-0 text-brand" aria-hidden />
                    {canal.label}
                  </span>
                  <span className="text-pretty ps-7 sm:ps-0 sm:text-right">
                    {canal.value}
                  </span>
                </>
              );

              // A linha inteira é o alvo quando há para onde ir: no celular,
              // acertar o texto do telefone é mais difícil que acertar a linha.
              return (
                <li key={canal.label} className="border-b border-border">
                  {canal.href ? (
                    <a
                      href={canal.href}
                      target={canal.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 py-4 transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                    >
                      {conteudo}
                    </a>
                  ) : (
                    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      {conteudo}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

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
