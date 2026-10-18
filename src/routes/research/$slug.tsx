import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { NodeArt } from "#/components/deepmind/NodeArt"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { outlinePillClass, primaryPillClass } from "#/components/deepmind/styles"
import { ResearchNewsItem } from "#/components/research/ResearchNewsItem"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import { useArticle, useInfiniteArticles, type ArticleListItem } from "#/hooks/useArticles"
import { formatFullDate } from "#/lib/format-date"
import { TiptapContent } from "#/lib/tiptap-renderer"

export const Route = createFileRoute("/research/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Research · X90 Labs` },
      {
        name: "description",
        content: "A technical investigation, experiment, or applied note from X90 Labs.",
      },
    ],
  }),
  component: ArticleDetailPage,
})

function ArticleDetailPage() {
  const { slug } = Route.useParams()
  const { data: article, isPending, isError } = useArticle(slug)

  if (isPending) return <ArticleSkeleton />
  if (isError || !article) return <ArticleNotFound />

  return <ArticleDetailView article={article} />
}

function BackLink() {
  return (
    <Link
      to="/research"
      className="inline-flex items-center gap-2 text-[15px] text-[var(--lab-ink-soft)] no-underline hover:text-[var(--lab-orange)]"
    >
      <ArrowLeft className="size-4" aria-hidden />
      All research
    </Link>
  )
}

function ArticleNotFound() {
  return (
    <main className="pt-36 sm:pt-44">
      <div className="dm-shell">
        <div className="mx-auto max-w-2xl">
          <BackLink />
          <h1 className="dm-title mt-8">This research is not available</h1>
          <p className="dm-subtitle mt-1">
            It may still be a draft, archived or moved. Browse the rest of the lab notebook.
          </p>
          <Button asChild className={`${primaryPillClass} mt-10`}>
            <Link to="/research">Back to research</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

function ArticleSkeleton() {
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

function ArticleDetailView({ article }: { article: ArticleListItem }) {
  const related = useInfiniteArticles({ categorySlug: article.category?.slug, pageSize: 4 })
  const moreArticles = (related.data?.pages[0]?.items ?? [])
    .filter((item) => item.id !== article.id)
    .slice(0, 3)
  const projects = (article.projects ?? []).filter((entry) => entry.project.status === "PUBLISHED")
  const meta = [
    formatFullDate(article.publishedAt),
    article.readingTime ? `${article.readingTime} min read` : "",
    article.author?.name ? `By ${article.author.name}` : "",
  ].filter(Boolean)

  return (
    <main>
      <article className="pt-36 sm:pt-44">
        <div className="dm-shell">
          <div className="mx-auto max-w-4xl">
            <BackLink />
            <p className="dm-eyebrow mt-10">{article.category?.name ?? "Research"}</p>
            <h1 className="dm-display mt-4 text-balance">{article.title}</h1>
            {article.excerpt ? <p className="dm-lede mt-8 max-w-3xl">{article.excerpt}</p> : null}
            {meta.length > 0 ? (
              <p className="mt-8 text-[15px] text-[var(--lab-ink-soft)]">{meta.join("  ·  ")}</p>
            ) : null}
          </div>

          <Reveal className="mx-auto mt-14 max-w-5xl">
            <div className="dm-media aspect-[16/9]">
              {article.coverImage ? (
                <img src={article.coverImage} alt={`${article.title} cover`} className="h-full w-full object-cover" />
              ) : (
                <NodeArt seed={article.slug} />
              )}
            </div>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-5xl gap-14 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="max-w-3xl text-[17px] leading-8">
              <TiptapContent content={article.content} fallbackClassName="text-[var(--lab-ink)]" />
            </div>
            <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
              <dl className="space-y-6 border-t border-[var(--lab-line)] pt-6 text-[15px]">
                <div>
                  <dt className="text-[var(--lab-ink-soft)]">Domain</dt>
                  <dd className="mt-1 text-[var(--lab-ink)]">{article.category?.name ?? "Research"}</dd>
                </div>
                {article.publishedAt ? (
                  <div>
                    <dt className="text-[var(--lab-ink-soft)]">Published</dt>
                    <dd className="mt-1 text-[var(--lab-ink)]">{formatFullDate(article.publishedAt)}</dd>
                  </div>
                ) : null}
                {article.tags.length > 0 ? (
                  <div>
                    <dt className="text-[var(--lab-ink-soft)]">Topics</dt>
                    <dd className="mt-1 text-[var(--lab-ink)]">
                      {article.tags.map(({ tag }) => tag.name).join(" · ")}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>
        </div>
      </article>

      {projects.length > 0 ? (
        <section aria-labelledby="informs-heading" className="dm-section mt-16 border-t border-[var(--lab-line)]">
          <div className="dm-shell">
            <SectionHeader
              headingId="informs-heading"
              title="Systems this informs"
              description="Projects where these questions became code."
              action={
                <Button asChild variant="outline" className={outlinePillClass}>
                  <Link to="/projects">View all projects</Link>
                </Button>
              }
            />
            <ul className="mt-12 border-b border-[var(--lab-line)]">
              {projects.map(({ project }) => (
                <li key={project.id}>
                  <Link to="/projects/$slug" params={{ slug: project.slug }} className="dm-row dm-link">
                    <span className="min-w-0">
                      <span className="block text-xl font-medium">{project.title}</span>
                      <span className="dm-body mt-1 block line-clamp-2">{project.description}</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {moreArticles.length > 0 ? (
        <section aria-labelledby="more-heading" className="dm-section border-t border-[var(--lab-line)]">
          <div className="dm-shell">
            <SectionHeader
              headingId="more-heading"
              title="More from this domain"
              action={
                <Button asChild variant="outline" className={outlinePillClass}>
                  <Link to="/research">View all research</Link>
                </Button>
              }
            />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moreArticles.map((item) => (
                <li key={item.id}>
                  <ResearchNewsItem article={item} className="min-h-56" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="inquiry-heading" className="dm-section border-t border-[var(--lab-line)]">
        <div className="dm-shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="inquiry-heading" className="dm-title">
              Working on a similar question?
            </h2>
            <p className="dm-subtitle mt-1">
              Send us a brief. We like problems that start as research.
            </p>
            <Button asChild className={`${primaryPillClass} mt-10`}>
              <Link to="/" hash="contact">
                Discuss this research
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
