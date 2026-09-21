import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Github, ExternalLink, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { cn } from "#/lib/utils"

export type ProjectCardItem = {
  id: string
  title: string
  slug: string
  description: string
  technologies: string[]
  category: { name: string; slug: string } | null
  githubUrl: string | null
  demoUrl: string | null
  featured?: boolean
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED"
}

type ProjectCardProps = {
  project: ProjectCardItem
  variant?: "default" | "featured"
  className?: string
}

export function ProjectCard({ project, variant = "default", className }: ProjectCardProps) {
  const isFeatured = variant === "featured" || project.featured
  const teams = project.technologies.slice(0, isFeatured ? 6 : 4)

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_OPTIONS}
      variants={fadeInUp}
      className={cn(
        "lab-card-surface group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-300 sm:p-6",
        "hover:-translate-y-0.5 hover:border-[var(--lab-orange-glow)]/40 hover:shadow-[0_18px_48px_-28px_rgba(234,88,12,0.45)]",
        isFeatured && "sm:p-7 lg:p-8",
        className,
      )}
    >
      {/* Accent gradient strip */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--lab-orange)]/60 to-transparent opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
        )}
      />

      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em]",
              isFeatured
                ? "border-[var(--lab-orange-glow)]/50 bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]"
                : "border-[var(--lab-line)] text-[var(--lab-ink-soft)]",
            )}
          >
            {project.category?.name ?? "System"}
          </span>
          {isFeatured ? (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-orange)]">
              <Sparkles className="size-3" aria-hidden />
              Featured
            </span>
          ) : null}
        </div>
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          aria-label={`View ${project.title}`}
          className="text-[var(--lab-ink-soft)] transition-colors group-hover:text-[var(--lab-orange)]"
        >
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </header>

      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className="mt-5 block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lab-bg)]"
      >
        <h3
          className={cn(
            "font-semibold leading-[1.2] tracking-tight text-[var(--lab-ink)] transition-colors group-hover:text-[var(--lab-orange)]",
            isFeatured ? "text-xl sm:text-2xl lg:text-[26px]" : "text-base sm:text-lg lg:text-xl",
          )}
        >
          {project.title}
        </h3>
        <p
          className={cn(
            "mt-2 leading-relaxed text-[var(--lab-ink-soft)]",
            isFeatured ? "text-[15px]" : "text-sm",
          )}
        >
          {project.description}
        </p>
      </Link>

      {teams.length > 0 ? (
        <div className="mt-5 sm:mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            Stack
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5 sm:mt-3">
            {teams.map((tech) => (
              <li
                key={tech}
                className="inline-flex items-center rounded-md border border-[var(--lab-line)] bg-[var(--lab-bg)]/60 px-2 py-0.5 font-mono text-[10px] tracking-[0.04em] text-[var(--lab-ink-soft)] transition-colors group-hover:border-[var(--lab-orange-glow)]/30 group-hover:text-[var(--lab-ink)] sm:text-[10.5px]"
              >
                {tech}
              </li>
            ))}
            {project.technologies.length > teams.length ? (
              <li className="inline-flex items-center rounded-md border border-dashed border-[var(--lab-line)] px-2 py-0.5 font-mono text-[10px] tracking-[0.04em] text-[var(--lab-ink-soft)]/70 sm:text-[10.5px]">
                +{project.technologies.length - teams.length}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <footer className="mt-auto flex flex-wrap items-center gap-1 pt-5 text-xs sm:gap-5 sm:pt-6">
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-1 text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)] sm:min-h-0 sm:px-0"
          >
            <Github className="size-3.5" aria-hidden />
            Source
          </a>
        ) : null}
        {project.demoUrl ? (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-1 text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)] sm:min-h-0 sm:px-0"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Demo
          </a>
        ) : null}
        {!project.githubUrl && !project.demoUrl ? (
          <span className="text-[var(--lab-ink-soft)]/70">Case study</span>
        ) : null}
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className="ml-auto inline-flex min-h-[36px] items-center gap-1 rounded-md px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-orange)] transition-colors hover:bg-[var(--lab-orange-soft)] sm:min-h-0 sm:px-3"
        >
          Open
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </footer>
    </motion.article>
  )
}
