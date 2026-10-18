import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Loader2, Search } from "lucide-react"
import { Carousel } from "#/components/deepmind/Carousel"
import { FilterTabs, type FilterOption } from "#/components/deepmind/FilterTabs"
import { PageIntro } from "#/components/deepmind/PageIntro"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { ResearchFeatureCard } from "#/components/research/ResearchFeatureCard"
import { ResearchNewsItem } from "#/components/research/ResearchNewsItem"
import { Input } from "#/components/ui/input"
import { Skeleton } from "#/components/ui/skeleton"
import { useInfiniteArticles } from "#/hooks/useArticles"
import { useDebouncedValue } from "#/hooks/useDebouncedValue"
import { useInfiniteScroll } from "#/hooks/useInfiniteScroll"
import { CATEGORIES } from "#/lib/domain/categories"

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research — X90 Labs" },
      { name: "description", content: "Articles, experiments, and engineering notes from the lab." },
    ],
  }),
  component: ResearchListPage,
})

const ALL_TOPICS = "all"
const FEATURED_COUNT = 5
const PAGE_SIZE = 9

const TOPIC_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: ALL_TOPICS, label: "All" },
  ...CATEGORIES.map((category) => ({ value: category.slug, label: category.name })),
]

function ResearchListPage() {
  const [topic, setTopic] = useState(ALL_TOPICS)
  const [search, setSearch] = useState("")
  const query = useDebouncedValue(search.trim())

  const featured = useInfiniteArticles({ pageSize: FEATURED_COUNT })
  const list = useInfiniteArticles({
    categorySlug: topic === ALL_TOPICS ? undefined : topic,
    query: query || undefined,
    pageSize: PAGE_SIZE,
  })

  const featuredItems = (featured.data?.pages[0]?.items ?? []).slice(0, FEATURED_COUNT)
  const items = list.data?.pages.flatMap((page) => page.items) ?? []
  const total = list.data?.pages[0]?.total ?? 0

  const sentinelRef = useInfiniteScroll({
    enabled: true,
    loading: list.isFetchingNextPage,
    hasMore: list.hasNextPage,
    onLoadMore: () => {
      void list.fetchNextPage()
    },
  })

  return (
    <main>
      <PageIntro
        label="Research"
        title="Experiments, evaluations and notes from the lab"
        description="What we test for real projects, what held up, and what did not."
      />

      {featuredItems.length > 0 ? (
        <section aria-labelledby="featured-heading" className="dm-section">
          <div className="dm-shell">
            <Reveal>
              <SectionHeader
                headingId="featured-heading"
                title="Recent work"
                description="The newest investigations, in the order we published them."
              />
            </Reveal>
            <div className="mt-12">
              <Carousel
                label="Recent research"
                items={featuredItems}
                getKey={(article) => article.id}
                renderSlide={(article) => <ResearchFeatureCard article={article} />}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="all-research-heading" className="dm-section border-t border-[var(--lab-line)]">
        <div className="dm-shell">
          <Reveal>
            <SectionHeader
              headingId="all-research-heading"
              title="All research"
              description={total > 0 ? `${total} published ${total === 1 ? "article" : "articles"}.` : "Browse by topic or search."}
            />
          </Reveal>

          <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <FilterTabs label="Filter research by topic" options={TOPIC_OPTIONS} value={topic} onChange={setTopic} />
            <div className="relative w-full lg:w-80">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--lab-ink-soft)]"
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search research"
                aria-label="Search research"
                className="h-11 rounded-full border-[var(--lab-line-strong)] bg-transparent pl-10 text-[var(--lab-ink)] shadow-none placeholder:text-[var(--lab-ink-soft)]/70 focus-visible:border-[var(--lab-orange)] focus-visible:ring-[var(--lab-orange)]/20"
              />
            </div>
          </div>

          <div className="mt-10" aria-live="polite">
            {list.isPending ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-56 rounded-3xl" />
                ))}
              </div>
            ) : list.isError ? (
              <p className="dm-body">Research could not be loaded. Please try again shortly.</p>
            ) : items.length === 0 ? (
              <p className="dm-body">No research matches these filters. Try another topic or a different search.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((article) => (
                  <li key={article.id}>
                    <ResearchNewsItem article={article} showExcerpt className="min-h-64" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          {list.isFetchingNextPage ? (
            <p className="dm-body mt-8 flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-[var(--lab-orange)]" aria-hidden />
              Loading more
            </p>
          ) : null}
          {!list.hasNextPage && !list.isPending && items.length > 0 ? (
            <p className="dm-body mt-10 text-center">You have reached the end of the research.</p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
