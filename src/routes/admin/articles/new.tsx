import { Suspense, lazy, useMemo, useState } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { ArrowLeft, Loader2, Save, Send } from "lucide-react"
import { useAdminCreateArticle } from "#/hooks/useAdminArticles"
import { useCategories, type CategoryItem } from "#/hooks/useCategories"
import { TagMultiSelect } from "#/components/admin/TagMultiSelect"
import { Skeleton } from "#/components/ui/skeleton"

const RichEditor = lazy(() =>
  import("#/components/admin/RichEditor").then((m) => ({ default: m.RichEditor })),
)
import { adminInputClass, adminOutlineClass, adminPanelClass, adminSelectTriggerClass } from "#/components/admin/styles"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { Label } from "#/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { ARTICLE_STATUS, type ArticleStatus } from "#/lib/domain/article-status"
import { cn } from "#/lib/utils"

export const Route = createFileRoute("/admin/articles/new")({
  head: () => ({ meta: [{ title: "New article — Admin" }] }),
  component: AdminArticleNew,
})

function AdminArticleNew() {
  const navigate = useNavigate()
  const create = useAdminCreateArticle()
  const { data: categories } = useCategories()

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [status, setStatus] = useState<ArticleStatus>(ARTICLE_STATUS.DRAFT)
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [tagIds, setTagIds] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    try {
      const created = await create.mutateAsync({
        title,
        slug: slug || undefined,
        excerpt,
        coverImage: coverImage || null,
        status,
        content,
        categoryId: categoryId || null,
        publishedAt: status === ARTICLE_STATUS.PUBLISHED ? new Date() : null,
        tagIds,
      })
      navigate({ to: "/admin/articles/$id", params: { id: created.id } })
    } catch (error) {
      const fieldErrors = extractZodErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
    }
  }

  const submitLabel = useMemo(() => {
    if (create.isPending) return status === ARTICLE_STATUS.PUBLISHED ? "Publishing…" : "Saving…"
    return status === ARTICLE_STATUS.PUBLISHED ? "Publish" : "Save draft"
  }, [create.isPending, status])

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All articles
          </Link>
          <h1 className="dm-title mt-3">
            New article
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className={adminOutlineClass}>
            <Link to="/admin/articles">Cancel</Link>
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : status === ARTICLE_STATUS.PUBLISHED ? (
              <Send aria-hidden />
            ) : (
              <Save aria-hidden />
            )}
            {submitLabel}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="article-title" className="text-[var(--lab-ink)]">Title</Label>
            <Input
              id="article-title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Why naive RAG breaks on multi-hop questions"
              className={adminInputClass}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-slug" className="text-[var(--lab-ink)]">Slug</Label>
            <Input
              id="article-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="auto-generated from title if blank"
              className={adminInputClass}
            />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-excerpt" className="text-[var(--lab-ink)]">Excerpt</Label>
            <Textarea
              id="article-excerpt"
              rows={3}
              required
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="One or two sentences that summarize the article."
              className={adminInputClass}
            />
            {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[var(--lab-ink)]">Content</Label>
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
              <RichEditor value={content} onChange={setContent} />
            </Suspense>
            {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
          </div>
        </div>

        <aside className={cn(adminPanelClass, "h-fit space-y-5 p-5")}>
          <div className="space-y-1.5">
            <Label className="text-[var(--lab-ink)]">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ArticleStatus)}>
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ARTICLE_STATUS.DRAFT}>Draft</SelectItem>
                <SelectItem value={ARTICLE_STATUS.PUBLISHED}>Published</SelectItem>
                <SelectItem value={ARTICLE_STATUS.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[var(--lab-ink)]">Category</Label>
            <Select
              value={categoryId || "__none__"}
              onValueChange={(value) => setCategoryId(value === "__none__" ? "" : value)}
            >
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— none —</SelectItem>
                {(categories ?? []).map((category: CategoryItem) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[var(--lab-ink)]">Tags</Label>
            <TagMultiSelect value={tagIds} onChange={setTagIds} emptyHint="No tags selected" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-cover" className="text-[var(--lab-ink)]">Cover image URL</Label>
            <Input
              id="article-cover"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="https://…"
              className={adminInputClass}
            />
          </div>
          <p className="text-sm text-[var(--lab-ink-soft)]">
            Phase 1: paste an image URL. ImageKit upload arrives in phase 3.
          </p>
        </aside>
      </div>
    </form>
  )
}

function extractZodErrors(error: unknown): Record<string, string> | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues: Array<{ path: Array<string | number>; message: string }> }).issues)
  ) {
    const result: Record<string, string> = {}
    for (const issue of (error as { issues: Array<{ path: Array<string | number>; message: string }> }).issues) {
      const key = String(issue.path[0] ?? "_")
      result[key] = issue.message
    }
    return result
  }
  return null
}
