import { useEffect, useMemo, useRef, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowDownAZ, ArrowUpAZ, Check, ChevronDown, Loader2, Search, SlidersHorizontal } from "lucide-react"
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
import { fadeInUp } from "#/lib/motion-variants"
import { cn } from "#/lib/utils"
import {
  ResponsivePageShell,
  FilterRail,
  MetaDot,
  MetaItem,
} from "#/components/layout/ResponsivePageShell"

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
type SortMode = "newest" | "oldest"

const SORT_OPTIONS: Array<{
  mode: SortMode
  label: string
  description: string
  Icon: typeof ArrowDownAZ
}> = [
  { mode: "newest", label: "Newest", description: "Most recent first", Icon: ArrowDownAZ },
  { mode: "oldest", label: "Oldest", description: "Earliest first", Icon: ArrowUpAZ },
]

function ResearchListPage() {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortMode>("newest")
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteArticles({ pageSize: 9 })

  useEffect(() => {
    if (!sortOpen) return
    function onClick(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSortOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [sortOpen])

  const items = useMemo<ResearchCardItem[]>(() => {
    const pages = data?.pages.flatMap((page) => page.items) ?? []
    const needle = query.trim().toLowerCase()
    const filtered = pages
      .filter((article) => {
        if (activeFilter !== ALL_FILTER && article.category?.slug !== activeFilter) return false
        if (!needle) return true
        return (
          article.title.toLowerCase().includes(needle) ||
          article.excerpt.toLowerCase().includes(needle)
        )
      })
      .map(toCardItem)

    filtered.sort((a, b) => {
      const aTs = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const bTs = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return sort === "newest" ? bTs - aTs : aTs - bTs
    })
    return filtered
  }, [data, activeFilter, query, sort])

  const totalShown = data?.pages[0]?.total ?? 0
  const domainCount = useMemo(() => {
    const set = new Set<string>()
    data?.pages.forEach((page) => {
      page.items.forEach((article) => {
        if (article.category?.slug) set.add(article.category.slug)
      })
    })
    return set.size || CATEGORIES.length
  }, [data])

  const sentinelRef = useInfiniteScroll({
    enabled: true,
    loading: isFetchingNextPage,
    hasMore: hasNextPage,
    onLoadMore: () => {
      void fetchNextPage()
    },
  })

  const activeSort = SORT_OPTIONS.find((option) => option.mode === sort) ?? SORT_OPTIONS[0]
  const ActiveSortIcon = activeSort.Icon

  return (
    <ResponsivePageShell
      eyebrow="Research feed"
      eyebrowAccent="blue"
      title="Latest research"
      description="Experiments, engineering notes, and ideas from the lab."
      meta={
        <>
          <MetaItem>
            {totalShown > 0
              ? `${totalShown}+ articles published`
              : "Loading articles"}
          </MetaItem>
          <MetaDot />
          <MetaItem>{domainCount} active domains</MetaItem>
          <MetaDot />
          <MetaItem>Updated continuously</MetaItem>
        </>
      }
      filters={
        <FilterRail ariaLabel="Filter articles by domain">
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
        </FilterRail>
      }
      controls={
        <>
          <div ref={sortRef} className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSortOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              className={cn(
                "inline-flex h-10 w-full items-center gap-2 rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] px-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors sm:h-9 sm:w-auto",
                sortOpen
                  ? "border-[var(--lab-blue)]/40 text-[var(--lab-ink)]"
                  : "text-[var(--lab-ink-soft)] hover:border-[var(--lab-blue)]/30 hover:text-[var(--lab-ink)]",
              )}
            >
              <ActiveSortIcon className="size-3.5 shrink-0" aria-hidden />
              <span className="flex-1 text-left sm:flex-none">
                <span className="text-[var(--lab-ink-soft)]/70 sm:hidden">Sort: </span>
                {activeSort.label}
              </span>
              <ChevronDown
                className={cn("size-3.5 transition-transform", sortOpen && "rotate-180")}
                aria-hidden
              />
            </button>

            {sortOpen ? (
              <div
                role="listbox"
                aria-label="Sort articles"
                className="absolute left-0 right-0 z-20 mt-2 origin-top-right overflow-hidden rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] shadow-xl shadow-black/20 sm:left-auto sm:right-0 sm:w-56"
              >
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.Icon
                  const selected = option.mode === sort
                  return (
                    <button
                      key={option.mode}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        setSort(option.mode)
                        setSortOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--lab-card-elevated)]",
                        selected && "bg-[var(--lab-blue)]/10",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0",
                          selected ? "text-[var(--lab-blue)]" : "text-[var(--lab-ink-soft)]",
                        )}
                        aria-hidden
                      />
                      <span className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "block font-mono text-[11px] uppercase tracking-[0.16em]",
                            selected ? "text-[var(--lab-blue)]" : "text-[var(--lab-ink)]",
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="block text-[11px] text-[var(--lab-ink-soft)]">
                          {option.description}
                        </span>
                      </span>
                      {selected ? (
                        <Check className="size-3.5 text-[var(--lab-blue)]" aria-hidden />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className="relative w-full sm:w-64 lg:w-72">
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
              className="h-10 border-[var(--lab-line)] bg-[var(--lab-card)] pl-9 font-mono text-xs text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)] sm:h-9"
            />
          </div>
        </>
      }
      footer={
        <>
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          {isFetchingNextPage ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]"
            >
              <Loader2 className="size-3.5 animate-spin text-[var(--lab-orange)]" aria-hidden />
              Loading more
            </motion.div>
          ) : null}
          {!hasNextPage && !isPending && items.length > 0 ? (
            <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/60">
              End of research
            </p>
          ) : null}
        </>
      }
    >
      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-xl sm:h-72" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)]/30 px-6 py-10 text-center sm:py-12">
          <p className="text-sm font-medium text-[var(--lab-ink)]">
            Unable to load articles.
          </p>
          <p className="mt-1 text-xs text-[var(--lab-ink-soft)]">
            Please try again in a moment.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)]/50 px-6 py-12 text-center sm:py-16">
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
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {items.map((article, index) => (
            <li key={article.id} className="h-full">
              <ResearchCard
                article={article}
                variant={index === 0 && sort === "newest" ? "featured" : "default"}
              />
            </li>
          ))}
        </ul>
      )}
    </ResponsivePageShell>
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
    author: article.author ? { name: article.author.name } : null,
    tags: article.tags?.map((t) => t.tag) ?? [],
  }
}
