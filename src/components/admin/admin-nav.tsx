"use client";

import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  Sparkles,
  Info,
  Building2,
  Quote,
  Users,
  BarChart3,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", key: "projects", icon: FolderKanban, exact: false },
  { href: "/admin/services", key: "services", icon: Sparkles, exact: false },
  { href: "/admin/informations", key: "informations", icon: Info, exact: false },
  { href: "/admin/clients", key: "clients", icon: Building2, exact: false },
  { href: "/admin/testimonials", key: "testimonials", icon: Quote, exact: false },
  { href: "/admin/team", key: "team", icon: Users, exact: false },
  { href: "/admin/stats", key: "stats", icon: BarChart3, exact: false },
  { href: "/admin/leads", key: "leads", icon: Inbox, exact: false },
] as const;

export function AdminNav({
  badges,
}: {
  /** Optional count badge per nav key (e.g. { funnels: 12 }). */
  badges?: Partial<Record<string, number>>;
}) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const count = badges?.[item.key] ?? 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            <span className="flex-1">{t(item.key)}</span>
            {count > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand/15 px-1.5 text-xs font-semibold text-brand tabular-nums">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
