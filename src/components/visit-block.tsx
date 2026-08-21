import { getTranslations } from "next-intl/server";
import { MapPin, Clock } from "lucide-react";
import { fullAddress } from "@/config/site";
import { ReserveButton } from "@/components/reserve-button";

/**
 * Closing block on every novidade: where the restaurant is, when it opens, and
 * the reservation CTA.
 *
 * Replaces the agency's "regions we serve" table, which listed São Paulo
 * neighbourhoods — a restaurant has one address, not a coverage area.
 *
 * Deliberately compact, and deliberately duplicating the footer: the same
 * address and hours sit a few hundred pixels below, with the map. This block is
 * not here to inform for the first time, it is here to catch a reader who just
 * finished the article and is deciding whether to come.
 *
 * Address and hours come from `siteConfig` and the catalog, never hardcoded, so
 * a change of address does not leave a stale copy at the bottom of every post.
 */
export async function VisitBlock() {
  const t = await getTranslations("novidades");
  const tReservas = await getTranslations("reservas");
  const tFooter = await getTranslations("footer");

  return (
    <section className="mt-16 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="font-serif text-2xl font-bold tracking-tight">
        {t("visitTitle")}
      </h2>

      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {tReservas("addressLabel")}
            </dt>
            <dd className="mt-0.5 text-pretty">{fullAddress()}</dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {tReservas("hoursLabel")}
            </dt>
            <dd className="mt-0.5">{tFooter("hours")}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-6">
        <ReserveButton size="lg" />
      </div>
    </section>
  );
}
