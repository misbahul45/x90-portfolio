import { useEffect, useMemo, useRef, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowDownAZ, ArrowUpAZ, Check, ChevronDown, Loader2, Search, SlidersHorizontal, Sparkles } from "lucide-react"
import { useInfiniteProjects } from "#/hooks/useProjects"
import { useInfiniteScroll } from "#/hooks/useInfiniteScroll"
import { Input } from "#/components/ui/input"
import { Skeleton } from "#/components/ui/skeleton"
import { ProjectCard } from "#/components/projects/ProjectCard"
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

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — XNINETZY Labs" },
      {
        name: "description",
        content: "Production-grade platforms and research systems built from the lab.",
      },
    ],
  }),
  component: ProjectsListPage,
})

const ALL_FILTER = "all"
type SortMode = "featured" | "newest" | "oldest"

const SORT_OPTIONS: Array<{
  mode: SortMode
  label: string
  description: string
  Icon: typeof Sparkles
}> = [
  { mode: "featured", label: "Featured", description: "Hand-picked by the lab", Icon: Sparkles },
  { mode: "newest", label: "Newest", description: "Recently published", Icon: ArrowDownAZ },
  { mode: "oldest", label: "Oldest", description: "Earliest first", Icon: ArrowUpAZ },
]

function ProjectsListPage() {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortMode>("featured")
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProjects({ pageSize: 9 })

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

  const items = useMemo(() => {
    const pages = data?.pages.flatMap((page) => page.items) ?? []
    const needle = query.trim().toLowerCase()
    const filtered = pages.filter((project) => {
      if (activeFilter !== ALL_FILTER && project.category?.slug !== activeFilter) return false
      if (!needle) return true
      return (
        project.title.toLowerCase().includes(needle) ||
        project.description.toLowerCase().includes(needle) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(needle))
      )
    })

    filtered.sort((a, b) => {
      if (sort === "featured") {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return a.order - b.order
      }
      const aTs = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const bTs = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return sort === "newest" ? bTs - aTs : aTs - bTs
    })
    return filtered
  }, [data, activeFilter, query, sort])

  const totalShown = data?.pages[0]?.total ?? 0
  const featuredCount = useMemo(
    () => (data?.pages.flatMap((p) => p.items) ?? []).filter((p) => p.featured).length,
    [data],
  )

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
      eyebrow="Project registry"
      title="Systems we've engineered"
      description="Production-grade platforms and research systems built from the lab — agents, retrieval pipelines, and intelligent software engineered to survive contact with real users."
      meta={
        <>
          <MetaItem>
            {totalShown > 0 ? `${totalShown}+ systems shipped` : "Loading systems"}
          </MetaItem>
          <MetaDot />
          <MetaItem>
            {featuredCount > 0
              ? `${featuredCount} featured`
              : `${CATEGORIES.length} domains`}
          </MetaItem>
          <MetaDot />
          <MetaItem>Production-grade only</MetaItem>
        </>
      }
      filters={
        <FilterRail ariaLabel="Filter projects by domain">
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
                  ? "border-[var(--lab-orange-glow)]/40 text-[var(--lab-ink)]"
                  : "text-[var(--lab-ink-soft)] hover:border-[var(--lab-orange-glow)]/30 hover:text-[var(--lab-ink)]",
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
                aria-label="Sort projects"
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
                        selected && "bg-[var(--lab-orange-soft)]/40",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0",
                          selected ? "text-[var(--lab-orange)]" : "text-[var(--lab-ink-soft)]",
                        )}
                        aria-hidden
                      />
                      <span className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "block font-mono text-[11px] uppercase tracking-[0.16em]",
                            selected ? "text-[var(--lab-orange)]" : "text-[var(--lab-ink)]",
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="block text-[11px] text-[var(--lab-ink-soft)]">
                          {option.description}
                        </span>
                      </span>
                      {selected ? (
                        <Check className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
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
              placeholder="Search projects or stack…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search projects"
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
              End of projects
            </p>
          ) : null}
        </>
      }
    >
      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-xl sm:h-72" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Unable to load projects." />
      ) : items.length === 0 ? (
        <EmptyState message="No systems match your filters." hint="Try clearing the search or switching to a different domain." />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {items.map((project, index) => (
            <li key={project.id} className="h-full">
              <ProjectCard
                project={project}
                variant={
                  index === 0 && (project.featured || sort === "featured")
                    ? "featured"
                    : "default"
                }
              />
            </li>
          ))}
        </ul>
      )}
    </ResponsivePageShell>
  )
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)]/40 px-6 py-12 text-center sm:py-16">
      <SlidersHorizontal className="mx-auto size-6 text-[var(--lab-ink-soft)]" aria-hidden />
      <p className="mt-3 text-sm font-medium text-[var(--lab-ink)]">{message}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--lab-ink-soft)]">{hint}</p> : null}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)]/30 px-6 py-10 text-center sm:py-12">
      <p className="text-sm font-medium text-[var(--lab-ink)]">{message}</p>
      <p className="mt-1 text-xs text-[var(--lab-ink-soft)]">Please try again.</p>
    </div>
  )
}
