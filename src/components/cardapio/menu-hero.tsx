import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

/**
 * Abertura do cardápio digital: o salão ao fundo, a marca por cima.
 *
 * Quem chega aqui escaneou um código na mesa e ainda não viu página nenhuma do
 * site — este é o primeiro contato com a marca, e por isso a identidade vem
 * antes da lista. Estático, não carrossel: a home tem quatro slides porque
 * conta uma história; aqui o objetivo é o cliente reconhecer onde está e descer
 * para o cardápio.
 *
 * Usa `logo-dark.svg`, o corte com a tagline em creme. Ele já existia no
 * projeto para o card de compartilhamento (que também tem fundo escuro) e é o
 * único que sobrevive sobre a foto; o corte claro tem tagline marrom, desenhada
 * para o creme do site.
 *
 * O horário entra logo abaixo porque é a segunda pergunta de quem está na mesa
 * — e vem do catálogo onde já existe, sem virar mais uma cópia.
 *
 * O fundo é a foto do buffet que abria a antiga vitrine: quando ela saiu do
 * site, a imagem veio para cá. Faz mais sentido do que o salão — quem abre esta
 * página quer ver comida, não mesa posta.
 */
export async function MenuHero() {
  const t = await getTranslations("footer");

  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/ambiente/buffet.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Véu escuro para a marca clara ter contraste sobre qualquer parte da
          foto. Mais fechado nas bordas, mais aberto no centro, onde o salão
          aparece. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#171615]/85 via-[#171615]/70 to-[#171615]/90"
      />

      <Container className="relative flex flex-col items-center gap-4 py-14 text-center sm:gap-5 sm:py-20">
        {/* `next/image` recusa SVG sem afrouxar a regra para todo domínio
            remoto, e um SVG não tem o que otimizar — mesma decisão do <Logo>. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- ver acima */}
        <img
          src="/brand/logo-dark.svg"
          alt={siteConfig.name}
          width={199}
          height={144}
          className="h-24 w-auto sm:h-32"
        />
        <p className="text-sm font-medium uppercase tracking-widest text-[#EFE9C2]/80 sm:text-base">
          {t("hours")}
        </p>
      </Container>
    </section>
  );
}
