import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/project-card";
import { buttonVariants } from "@/components/ui/button";
import { getProjects } from "@/lib/queries";
import type { Locale } from "@/i18n/routing";

export async function PortfolioPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.portfolio");
  const tc = await getTranslations("common");
  const projects = await getProjects(locale, { featuredOnly: true, take: 3 });

  if (projects.length === 0) return null;

  return (
    <Section id="portfolio">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          align="left"
        />
        <Link
          href="/galeria"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {tc("viewAllProjects")}
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.id} delay={(i % 3) * 90} className="h-full">
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
