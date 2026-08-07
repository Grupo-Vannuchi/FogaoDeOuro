import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ProjectCardView } from "@/lib/queries";

export function ProjectCard({ project }: { project: ProjectCardView }) {
  return (
    <Link
      href={`/galeria/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg focus-visible:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
        <h3 className="flex items-start justify-between gap-2 text-lg font-semibold">
          <span className="text-balance">{project.title}</span>
          <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
        </h3>
        <p className="text-sm text-muted-foreground">{project.summary}</p>
        {project.tags.length > 0 ? (
          <ul className="mt-auto flex flex-wrap gap-2 pt-3">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
