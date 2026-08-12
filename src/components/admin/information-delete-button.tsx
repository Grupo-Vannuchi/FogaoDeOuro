"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { deleteInformation } from "@/app/actions/informations";

export function InformationDeleteButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const t = useTranslations("admin.novidades");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm(t("deleteConfirm", { title }))) return;
    startTransition(async () => {
      await deleteInformation(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      aria-label={t("delete")}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-60"
    >
      <Trash2 className="size-4" />
      {t("delete")}
    </button>
  );
}
