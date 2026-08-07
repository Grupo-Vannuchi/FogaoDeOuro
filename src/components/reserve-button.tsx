import { MessageCircle, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { phoneLink, siteConfig, whatsappLink } from "@/config/site";

type Variant = "primary" | "outline" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

/**
 * The reservation CTA. Reservations happen straight in WhatsApp — there is no
 * booking backend — so this opens a wa.me deep link with a pre-filled message.
 *
 * While no WhatsApp number is configured it degrades to a `tel:` link on the
 * restaurant's landline instead of rendering a dead `wa.me/` URL. The label
 * changes with it, so the button never promises something it can't do.
 */
export async function ReserveButton({
  variant = "primary",
  size = "md",
  className,
  message,
  label,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Overrides the default pre-filled WhatsApp text (e.g. group bookings). */
  message?: string;
  /** Overrides the button label. */
  label?: string;
}) {
  const t = await getTranslations("common");
  const href = whatsappLink(message);

  if (!href) {
    return (
      <a href={phoneLink()} className={buttonVariants({ variant, size, className })}>
        <Phone className="size-5" />
        {t("callUs", { phone: siteConfig.contact.phone })}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant, size, className })}
    >
      <MessageCircle className="size-5" />
      {label ?? t("makeReservation")}
    </a>
  );
}
