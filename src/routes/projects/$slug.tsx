import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import {
  ArrowLeft,
  ArrowUpRight,
  Code2,
  ExternalLink,
  Github,
  Layers,
} from "lucide-react"
import {
  useInfiniteProjects,
  useProject,
  type ProjectListItem,
} from "#/hooks/useProjects"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { ROUTES } from "#/lib/domain/routes"
import { TiptapContent } from "#/lib/tiptap-renderer"

export const Route = createFileRoute("/projects/$slug")({
  head: () => ({
    meta: [{ title: "Project — XNINETZY Labs" }],
  }),
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { slug } = Route.useParams()
  const { data: project, isPending, isError } = useProject(slug)

  if (isPending) {
    return <ProjectSkeleton />
  }

  if (isError || !project) {
    return (
      <main className="lab-page-bg border-t border-[var(--lab-line)]">
        <div className="mx-auto w-full max-w-3xl px-4 py-24">
          <p className="text-sm text-[var(--lab-ink-soft)]">Project not found.</p>
          <Link
            to={ROUTES.PROJECTS}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--lab-orange)] no-underline hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to projects
          </Link>
        </div>
      </main>
    )
  }

  return <ProjectDetailView project={project} />
}

function ProjectSkeleton() {
  return (
    <main className="lab-page-bg border-t border-[var(--lab-line)]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-20">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-6 h-12 w-3/4" />
        <Skeleton className="mt-4 h-5 w-1/2" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </main>
  )
}

function ProjectDetailView({ project }: { project: ProjectListItem }) {
  const { data: related } = useInfiniteProjects({
    categorySlug: project.category?.slug,
    pageSize: 3,
  })
  const relatedItems = (related?.pages.flatMap((page) => page.items) ?? [])
    .filter((item) => item.id !== project.id)
    .slice(0, 3)

  return (
    <main className="lab-page-bg border-t border-[var(--lab-line)] text-[var(--lab-ink)]">
      <section className="border-b border-[var(--lab-line)] bg-[var(--lab-bg-soft)] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Link
              to={ROUTES.PROJECTS}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
            >
              <ArrowLeft className="size-3.5" />
              All projects
            </Link>

            {project.category && (
              <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lab-orange)]">
                {project.category.name}
              </p>
            )}

            <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--lab-ink)] sm:text-5xl">
              {project.title}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--lab-ink-soft)]">
              {project.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-[var(--lab-line)] bg-[var(--lab-card)] px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink)] no-underline transition-colors hover:border-[var(--lab-orange)] hover:text-[var(--lab-orange)]"
                >
                  <Github className="size-3.5" />
                  Source
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[var(--lab-orange)] !text-white px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] no-underline transition-colors hover:bg-[var(--lab-orange-light)]"
                >
                  <ExternalLink className="size-3.5" />
                  Live demo
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {project.coverImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="border-b border-[var(--lab-line)]"
        >
          <div className="mx-auto w-full max-w-[1240px] px-4 py-8">
            <div className="overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-card)]">
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      )}

      <section className="mx-auto w-full max-w-[1240px] px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="max-w-3xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
                Overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-3xl">
                What we built
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
              className="mt-8"
            >
              <div className="text-base leading-7 text-[var(--lab-ink)]">
                <TiptapContent content={project.content} fallbackClassName="text-[var(--lab-ink)]" />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
              className="mt-12"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
                Architecture
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--lab-ink)]">
                How it fits together
              </h3>
              <ProjectArchitecture technologies={project.technologies} />
            </motion.div>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
              className="research-card-surface p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                Stack
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--lab-ink)]">
                {project.technologies.map((tech) => (
                  <li key={tech} className="flex items-center gap-2">
                    <span aria-hidden className="inline-block size-1 shrink-0 bg-[var(--lab-orange)]" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
              className="research-card-surface p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                Links
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {project.githubUrl && (
                  <li>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[var(--lab-ink)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                    >
                      <Github className="size-3.5" aria-hidden />
                      Source repository
                      <ArrowUpRight className="size-3" aria-hidden />
                    </a>
                  </li>
                )}
                {project.demoUrl && (
                  <li>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[var(--lab-ink)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                      Live demo
                      <ArrowUpRight className="size-3" aria-hidden />
                    </a>
                  </li>
                )}
                {!project.githubUrl && !project.demoUrl && (
                  <li className="text-[var(--lab-ink-soft)]">Case study only</li>
                )}
              </ul>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
              className="research-card-surface p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                Meta
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--lab-ink-soft)]">Category</dt>
                  <dd className="text-[var(--lab-ink)]">{project.category?.name ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--lab-ink-soft)]">Featured</dt>
                  <dd className="text-[var(--lab-ink)]">{project.featured ? "Yes" : "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--lab-ink-soft)]">Order</dt>
                  <dd className="font-mono text-[var(--lab-ink)]">{project.order}</dd>
                </div>
              </dl>
            </motion.div>
          </aside>
        </div>
      </section>

      {relatedItems.length > 0 && (
        <section className="border-t border-[var(--lab-line)] bg-[var(--lab-bg-soft)] py-16">
          <div className="mx-auto w-full max-w-[1240px] px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
              className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
                  Related
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-3xl">
                  More from this domain
                </h2>
              </div>
              <Link
                to={ROUTES.PROJECTS}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
              >
                View all projects
                <ArrowUpRight className="size-3" aria-hidden />
              </Link>
            </motion.div>

            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to="/projects/$slug"
                    params={{ slug: item.slug }}
                    className="research-card-surface group block h-full p-6 no-underline"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                        {item.category?.name ?? "System"}
                      </p>
                      <ArrowUpRight className="size-4 text-[var(--lab-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--lab-orange)]" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-[var(--lab-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                      {item.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}

function ProjectArchitecture({ technologies }: { technologies: string[] }) {
  const layers = [
    { label: "Clients", items: ["Web", "Mobile", "API"] },
    { label: "Application", items: ["Dashboard", "Workflow", "Auth"] },
    { label: "Intelligence", items: ["Agents", "RAG", "Eval"] },
    { label: "Data", items: ["Postgres", "pgvector", "Cache"] },
    { label: "Infrastructure", items: ["Docker", "CI/CD", "Observability"] },
  ]

  return (
    <div className="research-card-surface mt-6 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--lab-line)] px-4 py-2.5">
        <Layers className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
        <span className="font-mono text-xs text-[var(--lab-ink-soft)]">
          xninetzy-labs / architecture
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
          {technologies.length} technologies
        </span>
      </div>

      <div className="grid gap-px bg-[var(--lab-line)] sm:grid-cols-2 lg:grid-cols-5">
        {layers.map((layer) => (
          <div key={layer.label} className="bg-[var(--lab-bg)] px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
              {layer.label}
            </p>
            <p className="mt-2 text-sm text-[var(--lab-ink)]">
              {layer.items.join(" · ")}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--lab-line)] bg-[var(--lab-card)]/40 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
            Tech mapping
          </p>
          <Code2 className="size-3.5 text-[var(--lab-ink-soft)]" aria-hidden />
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px] text-[var(--lab-ink-soft)]">
          {technologies.slice(0, 8).map((tech) => (
            <li key={tech} className="flex items-center gap-1.5">
              <span aria-hidden className="size-1 bg-[var(--lab-orange)]" />
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
