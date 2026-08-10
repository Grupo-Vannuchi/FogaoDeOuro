import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MenuCategoryForm } from "@/components/admin/menu-category-form";
import { getMenuCategoryById } from "@/lib/admin-queries";
import { categoryToForm } from "@/lib/menu-form";
import { localize } from "@/lib/content";
import { resolveLocale } from "@/i18n/routing";

export default async function EditMenuCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations("admin.cardapio");

  const category = await getMenuCategoryById(id);
  if (!category) notFound();

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
        <h1 className="text-2xl font-bold tracking-tight">
          {t("editCategoryTitle", { name: localize(category.name, locale) })}
        </h1>
      </div>

      <MenuCategoryForm
        mode="edit"
        categoryId={category.id}
        defaultValues={categoryToForm(category)}
      />
    </div>
  );
}
