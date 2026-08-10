import { getTranslations } from "next-intl/server";
import { LogOut, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/layout/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { logout } from "@/app/actions/auth";
import type { CurrentUser } from "@/lib/auth";
import type { Locale } from "@/i18n/routing";

export async function AdminShell({
  user,
  locale,
  children,
}: {
  user: CurrentUser;
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = await getTranslations("admin.nav");

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
        <div className="px-2 py-3">
          <Logo className="text-xl" />
        </div>
        <div className="mt-4 flex-1">
          <AdminNav />
        </div>
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            {user.name}
          </Link>
          <form action={logout.bind(null, locale)}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              {t("signOut")}
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Logo className="text-lg" />
            <form action={logout.bind(null, locale)}>
              <button
                type="submit"
                aria-label={t("signOut")}
                className="text-muted-foreground"
              >
                <LogOut className="size-5" />
              </button>
            </form>
          </div>
          <AdminNav />
        </header>
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
