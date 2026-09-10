import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Loader2, Search, SlidersHorizontal } from "lucide-react"
import {
  useInfiniteArticles,
  type ArticleListItem,
} from "#/hooks/useArticles"
import { useInfiniteScroll } from "#/hooks/useInfiniteScroll"
import { Input } from "#/components/ui/input"
import { Skeleton } from "#/components/ui/skeleton"
import { ResearchCard, type ResearchCardItem } from "#/components/research/ResearchCard"
import { FilterPill } from "#/components/projects/FilterPill"
import { CATEGORIES } from "#/lib/domain/categories"
import { fadeInUp, staggerContainer } from "#/lib/motion-variants"

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research — XNINETZY Labs" },
      { name: "description", content: "Articles, experiments, and engineering notes from the lab." },
    ],
  }),
  component: ResearchListPage,
})

const ALL_FILTER = "all"

function ResearchListPage() {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER)
  const [query, setQuery] = useState("")
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteArticles({ pageSize: 9 })

  const items = useMemo<ResearchCardItem[]>(() => {
    const pages = data?.pages.flatMap((page) => page.items) ?? []
    const needle = query.trim().toLowerCase()
    return pages
      .filter((article) => {
        if (activeFilter !== ALL_FILTER && article.category?.slug !== activeFilter) return false
        if (!needle) return true
        return (
          article.title.toLowerCase().includes(needle) ||
          article.excerpt.toLowerCase().includes(needle)
        )
      })
      .map(toCardItem)
  }, [data, activeFilter, query])

  const totalShown = data?.pages[0]?.total ?? 0

  const sentinelRef = useInfiniteScroll({
    enabled: true,
    loading: isFetchingNextPage,
    hasMore: hasNextPage,
    onLoadMore: () => {
      void fetchNextPage()
    },
  })

  return (
    <main className="lab-page-bg border-t border-[var(--lab-line)] text-[var(--lab-ink)]">
      <section className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-20 sm:pt-28">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-3xl"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--lab-ink)] sm:text-5xl"
          >
            Latest research
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--lab-ink-soft)]"
          >
            Experiments, engineering notes, and ideas from the lab.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-[var(--lab-ink-soft)]"
          >
            <span>{totalShown > 0 ? `${totalShown}+ articles published` : "Loading articles"}</span>
            <span aria-hidden className="text-[var(--lab-line-strong)]">·</span>
            <span>{CATEGORIES.length} domains</span>
          </motion.div>
        </motion.header>

        <div className="lab-section-divider mt-12" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2">
            <FilterPill
              active={activeFilter === ALL_FILTER}
              onClick={() => setActiveFilter(ALL_FILTER)}
              count={totalShown}
            >
              All
            </FilterPill>
            {CATEGORIES.map((category) => (
              <FilterPill
                key={category.slug}
                active={activeFilter === category.slug}
                onClick={() => setActiveFilter(category.slug)}
              >
                {category.name}
              </FilterPill>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="relative w-full lg:max-w-xs">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--lab-ink-soft)]"
            />
            <Input
              type="search"
              placeholder="Search articles…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search articles"
              className="h-9 border-[var(--lab-line)] bg-[var(--lab-card)] pl-9 font-mono text-xs text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
            />
          </motion.div>
        </motion.div>

        <div className="mt-10">
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

          {!isPending && !isError && items.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)]/50 p-10 text-center">
              <SlidersHorizontal
                className="mx-auto size-6 text-[var(--lab-ink-soft)]"
                aria-hidden
              />
              <p className="mt-3 text-sm font-medium text-[var(--lab-ink)]">
                No research matches your filters.
              </p>
              <p className="mt-1 text-xs text-[var(--lab-ink-soft)]">
                Try clearing the search or switching to a different domain.
              </p>
            </div>
          )}

          {items.length > 0 && (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((article) => (
                <li key={article.id} className="h-full">
                  <ResearchCard article={article} />
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
      </section>
    </main>
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
