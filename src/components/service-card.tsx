import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import type { ServiceView } from "@/lib/queries";

export function ServiceCard({ service }: { service: ServiceView }) {
  return (
    <Link
      href={`/gastronomia/${service.slug}`}
      className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg focus-visible:shadow-lg"
    >
      <span className="inline-flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand transition-transform duration-300 group-hover:scale-110">
        <Icon name={service.icon} className="size-6" />
      </span>
      <h3 className="flex items-start justify-between gap-2 text-lg font-semibold">
        <span className="text-balance">{service.title}</span>
        <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
      </h3>
      <p className="text-sm text-muted-foreground">{service.description}</p>
    </Link>
  );
}
