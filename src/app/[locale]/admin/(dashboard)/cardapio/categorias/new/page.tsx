import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MenuCategoryForm } from "@/components/admin/menu-category-form";
import { emptyMenuCategoryForm } from "@/lib/menu-form";
import { resolveLocale } from "@/i18n/routing";

export default async function NewMenuCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("admin.cardapio");

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
        <h1 className="text-2xl font-bold tracking-tight">{t("newCategory")}</h1>
      </div>

      <MenuCategoryForm mode="create" defaultValues={emptyMenuCategoryForm()} />
    </div>
  );
}
