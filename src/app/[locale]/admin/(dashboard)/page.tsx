import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Inbox,
  UtensilsCrossed,
  Images,
  BarChart3,
  Gauge,
  ExternalLink,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardStats, getRecentLeads } from "@/lib/admin-queries";
import { resolveLocale } from "@/i18n/routing";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("admin.dashboard");

  const [user, stats, recentLeads] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    getRecentLeads(5),
  ]);

  const cards = [
    { label: t("newLeads"), value: stats.newLeads, icon: Inbox },
    { label: t("totalMenuItems"), value: stats.totalMenuItems, icon: UtensilsCrossed },
    { label: t("totalGalleryPhotos"), value: stats.totalGalleryPhotos, icon: Images },
  ];

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        {user ? (
          <p className="text-muted-foreground">
            {t("welcome", { name: user.name })}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <card.icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics lives in the Vercel dashboard (richer + free) — link out
          instead of rebuilding it here. */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-brand" />
          <h2 className="font-semibold">{t("analyticsTitle")}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("analyticsHint")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href="https://vercel.com/moraesvannuchi-debugs-projects/n8x/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:border-brand"
          >
            <span className="inline-flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              {t("analyticsVisitors")}
            </span>
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
          <a
            href="https://vercel.com/moraesvannuchi-debugs-projects/n8x/speed-insights"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:border-brand"
          >
            <span className="inline-flex items-center gap-2">
              <Gauge className="size-4 text-muted-foreground" />
              {t("analyticsPerformance")}
            </span>
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <h2 className="border-b border-border px-5 py-4 font-semibold">
          {t("recentLeads")}
        </h2>
        <ul className="divide-y divide-border">
          {recentLeads.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{lead.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {lead.email}
                </p>
              </div>
              <time
                dateTime={lead.createdAt.toISOString()}
                className="shrink-0 text-sm text-muted-foreground"
              >
                {dateFormatter.format(lead.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
