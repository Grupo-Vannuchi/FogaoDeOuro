import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, CreditCard, MapPin, Landmark } from "lucide-react";
import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeader } from "@/components/ui/section";
import { ReserveButton } from "@/components/reserve-button";
import { PhotoCarousel, type CarouselPhoto } from "@/components/photo-carousel";
import { fullAddress, siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "reservas" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    ...localeMetadata(locale, "/reservas"),
  };
}


/** One line of the "practical information" list. */
function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-pretty text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

export default async function ReservasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("reservas");

  const fotos = t.raw("photos") as CarouselPhoto[];
  const { openingHours, contact } = siteConfig;
  const hours = `${t("hoursTitle")}`;

  return (
    <>
      {/* Faixa na cor da marca: esta página é a que fecha a visita — quem
          chega aqui vem reservar —, e o creme de sempre a deixava igual às
          demais. */}
      {/* Foto no cabeçalho desde 24/09, a pedido do cliente. `salao-mesas`, e
          não `salao`: esta última abre o carrossel logo abaixo, e a mesma
          imagem duas vezes em sequência lê como falha de carregamento. */}
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        image="/ambiente/salao-mesas.webp"
        imageAlt={t("headerAlt")}
        tone="brand"
      />

      {/* 5.1 — Horários + "melhor momento para você" */}
      <Section>
        {/* Carrossel de seis fotos, a pedido do cliente em 24/09 — era uma
            foto só do salão. A mecânica vem de `ui/carousel.tsx`, a mesma da
            ilha de massas e da carta de vinhos; aqui entra só o conteúdo.

            Três destas fotos vinham dos cards de horário que saíram desta
            página no mesmo dia: elas descreviam o salão em cada faixa de
            horário, e continuam dizendo isso — só que como galeria, sem
            repetir na página o texto que vive em /experiencia.

            ⚠️ As três herdadas são 800×450, contra 1600×900 das outras. A
            largura cheia do carrossel amplia as menores em cerca de 1,5×.
            Aceitável, mas se o cliente mandar versões maiores, troque. */}
        <PhotoCarousel
          photos={fotos}
          labels={{
            carousel: t("carousel"),
            prev: t("prevPhoto"),
            next: t("nextPhoto"),
            goTo: t("goToPhoto", { n: "{n}" }),
          }}
        />
        {/* O letreiro "Segunda a sexta, das 11h às 15h" saiu daqui em 25/09
            a pedido do cliente. A informação não se perdeu: ela continua no
            subtítulo do cabeçalho desta página e no quadro de Informações
            práticas lá embaixo, que é onde se vai conferir horário. Repetida
            três vezes na mesma página, virava ruído. A chave `hoursTitle`
            segue viva — o quadro a consome. */}
        <div className="mt-12">
          <ReserveButton size="lg" />
        </div>
      </Section>

      {/* 5.2 — Reservas para grupos e eventos.

           A seção fala do salão, então o salão é o fundo — e o fundo precisa
           mostrar MESAS. Três recortes já caíram aqui: o do bambu, que sob o
           véu virava uma planta escura à esquerda e nada à direita; o do salão
           dos fundos, vetado pelo cliente por mostrar a porta do banheiro; e o
           salão comprido, trocado em 11/09 por uma foto nova do cliente.

           Esta é a foto de 11/09, **inteira, sem recorte prévio**. A primeira
           tentativa entregou uma tira de 1800×561 já cortada — e a seção corta
           de novo, com `object-cover`. Corte duplo sobra um pedaço espremido
           do meio, que não lembra em nada a foto original: o cliente olhou o
           localhost e disse, com razão, que a imagem não tinha trocado. Ela
           tinha; estava irreconhecível.

           Agora o arquivo é o 16:9 completo e quem enquadra é só o
           `object-cover`, uma vez.

           O `min-h` existe pelo mesmo motivo: com a altura padrão a faixa
           ficava em ~390px e mostrava uma tira. **É `min-h` e não `py` de
           propósito** — a primeira tentativa passou `py-28 sm:py-40` e não
           surtiu efeito nenhum, porque o `Section` já traz `sm:py-section` e
           o `twMerge` não reconhece o espaçamento customizado `section` como
           classe de padding: não desempata, e as duas sobrevivem. `min-h` não
           colide com nada. O `flex items-center` centraliza o conteúdo na
           altura nova.

           **Contraste medido no composto renderizado**, com o texto escondido
           e amostrando a cor que sobra sob as pontas e o meio de cada linha:
           10,6:1 em 1920, 10,5:1 em 1440 e 7,9:1 em 390 — os três bem acima
           do mínimo de 4,5.

           **E a medição tem de ser feita com o cache de imagens limpo.** O
           Next guarda as versões otimizadas em `.next/dev/cache/images`, e
           trocar o arquivo em `public/` NÃO invalida essas entradas. Cheguei
           a conferir por `curl` em `w=1920`, que tinha sido regerada, e dei o
           assunto por encerrado — enquanto a página pedia `w=3840`, que
           continuava servindo o recorte antigo. Eram 80 entradas velhas. Quem
           trocar uma imagem aqui: `rm -rf .next/dev/cache/images` antes de
           olhar, senão você mede a versão errada e acredita nela.

           Os números da foto anterior eram outros, e os do véu chapado
           também. Quem trocar a imagem ou mexer no gradiente tem de medir de
           novo, não herdar estes.

           A foto entra por trás do conteúdo com `fill`: o `Container` não é
           posicionado, então ela se resolve contra a `<section>`, que ganhou
           `relative` — e sangra de ponta a ponta em vez de respeitar as
           margens do texto.

           `alt=""` porque é decoração: o texto ao lado já diz "salão de 180
           lugares", e um leitor de tela repetindo isso só atrapalha. */}
      <Section className="relative isolate flex min-h-[30rem] items-center overflow-hidden border-y border-border sm:min-h-[36rem]">
        <Image
          src="/ambiente/salao-mesas.webp"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="-z-20 object-cover"
        />
        {/* O véu não é estética: sem ele o texto claro cai sobre a parede
            creme da foto e o contraste despenca.

            Era `bg-[#171615]/80` chapado, e a 80% ele engolia a foto inteira —
            trocar a imagem não mudava nada na tela, que foi exatamente a
            reclamação de 11/09: "a imagem não está nem no localhost". Ela
            estava; não dava para ver.

            Agora é gradiente horizontal: 78% na faixa central, onde o texto
            cai, e 40% nas laterais, onde não há texto nenhum. O contraste no
            miolo fica igual ao de antes e a foto reaparece nas bordas.

            A rampa termina aos 22% de propósito. A coluna de texto é
            `max-w-3xl` centralizada e chega a 23% da largura num monitor
            comum; se a rampa subisse mais para dentro, a primeira letra do
            parágrafo cairia na parte clara. Quem alargar a coluna precisa
            puxar esses 22% para fora. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(23,22,21,0.40) 0%, rgba(23,22,21,0.78) 22%, rgba(23,22,21,0.78) 78%, rgba(23,22,21,0.40) 100%)",
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("groupsTitle")}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-white">
            {t("groupsCopy")}
          </p>
          <div className="mt-8 flex justify-center">
            {/* Rótulo próprio, e não o `makeReservation` comum: esta seção
                vende o SALÃO para um evento, não uma mesa para o almoço, e o
                mesmo botão em dois papéis diferentes confunde o que se está
                pedindo. A chave comum segue servindo os outros usos. */}
            <ReserveButton
              size="lg"
              message={t("groupsMessage")}
              label={t("groupsButton")}
            />
          </div>
        </div>
      </Section>

      {/* 5.3 — Informações práticas */}
      <Section>
        <SectionHeader title={t("practicalTitle")} align="left" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <Fact icon={Clock} label={t("hoursLabel")} value={hours} />
          <Fact icon={CreditCard} label={t("paymentsLabel")} value={t("payments")} />
          <Fact icon={MapPin} label={t("addressLabel")} value={fullAddress()} />
          <Fact icon={Landmark} label={t("accessLabel")} value={t("access")} />
        </div>
        <p className="sr-only">
          {`${openingHours.opens}–${openingHours.closes} · ${contact.phone}`}
        </p>
      </Section>
    </>
  );
}
