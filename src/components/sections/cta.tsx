import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { buttonVariants } from "@/components/ui/button";
import { ReserveButton } from "@/components/reserve-button";

export async function CTA() {
  const t = await getTranslations("home.cta");

  return (
    <section className="py-20 sm:py-section">
      <Container>
        <Reveal className="relative overflow-hidden rounded-2xl bg-brand px-6 py-16 text-center text-brand-foreground sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-2xl"
          />
          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-pretty opacity-90">
            {t("subtitle")}
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/reservas"
              className={buttonVariants({ variant: "accent", size: "lg", className: "group" })}
            >
              {t("button")}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <ReserveButton
              variant="outline"
              size="lg"
              className="border-white/40 text-brand-foreground hover:bg-white/10"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
