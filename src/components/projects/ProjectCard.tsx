import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Github, ExternalLink } from "lucide-react"
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
}

type ProjectCardProps = {
  project: ProjectCardItem
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_OPTIONS}
      variants={fadeInUp}
      className={cn("lab-card-surface group flex h-full flex-col p-6", className)}
    >
      <header className="flex items-center justify-between">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
          {project.category?.name ?? "System"}
        </p>
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
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-[var(--lab-ink)] sm:text-xl">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
          {project.description}
        </p>
      </Link>

      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
          Stack
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink)]">
          {project.technologies.slice(0, 5).join(" · ")}
        </p>
      </div>

      <footer className="mt-auto flex items-center gap-5 pt-6 text-xs">
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)]"
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
            className="inline-flex items-center gap-1.5 text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)]"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Demo
          </a>
        ) : null}
        {!project.githubUrl && !project.demoUrl ? (
          <span className="text-[var(--lab-ink-soft)]/70">Case study</span>
        ) : null}
      </footer>
    </motion.article>
  )
}
