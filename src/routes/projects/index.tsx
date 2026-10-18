import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Loader2, Search } from "lucide-react"
import { Carousel } from "#/components/deepmind/Carousel"
import { FilterTabs, type FilterOption } from "#/components/deepmind/FilterTabs"
import { PageIntro } from "#/components/deepmind/PageIntro"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { ProjectCard } from "#/components/projects/ProjectCard"
import { Input } from "#/components/ui/input"
import { Skeleton } from "#/components/ui/skeleton"
import { useDebouncedValue } from "#/hooks/useDebouncedValue"
import { useInfiniteScroll } from "#/hooks/useInfiniteScroll"
import { useInfiniteProjects } from "#/hooks/useProjects"
import { CATEGORIES } from "#/lib/domain/categories"

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — X90 Labs" },
      {
        name: "description",
        content: "Production-grade platforms and research systems built from the lab.",
      },
    ],
  }),
  component: ProjectsListPage,
})

const ALL_DOMAINS = "all"
const FEATURED_COUNT = 5
const PAGE_SIZE = 9

const DOMAIN_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: ALL_DOMAINS, label: "All" },
  ...CATEGORIES.map((category) => ({ value: category.slug, label: category.name })),
]

function ProjectsListPage() {
  const [domain, setDomain] = useState(ALL_DOMAINS)
  const [search, setSearch] = useState("")
  const query = useDebouncedValue(search.trim())

  const featured = useInfiniteProjects({ featuredOnly: true, pageSize: FEATURED_COUNT })
  const list = useInfiniteProjects({
    categorySlug: domain === ALL_DOMAINS ? undefined : domain,
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
        label="Projects"
        title="Systems we have engineered"
        description="Production-grade platforms and research systems: agents, retrieval pipelines and software built to survive real users."
      />

      {featuredItems.length > 0 ? (
        <section aria-labelledby="featured-projects-heading" className="dm-section">
          <div className="dm-shell">
            <Reveal>
              <SectionHeader
                headingId="featured-projects-heading"
                title="Featured systems"
                description="Hand-picked from the lab."
              />
            </Reveal>
            <div className="mt-12">
              <Carousel
                label="Featured projects"
                items={featuredItems}
                getKey={(project) => project.id}
                renderSlide={(project) => <ProjectCard project={project} />}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="all-projects-heading" className="dm-section border-t border-[var(--lab-line)]">
        <div className="dm-shell">
          <Reveal>
            <SectionHeader
              headingId="all-projects-heading"
              title="All projects"
              description={total > 0 ? `${total} published ${total === 1 ? "system" : "systems"}.` : "Browse by domain or search."}
            />
          </Reveal>

          <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <FilterTabs label="Filter projects by domain" options={DOMAIN_OPTIONS} value={domain} onChange={setDomain} />
            <div className="relative w-full lg:w-80">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--lab-ink-soft)]"
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects"
                aria-label="Search projects"
                className="h-11 rounded-full border-[var(--lab-line-strong)] bg-transparent pl-10 text-[var(--lab-ink)] shadow-none placeholder:text-[var(--lab-ink-soft)]/70 focus-visible:border-[var(--lab-orange)] focus-visible:ring-[var(--lab-orange)]/20"
              />
            </div>
          </div>

          <div className="mt-10" aria-live="polite">
            {list.isPending ? (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton className="aspect-[16/9] w-full rounded-[1.5rem]" />
                    <Skeleton className="mt-5 h-5 w-2/3" />
                    <Skeleton className="mt-3 h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : list.isError ? (
              <p className="dm-body">Projects could not be loaded. Please try again shortly.</p>
            ) : items.length === 0 ? (
              <p className="dm-body">No projects match these filters. Try another domain or a different search.</p>
            ) : (
              <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((project) => (
                  <li key={project.id}>
                    <ProjectCard project={project} />
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
            <p className="dm-body mt-10 text-center">You have reached the end of the projects.</p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
