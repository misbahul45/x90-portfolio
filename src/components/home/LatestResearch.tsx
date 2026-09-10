import { useState } from "react"
import { motion } from "motion/react"
import { ArrowRight, Loader2 } from "lucide-react"
import {
  useInfiniteArticles,
  type ArticleListItem,
} from "#/hooks/useArticles"
import { useInfiniteScroll } from "#/hooks/useInfiniteScroll"
import { ResearchCard, type ResearchCardItem } from "#/components/research/ResearchCard"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { ROUTES } from "#/lib/domain/routes"
import { cn } from "#/lib/utils"

const PREVIEW_PAGE_SIZE = 3

export function LatestResearch() {
  const { data, isPending, isError } = useInfiniteArticles({ pageSize: PREVIEW_PAGE_SIZE })

  const articles = (data?.pages.flatMap((page) => page.items) ?? []).slice(0, PREVIEW_PAGE_SIZE)

  return (
    <section className="lab-page-bg border-b border-[var(--lab-line)] py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
              Latest research
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
              Experiments, engineering notes, and ideas from the lab.
            </p>
          </div>
          <a
            href={ROUTES.RESEARCH}
            className="group inline-flex items-center gap-1.5 self-start font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)] sm:self-auto"
          >
            View all
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </a>
        </motion.div>

        <div className="mt-12">
          {isPending && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-[var(--lab-ink-soft)]">Unable to load articles.</p>
          )}

          {!isPending && articles.length === 0 && (
            <p className="text-sm text-[var(--lab-ink-soft)]">No articles published yet.</p>
          )}

          {articles.length > 0 && (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.id} className="h-full">
                  <ResearchCard article={toCardItem(article)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export function ResearchList() {
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [query, setQuery] = useState("")
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteArticles({ pageSize: 9 })

  const items = (data?.pages.flatMap((page) => page.items) ?? [])
    .filter((article) => activeFilter === "all" || article.category?.slug === activeFilter)
    .filter((article) => {
      const needle = query.trim().toLowerCase()
      if (!needle) return true
      return (
        article.title.toLowerCase().includes(needle) ||
        article.excerpt.toLowerCase().includes(needle)
      )
    })

  const sentinelRef = useInfiniteScroll({
    enabled: true,
    loading: isFetchingNextPage,
    hasMore: hasNextPage,
    onLoadMore: () => {
      void fetchNextPage()
    },
  })

  return (
    <section className="lab-page-bg border-b border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
              Latest research
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
              Experiments, engineering notes, and ideas from the lab.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <input
              type="search"
              placeholder="Search articles…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search research"
              className="h-10 w-full border border-[var(--lab-line)] bg-[var(--lab-card)] px-3 font-mono text-xs text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)] outline-none transition-colors focus:border-[var(--lab-orange)]"
            />
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <FilterChip active={activeFilter === "all"} onClick={() => setActiveFilter("all")}>
            All
          </FilterChip>
        </div>

        <div className="mt-12">
          {isPending && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Skeleton key={index} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-[var(--lab-ink-soft)]">
              Unable to load articles. Please try again later.
            </p>
          )}

          {!isPending && items.length === 0 && (
            <p className="text-sm text-[var(--lab-ink-soft)]">
              No research matches your filters yet.
            </p>
          )}

          {items.length > 0 && (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((article) => (
                <li key={article.id} className="h-full">
                  <ResearchCard article={toCardItem(article)} />
                </li>
              ))}
            </ul>
          )}

          <div ref={sentinelRef} aria-hidden className="h-px w-full" />

          {isFetchingNextPage && (
            <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <Loader2 className="size-3.5 animate-spin text-[var(--lab-orange)]" aria-hidden />
              Loading more
            </div>
          )}

          {!hasNextPage && !isPending && items.length > 0 && (
            <p className="mt-6 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/60">
              End of research
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={cn(
        "lab-filter-pill",
        active && "border-[var(--lab-orange-glow)] bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]",
      )}
    >
      {children}
    </button>
  )
}

function toCardItem(article: ArticleListItem): ResearchCardItem {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.category,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
  }
}
