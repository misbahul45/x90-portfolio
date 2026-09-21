import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { useProjects, type ProjectListItem } from "#/hooks/useProjects"
import { Skeleton } from "#/components/ui/skeleton"
import { ProjectCard } from "#/components/projects/ProjectCard"
import { fadeInUp, staggerContainer, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { ROUTES } from "#/lib/domain/routes"

export function SelectedProjects() {
  const { data: page, isPending, isError } = useProjects({ featuredOnly: true, pageSize: 4, page: 1 })
  const projects = page?.items ?? []

  return (
    <section className="lab-page-bg border-b border-[var(--lab-line)] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
              {projects.length > 0 ? `Featured · ${projects.length} systems` : "Featured"}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Selected projects
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Systems we&apos;ve engineered from research — production-grade and
              battle-tested.
            </p>
          </div>
          <a
            href={ROUTES.PROJECTS}
            className="group inline-flex shrink-0 items-center gap-1.5 self-start font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)] sm:self-auto"
          >
            View all projects
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </a>
        </motion.div>

        {isPending && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-muted-foreground">
            Unable to load projects. Please try again.
          </p>
        )}

        {projects.length === 0 && !isPending && (
          <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)]/30 p-10 text-center">
            <p className="text-sm font-medium text-[var(--lab-ink)]">
              No featured projects yet.
            </p>
            <p className="mt-1 text-xs text-[var(--lab-ink-soft)]">
              Mark projects as featured from the admin dashboard.
            </p>
          </div>
        )}

        {projects.length > 0 && (
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_OPTIONS}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {projects.map((project, index) => (
              <li key={project.id} className="h-full">
                <ProjectCard project={toCardItem(project)} variant={index === 0 ? "featured" : "default"} />
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  )
}

function toCardItem(project: ProjectListItem) {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    technologies: project.technologies,
    category: project.category,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    featured: project.featured,
  }
}
