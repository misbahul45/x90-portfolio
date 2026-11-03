import { useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowUpRight, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { AdminPageHeader } from "#/components/admin/AdminPageHeader"
import { AdminStatus, type AdminStatusTone } from "#/components/admin/AdminStatus"
import { adminIconButtonClass, adminInputClass, adminPanelClass, adminTableHeadClass } from "#/components/admin/styles"
import { FilterTabs, type FilterOption } from "#/components/deepmind/FilterTabs"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Skeleton } from "#/components/ui/skeleton"
import { useAdminArticles, useAdminDeleteArticle } from "#/hooks/useAdminArticles"
import { ARTICLE_STATUS, ARTICLE_STATUS_OPTIONS, type ArticleStatus } from "#/lib/domain/article-status"
import { formatFullDate } from "#/lib/format-date"

export const Route = createFileRoute("/admin/articles/")({
  head: () => ({ meta: [{ title: "Articles — Admin" }] }),
  component: AdminArticlesList,
})

const ALL = "ALL"

const FILTERS: ReadonlyArray<FilterOption> = [
  { value: ALL, label: "All" },
  ...ARTICLE_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
]

const STATUS_TONE: Record<ArticleStatus, AdminStatusTone> = {
  [ARTICLE_STATUS.PUBLISHED]: "active",
  [ARTICLE_STATUS.DRAFT]: "neutral",
  [ARTICLE_STATUS.ARCHIVED]: "neutral",
}

const STATUS_LABEL = Object.fromEntries(
  ARTICLE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ArticleStatus, string>

const ROW_GRID = "sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px]"

function AdminArticlesList() {
  const [active, setActive] = useState(ALL)
  const [query, setQuery] = useState("")
  const { data: articles, isPending, isError } = useAdminArticles(
    active === ALL ? {} : { status: active as ArticleStatus },
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
      <AdminPageHeader
        title="Articles"
        description="Drafts, published research and archived posts."
        action={
          <Button asChild>
            <Link to="/admin/articles/new">
              <Plus aria-hidden />
              New article
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <FilterTabs
          label="Filter articles by status"
          options={FILTERS}
          value={active}
          onChange={setActive}
          className="min-w-0"
        />
        <div className="relative w-full sm:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--lab-ink-soft)]"
          />
          <Input
            type="search"
            placeholder="Search articles"
            aria-label="Search articles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`${adminInputClass} pl-9`}
          />
        </div>
      </div>

      {isPending && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Unable to load articles.</p>}

      {!isPending && !isError && filtered.length === 0 && (
        <div className={`${adminPanelClass} p-10`}>
          <p className="text-xl font-medium text-[var(--lab-ink)]">No articles match</p>
          <p className="dm-body mt-2">Try clearing the search or switching the filter.</p>
        </div>
      )}

      {!isPending && !isError && filtered.length > 0 && (
        <div className={`${adminPanelClass} overflow-hidden`}>
          <div className={`hidden border-b border-[var(--lab-line)] px-5 py-3 sm:grid ${ROW_GRID} ${adminTableHeadClass}`}>
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
                className={`grid grid-cols-1 gap-2 px-5 py-4 sm:items-center sm:gap-4 ${ROW_GRID}`}
              >
                <Link
                  to="/admin/articles/$id"
                  params={{ id: article.id }}
                  className="truncate text-[15px] font-medium text-[var(--lab-ink)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                >
                  {article.title}
                </Link>
                <span className="truncate text-sm text-[var(--lab-ink-soft)]">
                  {article.category?.name ?? "—"}
                </span>
                <AdminStatus
                  label={STATUS_LABEL[article.status]}
                  tone={STATUS_TONE[article.status]}
                />
                <span className="text-sm text-[var(--lab-ink-soft)]">
                  {article.publishedAt ? formatFullDate(article.publishedAt) : "—"}
                </span>
                <div className="flex items-center justify-end gap-1">
                  <Button asChild size="icon" variant="ghost" aria-label={`Edit ${article.title}`} className={adminIconButtonClass}>
                    <Link to="/admin/articles/$id" params={{ id: article.id }}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${article.title}`}
                    onClick={() => void onDelete(article.id, article.title)}
                    disabled={deleteArticle.isPending}
                  >
                    <Trash2 className="size-4 text-[var(--lab-ink-soft)] hover:text-destructive" />
                  </Button>
                  <Button asChild size="icon" variant="ghost" aria-label="View public" className={adminIconButtonClass}>
                    <a href={`/research/${article.slug}`} target="_blank" rel="noreferrer">
                      <ArrowUpRight className="size-4" />
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
