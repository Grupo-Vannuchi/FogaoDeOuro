import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/rich-text";
import { buttonVariants } from "@/components/ui/button";
import { getProjectBySlug } from "@/lib/queries";
import { resolveLocale } from "@/i18n/routing";
import { localeMetadata, localizedUrl, absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { BreadcrumbJsonLd, CreativeWorkJsonLd } from "@/components/json-ld";

type Params = { locale: string; slug: string };

// Don't prerender slugs at build — detail pages render on the first request and
// are then cached (ISR via the `projects` tag). Keeps the build small and fast.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const project = await getProjectBySlug(locale, slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    ...localeMetadata(locale, `/galeria/${slug}`, {
      images: [{ url: absoluteUrl(project.coverImage), alt: project.title }],
    }),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");
  const project = await getProjectBySlug(locale, slug);

  if (!project) notFound();

  const meta: { label: string; value: string }[] = [
    { label: t("client"), value: project.clientName },
    { label: t("category"), value: project.category },
    { label: t("year"), value: String(project.year) },
  ];

  return (
    <article>
      <CreativeWorkJsonLd
        locale={locale}
        slug={slug}
        name={project.title}
        description={project.summary}
        image={project.coverImage}
        year={project.year}
        category={project.category}
      />
      <BreadcrumbJsonLd
        items={[
          { name: siteConfig.name, url: localizedUrl(locale) },
          { name: tn("galeria"), url: localizedUrl(locale, "/galeria") },
          {
            name: project.title,
            url: localizedUrl(locale, `/galeria/${slug}`),
          },
        ]}
      />
      <div className="border-b border-border bg-muted/30">
        <Container className="py-12 sm:py-16">
          <Link
            href="/galeria"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("title")}
          </Link>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            {project.summary}
          </p>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            sizes="(min-width: 1152px) 1088px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_280px]">
          <RichText
            blocks={project.content}
            className="flex flex-col gap-5 text-pretty"
          />

          <aside className="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-8">
            <dl className="flex flex-col gap-4">
              {meta.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1 font-medium">{row.value}</dd>
                </div>
              ))}
              {project.tags.length > 0 ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("tags")}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>

        {project.gallery.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {project.gallery.map((src, i) => (
              <Reveal
                key={src}
                delay={(i % 2) * 100}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
              >
                <Image
                  src={src}
                  alt={`${project.title} — ${i + 1}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Reveal>
            ))}
          </div>
        ) : null}
      </Container>

      <Section className="bg-muted/30">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-balance text-2xl font-bold sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <Link href="/contato" className={buttonVariants({ size: "lg" })}>
            {t("ctaButton")}
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/galeria"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {tc("viewAllProjects")}
          </Link>
        </div>
      </Section>
    </article>
  );
}
