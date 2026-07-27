import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Instagram, Linkedin } from "@/components/ui/brand-icons";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { getTeam } from "@/lib/queries";
import type { Locale } from "@/i18n/routing";

const socialIcons = { instagram: Instagram, linkedin: Linkedin } as const;

export async function Team({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.team");
  const members = await getTeam(locale);

  if (members.length === 0) return null;

  return (
    <Section>
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        className="mx-auto"
      />
      <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, i) => (
          <Reveal
            as="li"
            key={member.id}
            delay={(i % 4) * 90}
            className="group flex flex-col items-center text-center"
          >
            <div className="relative size-32 overflow-hidden rounded-full bg-muted">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  sizes="128px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : null}
            </div>
            <h3 className="mt-4 font-semibold">{member.name}</h3>
            <p className="text-sm text-muted-foreground">{member.role}</p>
            <div className="mt-2 flex gap-2">
              {Object.entries(member.socials).map(([key, url]) => {
                const Icon = socialIcons[key as keyof typeof socialIcons];
                if (!Icon) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} — ${key}`}
                    className="text-muted-foreground transition-colors hover:text-brand"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
