import { motion } from "motion/react"
import { useProjects, type ProjectListItem } from "#/hooks/useProjects"
import { Skeleton } from "#/components/ui/skeleton"
import { ProjectCard } from "#/components/projects/ProjectCard"
import { fadeInUp, staggerContainer, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { ROUTES } from "#/lib/domain/routes"

export function SelectedProjects() {
  const { data: page, isPending, isError } = useProjects({ featuredOnly: true, pageSize: 3, page: 1 })
  const projects = page?.items ?? []

  return (
    <section className="lab-page-bg border-b border-[var(--lab-line)] py-20">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mb-10 flex items-end justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Selected projects
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Systems we&apos;ve engineered from research — production-grade and
              battle-tested.
            </p>
          </div>
          <a
            href={ROUTES.PROJECTS}
            className="hidden shrink-0 text-sm font-medium text-primary no-underline hover:underline sm:inline"
          >
            View all →
          </a>
        </motion.div>

        {isPending && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-muted-foreground">
            Unable to load projects. Please try again.
          </p>
        )}

        {projects.length === 0 && !isPending && (
          <p className="text-sm text-muted-foreground">
            No featured projects yet.
          </p>
        )}

        {projects.length > 0 && (
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_OPTIONS}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((project) => (
              <li key={project.id} className="h-full">
                <ProjectCard project={toCardItem(project)} />
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
  }
}
