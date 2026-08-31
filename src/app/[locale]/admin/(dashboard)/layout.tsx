import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { resolveLocale } from "@/i18n/routing";

export const metadata = { robots: { index: false, follow: false } };

// Admin is always rendered per request (session + live data); never prerender.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);

  // Redirects to /admin/login when not authenticated.
  const user = await requireAdmin(locale);

  return (
    /* O catalogo completo entra AQUI, e nao na raiz: o layout de locale manda
       so a parte publica, para o visitante nao baixar os textos do painel. */
    <NextIntlClientProvider messages={await getMessages()}>
      <AdminShell user={user} locale={locale}>
        {children}
      </AdminShell>
    </NextIntlClientProvider>
  );
}
