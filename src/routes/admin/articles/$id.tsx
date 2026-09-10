import { useEffect, useMemo, useState } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowLeft, Loader2, Save, Send, Trash2 } from "lucide-react"
import { useAdminArticle, useAdminDeleteArticle, useAdminUpdateArticle } from "#/hooks/useAdminArticles"
import { useCategories, type CategoryItem } from "#/hooks/useCategories"
import { RichEditor } from "#/components/admin/RichEditor"
import { TagMultiSelect } from "#/components/admin/TagMultiSelect"
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
import { Skeleton } from "#/components/ui/skeleton"
import { ARTICLE_STATUS, type ArticleStatus } from "#/lib/domain/article-status"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

export const Route = createFileRoute("/admin/articles/$id")({
  head: () => ({ meta: [{ title: "Edit article — Admin" }] }),
  component: AdminArticleEdit,
})

function AdminArticleEdit() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: article, isPending } = useAdminArticle(id)
  const { data: categories } = useCategories()
  const update = useAdminUpdateArticle()
  const remove = useAdminDeleteArticle()

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [status, setStatus] = useState<ArticleStatus>(ARTICLE_STATUS.DRAFT)
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [tagIds, setTagIds] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!article) return
    setTitle(article.title)
    setSlug(article.slug)
    setExcerpt(article.excerpt)
    setCoverImage(article.coverImage ?? "")
    setStatus(article.status as ArticleStatus)
    setContent(article.content)
    setCategoryId(article.category?.id ?? "")
    setTagIds(article.tags?.map((entry) => entry.tag.id) ?? [])
  }, [article])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!article) return
    setErrors({})
    try {
    await update.mutateAsync({
      id: article.id,
      title,
      slug: slug || undefined,
      excerpt,
      coverImage: coverImage || null,
      status,
      content,
      categoryId: categoryId || null,
      publishedAt:
        status === ARTICLE_STATUS.PUBLISHED && !article.publishedAt
          ? new Date()
          : article.publishedAt
            ? new Date(article.publishedAt)
            : null,
      tagIds,
    })
    } catch (error) {
      const fieldErrors = extractZodErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
    }
  }

  async function onDelete() {
    if (!article) return
    if (typeof window !== "undefined" && !window.confirm(`Delete "${article.title}"?`)) return
    await remove.mutateAsync(article.id)
    navigate({ to: "/admin/articles" })
  }

  const submitLabel = useMemo(() => {
    if (update.isPending) return "Saving…"
    return status === ARTICLE_STATUS.PUBLISHED ? "Publish" : "Save draft"
  }, [update.isPending, status])

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="research-card-surface p-10 text-center">
        <p className="text-sm text-[var(--lab-ink)]">Article not found.</p>
        <Link
          to="/admin/articles"
          className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.16em] text-[var(--lab-orange)] no-underline"
        >
          ← Back to articles
        </Link>
      </div>
    )
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
          >
            <ArrowLeft className="size-3.5" />
            All articles
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--lab-ink)]">
            Edit article
          </h1>
          <p className="mt-1 font-mono text-xs text-[var(--lab-ink-soft)]">
            Last updated: {new Date(article.publishedAt ?? Date.now()).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void onDelete()}
            disabled={remove.isPending}
            aria-label="Delete article"
            className="text-[var(--lab-ink-soft)] hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button type="submit" className="font-mono" disabled={update.isPending}>
            {update.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : status === ARTICLE_STATUS.PUBLISHED ? (
              <Send className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {submitLabel}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="article-title" className="text-[var(--lab-ink)]">Title</Label>
            <Input
              id="article-title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-slug" className="text-[var(--lab-ink)]">Slug</Label>
            <Input
              id="article-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="border-[var(--lab-line)] bg-[var(--lab-card)] font-mono text-xs text-[var(--lab-ink)]"
            />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="article-excerpt" className="text-[var(--lab-ink)]">Excerpt</Label>
            <Textarea
              id="article-excerpt"
              rows={3}
              required
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
            />
            {errors.excerpt && <p className="text-xs text-destructive">{errors.excerpt}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[var(--lab-ink)]">Content</Label>
            <RichEditor value={content} onChange={setContent} />
            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
          </div>
        </motion.div>

        <motion.aside
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="research-card-surface h-fit space-y-4 p-5"
        >
          <div className="space-y-1.5">
            <Label className="text-[var(--lab-ink)]">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ArticleStatus)}>
              <SelectTrigger className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]">
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
              <SelectTrigger className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]">
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
              className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
            />
          </div>
          <p className="font-mono text-[10px] text-[var(--lab-ink-soft)]">
            Public URL: /research/{slug || article.slug}
          </p>
        </motion.aside>
      </div>
    </motion.form>
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
