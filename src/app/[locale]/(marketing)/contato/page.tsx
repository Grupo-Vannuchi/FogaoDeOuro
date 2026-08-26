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
  const tr = await getTranslations("reservas");
  const tf = await getTranslations("footer");
  const { contact } = siteConfig;

  const whatsapp = whatsappLink();
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`;

  type Canal = {
    icon: typeof Mail;
    label: string;
    value: string;
    href?: string;
  };

  /**
   * Dois blocos, agrupados pelo que a pessoa quer fazer: falar com a casa ou
   * chegar até ela. Quatro cards com uma linha cada ficavam inflados — pouca
   * informação para muito espaço. Agrupados, cada caixa tem conteúdo de verdade
   * e o horário entra sem precisar de um card só para ele.
   */
  const blocos: { title: string; itens: Canal[] }[] = [
    {
      title: t("infoTitle"),
      itens: [
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
      ],
    },
    {
      title: t("whereTitle"),
      itens: [
        // O endereço continua clicável e abre o Maps; o mapa embutido saiu daqui
        // porque o rodapé já carrega um, algumas centenas de pixels abaixo.
        {
          icon: MapPin,
          label: t("labels.address"),
          value: `${contact.address.street}, ${contact.address.city}/${contact.address.region}`,
          href: mapsLink,
        },
        { icon: Clock, label: tr("hoursLabel"), value: tf("hours") },
      ],
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
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {blocos.map((bloco) => (
            <div
              key={bloco.title}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <h2 className="font-serif text-xl font-bold tracking-tight">
                {bloco.title}
              </h2>
              <ul className="mt-5 flex flex-col gap-4">
                {bloco.itens.map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <item.icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="text-pretty text-sm transition-colors hover:text-brand"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-pretty text-sm">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
