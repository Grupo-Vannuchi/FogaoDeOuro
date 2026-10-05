import { getTranslations } from "next-intl/server";
import { fillYears, yearsInBusiness } from "@/config/site";
import { HeroCarousel, type HeroSlide } from "@/components/sections/hero-carousel";

/**
 * Hero carousel background images — self-hosted under `/public/hero` so
 * `next/image` serves optimized AVIF/WebP from the SAME origin (faster LCP than
 * fetching from a remote host). One per slide, matched by index to the copy in
 * `home.hero.slides`.
 *
 * Authorial photography delivered by the client, one per slide and matched to
 * that slide's copy — seis desde 24/09: a ilha flambada na abertura, a
 * rotisseria em vídeo para a brasa, as cubas do buffet, o prato de massa para
 * a ilha, o pudim para a sobremesa e o salão para fechar. No stock imagery —
 * the brief requires the restaurant's own photos, and the previous brand's
 * shots literally carried its logo in frame.
 *
 * Sources were 1600x900 JPEG (323–489 KB), re-encoded to WebP at q=80, which
 * lands each file in the ~100–230 KB band this carousel budgets for. Keep new
 * photos in that band: slide 1 is the home page LCP, and a heavy first frame is
 * paid for on every cold visit.
 */
const slideImages: string[] = [
  // Slide 1 é foto: a flambada parada, com as tigelas de ingredientes ao lado,
  // mostra a ilha inteira — o vídeo que estava aqui era um plano fechado e
  // escuro, onde só se via a chama.
  "/hero/slide-1.webp",
  // O do slide 2 é o pôster do vídeo: o quadro tem de ser do próprio vídeo,
  // senão o hero "pula" de uma cena para outra ao começar.
  "/hero/slide-2-poster.webp",
  // 3 e 4 entraram em 24/09 com o carrossel indo de quatro para seis slides.
  // Nomes por ASSUNTO, não por posição: `slide-3`/`slide-4` abaixo já não
  // estão nas posições 3 e 4, e é exatamente por isso que nome posicional
  // envelhece. Não renomeei os antigos para não trocar arquivo publicado à
  // toa — os comentários dizem o que cada um é.
  //
  // O buffet é 1800×600, e é o único fora do 16:9 do resto. Foi deliberado:
  // recortar para 16:9 daria 1067×600, e aí cobrir uma tela grande pediria
  // ampliar 1,8×. Inteiro, o `object-cover` corta as laterais e usa a altura
  // cheia — menos ampliação, mesmo sendo a proporção "errada".
  "/hero/slide-buffet.webp",
  "/hero/slide-massas.webp",
  // O pudim (era a posição 4) e o salão (era a 3), agora fechando o carrossel.
  "/hero/slide-4.webp",
  "/hero/slide-3.webp",
  // O sétimo entrou em 05/10/2026, com o vídeo do cliente. É o PÔSTER dele —
  // primeiro quadro do próprio arquivo, pela mesma razão do slide 2.
  "/hero/slide-servindo-poster.webp",
];

/**
 * Vídeo de fundo, casado por índice com a copy. Só o slide 2 tem.
 *
 * As carnes girando na rotisseria são movimento que foto não entrega. Os
 * demais são cenas paradas — flambada, salão e sobremesa —, e vídeo ali só
 * custaria banda.
 *
 * A imagem do mesmo índice vira o pôster, e é ela quem pinta primeiro.
 */
const slideVideos: (string | undefined)[] = [
  undefined,
  "/hero/slide-2.mp4",
  undefined,
  undefined,
  undefined,
  undefined,
  // Segundo vídeo, no fecho do carrossel. O original do cliente tinha 29,5s,
  // 1080x1350 (retrato, de Instagram), 15,5 Mbps e 57 MB — e os últimos ~7
  // segundos eram a animação da logo, que no hero colidiria com o título por
  // cima e repetiria a marca que já está no cabeçalho.
  //
  // Daqui saiu o trecho de 12s a 20s: as travessas do buffet e alguém se
  // servindo. Oito segundos porque o slide só fica SETE na tela antes de o
  // carrossel virar — vídeo mais longo seria banda que ninguém chega a ver,
  // e `loop` cobre quem pausa no hover. Recortado 16:9 do centro, reescalado
  // para 1280x720 (o mesmo do slide 2) e sem faixa de áudio, que o player
  // silencia de qualquer forma. 57 MB viraram 1,05 MB.
  //
  // O buffet e não as carnes: o slide 2 já são as carnes girando, e dois
  // vídeos do mesmo assunto no mesmo carrossel leem como repetição.
  "/hero/slide-servindo.mp4",
];

export async function Hero() {
  const t = await getTranslations("home.hero");
  const copy = t.raw("slides") as { title: string; subtitle: string }[];

  const slides: HeroSlide[] = copy.map((slide, i) => ({
    title: slide.title,
    // The eyebrow computes the age from `foundedYear`; a slide that hardcoded it
    // would drift out of sync every January and contradict the badge sitting
    // right above it.
    subtitle: fillYears(slide.subtitle),
    image: slideImages.length
      ? slideImages[i % slideImages.length]
      : undefined,
    video: slideVideos[i],
  }));

  return (
    <HeroCarousel
      slides={slides}
      eyebrow={t("eyebrow", { years: yearsInBusiness() })}
      primaryCta={t("primaryCta")}
      secondaryCta={t("secondaryCta")}
      labels={{
        carousel: t("carouselLabel"),
        prev: t("prevSlide"),
        next: t("nextSlide"),
        goTo: slides.map((_, i) => t("goToSlide", { n: i + 1 })),
      }}
    />
  );
}
