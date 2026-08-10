import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus, Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { MenuCategoryDeleteButton } from "@/components/admin/menu-category-delete-button";
import { getAdminMenu } from "@/lib/admin-queries";
import { localize } from "@/lib/content";
import { resolveLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default async function AdminCardapioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("admin.cardapio");
  const categories = await getAdminMenu();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Link
          href="/admin/cardapio/categorias/new"
          className={buttonVariants({ size: "md" })}
        >
          <Plus className="size-4" />
          {t("newCategory")}
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {localize(category.name, locale)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        category.published
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {category.published ? t("statusPublished") : t("statusDraft")}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {localize(category.description, locale)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/cardapio/categorias/${category.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                    {t("edit")}
                  </Link>
                  <MenuCategoryDeleteButton
                    id={category.id}
                    name={localize(category.name, locale)}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{t("emptyItems")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
