import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react"
import { NodeArt } from "#/components/deepmind/NodeArt"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { outlinePillClass, primaryPillClass } from "#/components/deepmind/styles"
import { ResearchNewsItem } from "#/components/research/ResearchNewsItem"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import { useProject, type ProjectListItem } from "#/hooks/useProjects"
import { formatFullDate } from "#/lib/format-date"
import { TiptapContent } from "#/lib/tiptap-renderer"

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Project · X90 Labs` },
      {
        name: "description",
        content: "An engineering case study from X90 Labs: what we built, why, and what we learned.",
      },
    ],
  }),
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { slug } = Route.useParams()
  const { data: project, isPending, isError } = useProject(slug)

  if (isPending) return <ProjectSkeleton />
  if (isError || !project) return <ProjectNotFound />

  return <ProjectDetailView project={project} />
}

function BackLink() {
  return (
    <Link
      to="/projects"
      className="inline-flex items-center gap-2 text-[15px] text-[var(--lab-ink-soft)] no-underline hover:text-[var(--lab-orange)]"
    >
      <ArrowLeft className="size-4" aria-hidden />
      All projects
    </Link>
  )
}

function ProjectNotFound() {
  return (
    <main className="pt-36 sm:pt-44">
      <div className="dm-shell">
        <div className="mx-auto max-w-2xl">
          <BackLink />
          <h1 className="dm-title mt-8">This system is not available</h1>
          <p className="dm-subtitle mt-1">
            The project may have been moved, archived or never published publicly.
          </p>
          <Button asChild className={`${primaryPillClass} mt-10`}>
            <Link to="/projects">Back to projects</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

function ProjectSkeleton() {
  return (
    <main className="pt-36 sm:pt-44" aria-busy="true">
      <div className="dm-shell">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-8 h-14 w-full" />
          <Skeleton className="mt-3 h-14 w-2/3" />
          <Skeleton className="mt-10 aspect-[16/9] w-full rounded-3xl" />
        </div>
      </div>
    </main>
  )
}

function ProjectDetailView({ project }: { project: ProjectListItem }) {
  const research = (project.research ?? []).filter((entry) => entry.article.status === "PUBLISHED")

  return (
    <main>
      <article className="pt-36 sm:pt-44">
        <div className="dm-shell">
          <div className="mx-auto max-w-4xl">
            <BackLink />
            <p className="dm-eyebrow mt-10">{project.category?.name ?? "System"}</p>
            <h1 className="dm-display mt-4 text-balance">{project.title}</h1>
            <p className="dm-lede mt-8 max-w-3xl">{project.description}</p>
            {project.githubUrl || project.demoUrl ? (
              <div className="mt-10 flex flex-wrap items-center gap-3">
                {project.demoUrl ? (
                  <Button asChild className={primaryPillClass}>
                    <a href={project.demoUrl} target="_blank" rel="noreferrer">
                      Live demo
                      <ArrowUpRight aria-hidden />
                    </a>
                  </Button>
                ) : null}
                {project.githubUrl ? (
                  <Button asChild variant="outline" className={outlinePillClass}>
                    <a href={project.githubUrl} target="_blank" rel="noreferrer">
                      <Github aria-hidden />
                      Source
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          <Reveal className="mx-auto mt-14 max-w-5xl">
            <div className="dm-media aspect-[16/9]">
              {project.coverImage ? (
                <img src={project.coverImage} alt={`${project.title} cover`} className="h-full w-full object-cover" />
              ) : (
                <NodeArt seed={project.slug} />
              )}
            </div>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-5xl gap-14 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="max-w-3xl text-[17px] leading-8">
              <TiptapContent content={project.content} fallbackClassName="text-[var(--lab-ink)]" />
            </div>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <dl className="space-y-6 border-t border-[var(--lab-line)] pt-6 text-[15px]">
                <div>
                  <dt className="text-[var(--lab-ink-soft)]">Domain</dt>
                  <dd className="mt-1 text-[var(--lab-ink)]">{project.category?.name ?? "System"}</dd>
                </div>
                {project.publishedAt ? (
                  <div>
                    <dt className="text-[var(--lab-ink-soft)]">Published</dt>
                    <dd className="mt-1 text-[var(--lab-ink)]">{formatFullDate(project.publishedAt)}</dd>
                  </div>
                ) : null}
                {project.technologies.length > 0 ? (
                  <div>
                    <dt className="text-[var(--lab-ink-soft)]">Stack</dt>
                    <dd className="mt-1 font-mono text-sm leading-relaxed text-[var(--lab-ink)]">
                      {project.technologies.join(" · ")}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>
        </div>
      </article>

      {research.length > 0 ? (
        <section aria-labelledby="behind-heading" className="dm-section mt-16 border-t border-[var(--lab-line)]">
          <div className="dm-shell">
            <SectionHeader
              headingId="behind-heading"
              title="Research behind this system"
              description="The investigations that shaped how it was built."
              action={
                <Button asChild variant="outline" className={outlinePillClass}>
                  <Link to="/research">View all research</Link>
                </Button>
              }
            />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {research.map(({ article }) => (
                <li key={article.id}>
                  <ResearchNewsItem article={article} className="min-h-56" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="project-inquiry-heading" className="dm-section border-t border-[var(--lab-line)]">
        <div className="dm-shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="project-inquiry-heading" className="dm-title">
              Need something like this?
            </h2>
            <p className="dm-subtitle mt-1">Send a brief and we will scope it with you.</p>
            <Button asChild className={`${primaryPillClass} mt-10`}>
              <Link to="/" hash="contact">
                Start a brief
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
