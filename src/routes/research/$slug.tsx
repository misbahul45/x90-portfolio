import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowLeft, ArrowUpRight, BookOpen, Calendar, Clock, Quote } from "lucide-react"
import { useArticle, type ArticleListItem } from "#/hooks/useArticles"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { ROUTES } from "#/lib/domain/routes"
import { TiptapContent } from "#/lib/tiptap-renderer"
import { RelatedArticles } from "#/components/projects/RelatedContent"
import { ProjectCTA } from "#/components/projects/ProjectCTA"

export const Route = createFileRoute("/research/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Research · XNINETZY Labs` },
      {
        name: "description",
        content: "A technical investigation, experiment, or applied note from XNINETZY Labs.",
      },
    ],
  }),
  component: ArticleDetailPage,
})

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en", { month: "long", day: "2-digit", year: "numeric" }).format(date)
}

function ArticleDetailPage() {
  const { slug } = Route.useParams()
  const { data: article, isPending, isError } = useArticle(slug)

  if (isPending) return <ArticleSkeleton />
  if (isError || !article) return <ArticleNotFound />

  return <ArticleDetailView article={article} />
}

function ArticleNotFound() {
  return (
    <main className="lab-page-bg border-t border-[var(--lab-line)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
          404 · Research
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
          This research is not available.
        </h1>
        <p className="mt-3 text-sm text-[var(--lab-ink-soft)]">
          It may still be in draft, archived, or moved. Browse the rest of the lab notebook.
        </p>
        <Link
          to={ROUTES.RESEARCH}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--lab-orange)] no-underline hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to research
        </Link>
      </div>
    </main>
  )
}

function ArticleSkeleton() {
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

function ArticleDetailView({ article }: { article: ArticleListItem }) {
  const relatedProjects = (article.projects ?? [])
    .filter((p) => p.project.status === "PUBLISHED")
    .map((p) => ({
      id: p.project.id,
      slug: p.project.slug,
      title: p.project.title,
      description: p.project.description,
      category: null,
    }))

  return (
    <main className="lab-page-bg border-t border-[var(--lab-line)] text-[var(--lab-ink)]">
      <ArticleHero article={article} />
      {article.coverImage ? <ArticleCover image={article.coverImage} title={article.title} /> : null}

      <ArticleBody article={article} />

      {relatedProjects.length > 0 ? (
        <section className="border-t border-[var(--lab-line)] bg-[var(--lab-bg-soft)] py-16">
          <div className="mx-auto w-full max-w-[1240px] px-4">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
                  From the lab
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-3xl">
                  Systems this research informs
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                  Concrete projects where these questions became code.
                </p>
              </div>
              <Link
                to={ROUTES.PROJECTS}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
              >
                View all projects
                <ArrowUpRight className="size-3" aria-hidden />
              </Link>
            </header>
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/projects/$slug"
                    params={{ slug: p.slug }}
                    className="research-card-surface group block h-full p-6 no-underline"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                        Project
                      </p>
                      <ArrowUpRight
                        className="size-4 text-[var(--lab-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--lab-orange)]"
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-[var(--lab-ink)]">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                      {p.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <RelatedArticles
        title="More from this domain"
        viewAllHref={ROUTES.RESEARCH}
        viewAllLabel="View all research"
        items={[]}
      />

      <ProjectCTA
        eyebrow="Research inquiry"
        title="Working on a similar question?"
        body="If this connects to something you are investigating, send us a brief. We like problems that start as research."
        primaryHref="/#contact"
        primaryLabel="Discuss this research"
        secondaryHref={ROUTES.PROJECTS}
        secondaryLabel="See applied systems"
      />
    </main>
  )
}

function ArticleHero({ article }: { article: ArticleListItem }) {
  return (
    <section className="border-b border-[var(--lab-line)] bg-[var(--lab-bg-soft)] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Link
            to={ROUTES.RESEARCH}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
          >
            <ArrowLeft className="size-3.5" />
            All research
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em]">
            <span className="inline-flex items-center gap-1.5 border border-[var(--lab-line)] bg-[var(--lab-card)] px-2.5 py-1 text-[var(--lab-orange)]">
              <span aria-hidden className="size-1.5 bg-[var(--lab-orange)]" />
              {article.category?.name ?? "Research"}
            </span>
            <span className="border border-[var(--lab-line)] bg-[var(--lab-card)] px-2.5 py-1 text-[var(--lab-ink-soft)]">
              {article.status}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--lab-ink)] sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
            {article.author?.name ? <span>By {article.author.name}</span> : null}
            {article.publishedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" aria-hidden />
                {formatDate(article.publishedAt)}
              </span>
            ) : null}
            {article.readingTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden />
                {article.readingTime} min read
              </span>
            ) : null}
          </div>

          {article.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap items-center gap-2">
              {article.tags.map(({ tag }) => (
                <li key={tag.id} className="lab-tech-tag">
                  {tag.name}
                </li>
              ))}
            </ul>
          ) : null}
        </motion.div>
      </div>
    </section>
  )
}

function ArticleCover({ image, title }: { image: string; title: string }) {
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

function ArticleBody({ article }: { article: ArticleListItem }) {
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
          {article.excerpt ? (
            <div className="mb-10 border-l-2 border-[var(--lab-orange)] pl-5">
              <Quote className="size-4 text-[var(--lab-orange)]" aria-hidden />
              <p className="mt-2 text-lg italic leading-relaxed text-[var(--lab-ink)]">
                {article.excerpt}
              </p>
            </div>
          ) : null}
          <TiptapContent content={article.content} fallbackClassName="text-[var(--lab-ink)]" />
        </motion.article>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          {article.author ? <AuthorPanel article={article} /> : null}

          <Panel title="Meta">
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Domain" value={article.category?.name ?? "—"} />
              {article.publishedAt ? (
                <Row label="Published" value={formatDate(article.publishedAt)} />
              ) : (
                <Row label="Published" value="Not yet published" />
              )}
              {article.readingTime ? (
                <Row label="Reading time" value={`${article.readingTime} min`} />
              ) : null}
              <Row label="Status" value={article.status} />
            </dl>
          </Panel>

          {article.tags.length > 0 ? (
            <Panel icon={BookOpen} title="Topics">
              <ul className="mt-4 flex flex-wrap gap-2">
                {article.tags.map(({ tag }) => (
                  <li key={tag.id} className="lab-tech-tag">
                    {tag.name}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

function AuthorPanel({ article }: { article: ArticleListItem }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_OPTIONS}
      variants={fadeInUp}
      className="research-card-surface p-6"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
        Author
      </p>
      <div className="mt-4 flex items-center gap-3">
        {article.author.image ? (
          <img
            src={article.author.image}
            alt={article.author.name}
            className="size-10 rounded-full border border-[var(--lab-line)] object-cover"
          />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full bg-[var(--lab-orange-soft)] font-mono text-base font-semibold text-[var(--lab-orange)]">
            {article.author.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-[var(--lab-ink)]">{article.author.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            AI Labs contributor
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon?: typeof BookOpen
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
