import { useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Plus, Pencil, Trash2, Search, ArrowUpRight } from "lucide-react"
import { useAdminArticles, useAdminDeleteArticle } from "#/hooks/useAdminArticles"
import { Skeleton } from "#/components/ui/skeleton"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { FilterPill } from "#/components/projects/FilterPill"
import { ARTICLE_STATUS, type ArticleStatus } from "#/lib/domain/article-status"
import { fadeInUp } from "#/lib/motion-variants"

export const Route = createFileRoute("/admin/articles/")({
  head: () => ({ meta: [{ title: "Articles — Admin" }] }),
  component: AdminArticlesList,
})

const FILTERS: Array<{ value: ArticleStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: ARTICLE_STATUS.PUBLISHED, label: "Published" },
  { value: ARTICLE_STATUS.DRAFT, label: "Drafts" },
  { value: ARTICLE_STATUS.ARCHIVED, label: "Archived" },
]

function AdminArticlesList() {
  const [active, setActive] = useState<ArticleStatus | "ALL">("ALL")
  const [query, setQuery] = useState("")
  const { data: articles, isPending, isError } = useAdminArticles(
    active === "ALL" ? {} : { status: active },
  )
  const deleteArticle = useAdminDeleteArticle()

  const filtered = useMemo(() => {
    if (!articles) return []
    const lowered = query.trim().toLowerCase()
    if (!lowered) return articles
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowered) ||
        article.excerpt.toLowerCase().includes(lowered),
    )
  }, [articles, query])

  async function onDelete(id: string, title: string) {
    if (typeof window === "undefined") return
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    await deleteArticle.mutateAsync(id)
  }

  return (
    <div className="space-y-8">
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
            Research
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
            Articles
          </h1>
          <p className="mt-2 text-sm text-[var(--lab-ink-soft)]">
            Drafts, published articles, and archived posts.
          </p>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--lab-orange)] px-4 py-2 font-mono text-sm font-semibold text-[var(--lab-bg)] no-underline transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          New article
        </Link>
      </motion.header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <FilterPill
              key={filter.value}
              active={active === filter.value}
              onClick={() => setActive(filter.value)}
            >
              {filter.label}
            </FilterPill>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--lab-ink-soft)]"
          />
          <Input
            type="search"
            placeholder="Search articles…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 border-[var(--lab-line)] bg-[var(--lab-card)] pl-9 font-mono text-xs text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
          />
        </div>
      </div>

      {isPending && (
        <div className="space-y-2 rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)] p-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">Unable to load articles.</p>
      )}

      {!isPending && !isError && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)] p-10 text-center">
          <p className="text-sm font-medium text-[var(--lab-ink)]">No articles match.</p>
          <p className="mt-1 text-xs text-[var(--lab-ink-soft)]">
            Try clearing the search or switching the filter.
          </p>
        </div>
      )}

      {!isPending && !isError && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)]">
          <div className="hidden border-b border-[var(--lab-line)] bg-[var(--lab-card-elevated)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_120px]">
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span>Published</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-[var(--lab-line)]">
            {filtered.map((article) => (
              <li
                key={article.id}
                className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[2fr_1fr_1fr_1fr_120px] sm:items-center sm:gap-3"
              >
                <Link
                  to="/admin/articles/$id"
                  params={{ id: article.id }}
                  className="text-sm font-medium text-[var(--lab-ink)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                >
                  {article.title}
                </Link>
                <span className="lab-tech-tag w-fit">
                  {article.category?.name ?? "—"}
                </span>
                <span
                  className="lab-tech-tag w-fit"
                  data-active={article.status === ARTICLE_STATUS.PUBLISHED ? "true" : "false"}
                >
                  {article.status}
                </span>
                <span className="font-mono text-xs text-[var(--lab-ink-soft)]">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString()
                    : "—"}
                </span>
                <div className="flex items-center justify-end gap-1">
                  <Button asChild size="icon" variant="ghost" aria-label={`Edit ${article.title}`}>
                    <Link to="/admin/articles/$id" params={{ id: article.id }}>
                      <Pencil className="size-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${article.title}`}
                    onClick={() => void onDelete(article.id, article.title)}
                    disabled={deleteArticle.isPending}
                  >
                    <Trash2 className="size-3.5 text-[var(--lab-ink-soft)] hover:text-destructive" />
                  </Button>
                  <Button asChild size="icon" variant="ghost" aria-label="View public">
                    <a href={`/research/${article.slug}`} target="_blank" rel="noreferrer">
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
