import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { getMenuCategoryOptions } from "@/lib/admin-queries";
import { emptyMenuItemForm } from "@/lib/menu-form";
import { localize } from "@/lib/content";
import { resolveLocale } from "@/i18n/routing";

export default async function NewMenuItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("admin.cardapio");

  const [categoryOptions, { categoria }] = await Promise.all([
    getMenuCategoryOptions(),
    searchParams,
  ]);
  const categories = categoryOptions.map((c) => ({
    id: c.id,
    name: localize(c.name, locale),
  }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/cardapio"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("title")}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("newItem")}</h1>
      </div>

      <MenuItemForm
        mode="create"
        categories={categories}
        defaultValues={emptyMenuItemForm(categoria ?? categories[0]?.id ?? "")}
      />
    </div>
  );
}
