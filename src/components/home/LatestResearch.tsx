import { Link } from "@tanstack/react-router"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { outlinePillClass } from "#/components/deepmind/styles"
import { ResearchNewsItem } from "#/components/research/ResearchNewsItem"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import { useInfiniteArticles } from "#/hooks/useArticles"

const PREVIEW_COUNT = 6

export function LatestResearch() {
  const { data, isPending, isError } = useInfiniteArticles({ pageSize: PREVIEW_COUNT })
  const articles = (data?.pages[0]?.items ?? []).slice(0, PREVIEW_COUNT)

  return (
    <section
      id="research"
      aria-labelledby="research-heading"
      className="dm-section border-t border-[var(--lab-line)]"
    >
      <div className="dm-shell">
        <Reveal>
          <SectionHeader
            headingId="research-heading"
            title="Latest research"
            description="Experiments, evaluations and engineering notes from the lab."
            action={
              <Button asChild variant="outline" className={outlinePillClass}>
                <Link to="/research">View all research</Link>
              </Button>
            }
          />
        </Reveal>

        <div className="mt-12">
          {isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-56 rounded-3xl" />
              ))}
            </div>
          ) : isError ? (
            <p className="dm-body">Research could not be loaded. Please try again shortly.</p>
          ) : articles.length === 0 ? (
            <p className="dm-body">No research has been published yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <li key={article.id}>
                  <Reveal delay={(index % 3) * 0.08} className="h-full">
                    <ResearchNewsItem article={article} className="min-h-56" />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
