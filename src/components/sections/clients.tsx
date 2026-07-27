import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { getClients } from "@/lib/queries";
import type { ClientView } from "@/lib/queries";

/** One copy of the logo row. Rendered twice to feed the seamless marquee. */
function LogoRow({
  clients,
  clone = false,
}: {
  clients: ClientView[];
  clone?: boolean;
}) {
  return (
    <ul
      aria-hidden={clone || undefined}
      className={clone ? "marquee-clone flex shrink-0" : "flex shrink-0"}
    >
      {clients.map((client, i) => {
        const logo = (
          <Image
            src={client.logoUrl}
            alt={client.name}
            // 2x the rendered height (h-20 = 80px) so logos stay sharp on
            // retina screens — bumping the CSS size alone would blur them.
            width={280}
            height={140}
            className="h-20 w-auto opacity-60 grayscale transition duration-300 hover:scale-105 hover:opacity-100 hover:grayscale-0"
          />
        );
        return (
          <li key={`${client.id}-${i}`} className="flex shrink-0 justify-center px-8">
            {client.website ? (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={client.name}
                // The cloned row is aria-hidden, so keep its links out of the tab order.
                tabIndex={clone ? -1 : undefined}
                className="inline-flex"
              >
                {logo}
              </a>
            ) : (
              logo
            )}
          </li>
        );
      })}
    </ul>
  );
}

export async function Clients() {
  const t = await getTranslations("home.clients");
  const clients = await getClients();

  if (clients.length === 0) return null;

  // Repeat the logos until one copy is wide enough to fill wide screens, so the
  // seamless loop never shows a gap when there are only a few brands.
  const repeats = Math.max(1, Math.ceil(8 / clients.length));
  const row = Array.from({ length: repeats }, () => clients).flat();

  return (
    <section className="border-y border-border py-16">
      <Container>
        <Reveal
          as="h2"
          variant="fade"
          className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground"
        >
          {t("title")}
        </Reveal>
      </Container>

      {/* Full-bleed marquee with faded edges. */}
      <div className="marquee group relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="marquee-track flex w-max">
          <LogoRow clients={row} />
          <LogoRow clients={row} clone />
        </div>
      </div>
    </section>
  );
}
