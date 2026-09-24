import { getTranslations, setRequestLocale } from "next-intl/server";
import { AttributionCapture } from "@/components/attribution-capture";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/json-ld";
import { getInformations } from "@/lib/queries";
import { resolveLocale } from "@/i18n/routing";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);

  const t = await getTranslations("nav");

  // Sem o dropdown de categorias, o cabeçalho não precisa mais delas — uma
  // consulta a menos em toda página do site.
  //
  // `featuredOnly` desde 24/09: o menu listava as 103 novidades, e ~100 delas
  // são páginas de SEO local ("restaurante perto do Gonzaga"). Elas continuam
  // publicadas, no sitemap e listadas em `/novidades` — só saem do menu, que
  // é onde viravam ruído. O cliente pediu apenas as novidades de verdade ali.
  //
  // O filtro usa `featured`, que já existia no model e no formulário do admin
  // sem nenhum consumidor: marcar uma novidade como destaque não fazia nada.
  // Agora faz, e é o próprio admin que controla quem aparece — sem lista de
  // slugs no código, que envelheceria na primeira novidade nova.
  const informations = await getInformations(locale, { featuredOnly: true });

  const informationLinks = informations.map((i) => ({
    slug: i.slug,
    title: i.title,
    icon: i.icon,
  }));

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      {/*
        Primeiro elemento focável da página. Sem ele, quem navega por teclado
        atravessa o cabeçalho inteiro — seis itens de menu, o suspenso de
        novidades e o botão de contato — a cada página, e a cada navegação de
        novo. Critério WCAG 2.4.1, nível A.

        Fica invisível até receber foco: `sr-only` o esconde de quem enxerga sem
        escondê-lo do leitor de tela, e `focus:not-sr-only` o traz de volta à
        tela no instante em que o Tab chega nele — um link que nem aparece ao
        ser focado não ajuda quem enxerga e navega por teclado, que é a maior
        parte de quem usa isto.
      */}
      <a
        href="#conteudo"
        className="sr-only rounded-md focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground"
      >
        {t("skipToContent")}
      </a>
      <Header informationLinks={informationLinks} />
      {/* `tabIndex={-1}` deixa o alvo receber foco por programa (o salto do
          link acima) sem entrar na ordem de tabulação. Sem ele o navegador
          rola até a âncora mas o foco continua no link: o Tab seguinte volta
          para o cabeçalho, e o pulo não pulou nada. */}
      <main id="conteudo" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsappButton />
      {/* Sem Vercel Analytics / Speed Insights: era infraestrutura da agência,
          não do restaurante. Se um dia entrar, o parágrafo correspondente da
          Política de Privacidade (`src/content/legal.ts`) precisa voltar junto —
          declarar a coleta é obrigação de LGPD, não cortesia. */}
      <AttributionCapture />
    </>
  );
}
