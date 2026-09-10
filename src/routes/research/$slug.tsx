import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  FileSearch,
  Quote,
} from "lucide-react"
import {
  useArticle,
} from "#/hooks/useArticles"
import { useInfiniteArticles, type ArticleListItem } from "#/hooks/useArticles"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { ROUTES } from "#/lib/domain/routes"
import { TiptapContent } from "#/lib/tiptap-renderer"

export const Route = createFileRoute("/research/$slug")({
  head: () => ({
    meta: [{ title: "Research Article — XNINETZY Labs" }],
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

  if (isPending) {
    return <ArticleSkeleton />
  }

  if (isError || !article) {
    return (
      <main className="lab-page-bg border-t border-[var(--lab-line)]">
        <div className="mx-auto w-full max-w-3xl px-4 py-24">
          <p className="text-sm text-[var(--lab-ink-soft)]">Article not found.</p>
          <Link
            to={ROUTES.RESEARCH}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--lab-orange)] no-underline hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to research
          </Link>
        </div>
      </main>
    )
  }

  return <ArticleDetailView article={article} />
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
  const { data: related } = useInfiniteArticles({
    categorySlug: article.category?.slug,
    pageSize: 3,
  })
  const relatedItems = (related?.pages.flatMap((page) => page.items) ?? [])
    .filter((item) => item.id !== article.id)
    .slice(0, 3)

  return (
    <main className="lab-page-bg border-t border-[var(--lab-line)] text-[var(--lab-ink)]">
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

            {article.category && (
              <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lab-orange)]">
                {article.category.name}
              </p>
            )}

            <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--lab-ink)] sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--lab-ink-soft)]">
              {article.excerpt}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
              {article.author?.name && <span>By {article.author.name}</span>}
              {article.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {formatDate(article.publishedAt)}
                </span>
              )}
              {article.readingTime ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {article.readingTime} min read
                </span>
              ) : null}
            </div>

            {article.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap items-center gap-2">
                {article.tags.map(({ tag }) => (
                  <li
                    key={tag.id}
                    className="lab-tech-tag"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </section>

      {article.coverImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="border-b border-[var(--lab-line)]"
        >
          <div className="mx-auto w-full max-w-[1240px] px-4 py-8">
            <div className="overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-card)]">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      )}

      <section className="mx-auto w-full max-w-[1240px] px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_OPTIONS}
            variants={fadeInUp}
            className="max-w-3xl"
          >
            {article.excerpt && (
              <div className="mb-10 border-l-2 border-[var(--lab-orange)] pl-5">
                <Quote className="size-4 text-[var(--lab-orange)]" aria-hidden />
                <p className="mt-2 text-lg italic leading-relaxed text-[var(--lab-ink)]">
                  {article.excerpt}
                </p>
              </div>
            )}
            <TiptapContent content={article.content} fallbackClassName="text-[var(--lab-ink)]" />
          </motion.article>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {article.author && (
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
                    <p className="text-sm font-semibold text-[var(--lab-ink)]">
                      {article.author.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                      AI Labs contributor
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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
                  <dt className="text-[var(--lab-ink-soft)]">Domain</dt>
                  <dd className="text-[var(--lab-ink)]">{article.category?.name ?? "—"}</dd>
                </div>
                {article.publishedAt && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--lab-ink-soft)]">Published</dt>
                    <dd className="text-[var(--lab-ink)]">{formatDate(article.publishedAt)}</dd>
                  </div>
                )}
                {article.readingTime ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[var(--lab-ink-soft)]">Reading time</dt>
                    <dd className="font-mono text-[var(--lab-ink)]">{article.readingTime} min</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--lab-ink-soft)]">Status</dt>
                  <dd className="font-mono text-[var(--lab-ink)]">{article.status}</dd>
                </div>
              </dl>
            </motion.div>

            {article.tags.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_OPTIONS}
                variants={fadeInUp}
                className="research-card-surface p-6"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                  Tags
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map(({ tag }) => (
                    <li key={tag.id} className="lab-tech-tag">
                      {tag.name}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
              className="research-card-surface p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                Reading
              </p>
              <Link
                to={ROUTES.RESEARCH}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--lab-ink)] no-underline transition-colors hover:text-[var(--lab-orange)]"
              >
                <FileSearch className="size-3.5" aria-hidden />
                More from AI Labs
                <ArrowUpRight className="size-3" aria-hidden />
              </Link>
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
                to={ROUTES.RESEARCH}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
              >
                View all research
                <ArrowUpRight className="size-3" aria-hidden />
              </Link>
            </motion.div>

            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to="/research/$slug"
                    params={{ slug: item.slug }}
                    className="research-card-surface group block h-full p-6 no-underline"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                        {item.category?.name ?? "Research"}
                      </p>
                      <ArrowUpRight className="size-4 text-[var(--lab-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--lab-orange)]" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-[var(--lab-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                      {item.excerpt}
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
