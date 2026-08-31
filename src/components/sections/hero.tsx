import { getTranslations } from "next-intl/server";
import { fillYears, yearsInBusiness } from "@/config/site";
import { HeroCarousel, type HeroSlide } from "@/components/sections/hero-carousel";

/**
 * Hero carousel background images — self-hosted under `/public/hero` so
 * `next/image` serves optimized AVIF/WebP from the SAME origin (faster LCP than
 * fetching from a remote host). One per slide, matched by index to the copy in
 * `home.hero.slides`.
 *
 * Authorial photography delivered by the client on 20/08/2026, one per slide and
 * matched to that slide.s copy: the lunch spread for "a sua melhor experiência do
 * dia", the rotisserie for "direto da brasa", the dining room for "salão amplo",
 * the pudim for "guarde um espaço para a sobremesa". No stock imagery — the brief requires the restaurant's own photos, and
 * the previous brand's shots literally carried its logo in frame.
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
  "/hero/slide-3.webp",
  "/hero/slide-4.webp",
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
