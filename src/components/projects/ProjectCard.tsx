import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { NodeArt } from "#/components/deepmind/NodeArt"
import { cn } from "#/lib/utils"

export type ProjectCardItem = {
  id: string
  title: string
  slug: string
  description: string
  coverImage?: string | null
  technologies: string[]
  category: { name: string; slug: string } | null
  githubUrl: string | null
  demoUrl: string | null
  featured?: boolean
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED"
}

type ProjectCardProps = {
  project: ProjectCardItem
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const meta = [project.category?.name, project.technologies.slice(0, 3).join(", ")]
    .filter(Boolean)
    .join("  ·  ")

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className={cn(
        "group block rounded-[1.5rem] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--lab-bg)]",
        className,
      )}
    >
      <div className="dm-media aspect-[16/9] transition-colors duration-300 group-hover:border-[var(--lab-line-strong)]">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <NodeArt seed={project.slug} />
        )}
      </div>
      <div className="mt-5">
        <h3 className="dm-card-title">{project.title}</h3>
        <p className="dm-body mt-2 line-clamp-3">{project.description}</p>
      </div>
      <p className="mt-4 flex items-center justify-between gap-4 text-sm text-[var(--lab-ink-soft)]">
        <span className="truncate">{meta}</span>
        <span className="inline-flex shrink-0 items-center gap-1 font-medium text-[var(--lab-ink)] transition-colors group-hover:text-[var(--lab-orange)]">
          Learn more
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </p>
    </Link>
  )
}
