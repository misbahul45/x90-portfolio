import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowLeft, ArrowUpRight, Calendar, ExternalLink, Github, Layers } from "lucide-react"
import { useProject, type ProjectListItem, type ProjectRelatedArticle } from "#/hooks/useProjects"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { ROUTES } from "#/lib/domain/routes"
import { TiptapContent } from "#/lib/tiptap-renderer"
import { RelatedArticles, RelatedProjects } from "#/components/projects/RelatedContent"
import { ProjectCTA } from "#/components/projects/ProjectCTA"

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Project · XNINETZY Labs` },
      {
        name: "description",
        content:
          "An engineering case study from XNINETZY Labs: what we built, why, and what we learned.",
      },
    ],
  }),
  component: ProjectDetailPage,
})

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date)
}

function ProjectDetailPage() {
  const { slug } = Route.useParams()
  const { data: project, isPending, isError } = useProject(slug)

  if (isPending) return <ProjectSkeleton />
  if (isError || !project) return <ProjectNotFound />

  return <ProjectDetailView project={project} />
}

function ProjectNotFound() {
  return (
    <main className="lab-page-bg border-t border-[var(--lab-line)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
          404 · Project
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
          This system is not available.
        </h1>
        <p className="mt-3 text-sm text-[var(--lab-ink-soft)]">
          The project may have been moved, archived, or never published publicly.
        </p>
        <Link
          to={ROUTES.PROJECTS}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--lab-orange)] no-underline hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to projects
        </Link>
      </div>
    </main>
  )
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
  const relatedArticles: ProjectRelatedArticle[] = project.research ?? []
  const relatedResearchItems = relatedArticles
    .filter((r) => r.article.status === "PUBLISHED")
    .map((r) => ({
      id: r.article.id,
      slug: r.article.slug,
      title: r.article.title,
      excerpt: r.article.excerpt,
      category: r.article.category,
      publishedAt: r.article.publishedAt,
    }))

  return (
    <main className="lab-page-bg border-t border-[var(--lab-line)] text-[var(--lab-ink)]">
      <ProjectHero project={project} />
      {project.coverImage ? <ProjectCover image={project.coverImage} title={project.title} /> : null}

      <ProjectBody project={project} />

      <RelatedArticles
        title="Research behind this system"
        caption="Where this project connects to investigations, experiments, or applied notes from the lab."
        viewAllHref={ROUTES.RESEARCH}
        viewAllLabel="View all research"
        items={relatedResearchItems}
      />

      <ProjectRelatedProjects currentId={project.id} categoryId={project.category?.id} />

      <ProjectCTA />
    </main>
  )
}

function ProjectHero({ project }: { project: ProjectListItem }) {
  return (
    <section className="border-b border-[var(--lab-line)] bg-[var(--lab-bg-soft)] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Link
            to={ROUTES.PROJECTS}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
          >
            <ArrowLeft className="size-3.5" />
            All projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em]">
            <span className="inline-flex items-center gap-1.5 border border-[var(--lab-line)] bg-[var(--lab-card)] px-2.5 py-1 text-[var(--lab-orange)]">
              <span aria-hidden className="size-1.5 bg-[var(--lab-orange)]" />
              {project.category?.name ?? "System"}
            </span>
            {project.featured ? (
              <span className="border border-[var(--lab-line)] bg-[var(--lab-card)] px-2.5 py-1 text-[var(--lab-ink-soft)]">
                Featured
              </span>
            ) : null}
            {project.publishedAt ? (
              <span className="inline-flex items-center gap-1.5 border border-[var(--lab-line)] bg-[var(--lab-card)] px-2.5 py-1 text-[var(--lab-ink-soft)]">
                <Calendar className="size-3" aria-hidden />
                {formatDate(project.publishedAt)}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--lab-ink)] sm:text-5xl">
            {project.title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--lab-ink-soft)]">
            {project.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 border border-[var(--lab-line)] bg-[var(--lab-card)] px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink)] no-underline transition-colors hover:border-[var(--lab-orange)] hover:text-[var(--lab-orange)]"
              >
                <Github className="size-3.5" aria-hidden />
                Source
              </a>
            ) : null}
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 bg-[var(--lab-orange)] !text-white px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] no-underline transition-colors hover:bg-[var(--lab-orange-light)]"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Live demo
              </a>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCover({ image, title }: { image: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="border-b border-[var(--lab-line)]"
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 py-8">
        <div className="overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-card)]">
          <img src={image} alt={`${title} cover`} className="w-full" loading="lazy" />
        </div>
      </div>
    </motion.div>
  )
}

function ProjectBody({
  project,
}: {
  project: ProjectListItem
}) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <motion.article
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="max-w-3xl"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
            Engineering case study
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-3xl">
            How we built it
          </h2>
          <div className="mt-8 text-base leading-7 text-[var(--lab-ink)]">
            <TiptapContent content={project.content} fallbackClassName="text-[var(--lab-ink)]" />
          </div>
        </motion.article>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <Panel icon={Layers} title="Stack">
            <ul className="mt-4 space-y-2 text-sm text-[var(--lab-ink)]">
              {project.technologies.length === 0 ? (
                <li className="text-[var(--lab-ink-soft)]">Not documented.</li>
              ) : (
                project.technologies.map((tech) => (
                  <li key={tech} className="flex items-center gap-2">
                    <span aria-hidden className="inline-block size-1 shrink-0 bg-[var(--lab-orange)]" />
                    <span>{tech}</span>
                  </li>
                ))
              )}
            </ul>
          </Panel>

          <Panel title="Links">
            <ul className="mt-4 space-y-3 text-sm">
              {project.githubUrl ? (
                <li>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-[var(--lab-ink)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                  >
                    <Github className="size-3.5" aria-hidden />
                    Source repository
                    <ArrowUpRight className="size-3" aria-hidden />
                  </a>
                </li>
              ) : null}
              {project.demoUrl ? (
                <li>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-[var(--lab-ink)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    Live demo
                    <ArrowUpRight className="size-3" aria-hidden />
                  </a>
                </li>
              ) : null}
              {!project.githubUrl && !project.demoUrl ? (
                <li className="text-[var(--lab-ink-soft)]">Case study only</li>
              ) : null}
            </ul>
          </Panel>

          <Panel title="Meta">
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Domain" value={project.category?.name ?? "—"} />
              <Row label="Status" value={project.status} />
              {project.publishedAt ? <Row label="Published" value={formatDate(project.publishedAt)} /> : null}
              <Row label="Featured" value={project.featured ? "Yes" : "—"} />
            </dl>
          </Panel>
        </aside>
      </div>
    </section>
  )
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon?: typeof Layers
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_OPTIONS}
      variants={fadeInUp}
      className="research-card-surface p-6"
    >
      <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
        {Icon ? <Icon className="size-3" aria-hidden /> : null}
        {title}
      </p>
      {children}
    </motion.div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--lab-ink-soft)]">{label}</dt>
      <dd className="text-[var(--lab-ink)]">{value}</dd>
    </div>
  )
}

function ProjectRelatedProjects({
  currentId,
  categoryId,
}: {
  currentId: string
  categoryId?: string
}) {
  const projects = useRelatedProjects(categoryId)
  const items = projects
    .filter((p) => p.id !== currentId)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: p.category,
    }))
  if (items.length === 0) return null
  return (
    <RelatedProjects
      title="More from this domain"
      viewAllHref={ROUTES.PROJECTS}
      viewAllLabel="View all projects"
      items={items}
    />
  )
}

import { useInfiniteProjects } from "#/hooks/useProjects"

function useRelatedProjects(_categoryId?: string) {
  const { data } = useInfiniteProjects({ pageSize: 12 })
  return data?.pages.flatMap((page) => page.items) ?? []
}
