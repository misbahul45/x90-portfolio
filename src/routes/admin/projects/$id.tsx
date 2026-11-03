import { useEffect, useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react"
import {
  useAdminProject,
  useAdminUpdateProject,
  useAdminDeleteProject,
} from "#/hooks/useAdminProjects"
import { useCategories, type CategoryItem } from "#/hooks/useCategories"
import { adminInputClass, adminPanelClass, adminSelectTriggerClass } from "#/components/admin/styles"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { Label } from "#/components/ui/label"
import { Switch } from "#/components/ui/switch"
import { Skeleton } from "#/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { cn } from "#/lib/utils"

export const Route = createFileRoute("/admin/projects/$id")({
  head: () => ({ meta: [{ title: "Edit project — Admin" }] }),
  component: AdminProjectEdit,
})

function AdminProjectEdit() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: project, isPending } = useAdminProject(id)
  const { data: categories } = useCategories()
  const update = useAdminUpdateProject()
  const remove = useAdminDeleteProject()

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [techInput, setTechInput] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [demoUrl, setDemoUrl] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [featured, setFeatured] = useState(false)
  const [order, setOrder] = useState(0)
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!project) return
    setTitle(project.title)
    setSlug(project.slug)
    setDescription(project.description)
    setTechInput(project.technologies.join(", "))
    setGithubUrl(project.githubUrl ?? "")
    setDemoUrl(project.demoUrl ?? "")
    setCoverImage(project.coverImage ?? "")
    setCategoryId(project.category?.id ?? "")
    setFeatured(project.featured)
    setOrder(project.order)
    setStatus(project.status ?? "DRAFT")
  }, [project])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!project) return
    setErrors({})
    setSubmitError(null)
    try {
      const tech = techInput
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
      await update.mutateAsync({
        id: project.id,
        title,
        slug: slug || undefined,
        description,
        content: project.content,
        coverImage: coverImage || null,
        technologies: tech,
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        featured,
        order: Number(order) || 0,
        categoryId: categoryId || null,
        status,
        researchArticleIds: (project.research ?? []).map((r) => r.article.id),
      })
    } catch (error) {
      const fieldErrors = extractZodErrors(error)
      if (fieldErrors) setErrors(fieldErrors)
      else setSubmitError(error instanceof Error ? error.message : "Save failed.")
    }
  }

  async function onDelete() {
    if (!project) return
    if (typeof window !== "undefined" && !window.confirm(`Delete "${project.title}"?`)) return
    await remove.mutateAsync(project.id)
    navigate({ to: "/admin/projects" })
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className={cn(adminPanelClass, "p-10")}>
        <p className="text-xl font-medium text-[var(--lab-ink)]">Project not found.</p>
        <Link
          to="/admin/projects"
          className="mt-4 inline-block text-[15px] text-[var(--lab-orange)] no-underline hover:underline"
        >
          ← Back to projects
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All projects
          </Link>
          <h1 className="dm-title mt-3">
            Edit project
          </h1>
          <p className="dm-body mt-1">
            Public URL: /projects/{slug || project.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void onDelete()}
            disabled={remove.isPending}
            aria-label="Delete project"
            className="text-[var(--lab-ink-soft)] hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Save aria-hidden />
            )}
            Save changes
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="project-title" className="text-[var(--lab-ink)]">Title</Label>
            <Input
              id="project-title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={adminInputClass}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-slug" className="text-[var(--lab-ink)]">Slug</Label>
            <Input
              id="project-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className={adminInputClass}
            />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-description" className="text-[var(--lab-ink)]">Description</Label>
            <Textarea
              id="project-description"
              rows={4}
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={adminInputClass}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-tech" className="text-[var(--lab-ink)]">
              Stack (comma-separated)
            </Label>
            <Input
              id="project-tech"
              value={techInput}
              onChange={(event) => setTechInput(event.target.value)}
              placeholder="TypeScript, PostgreSQL, OpenAI"
              className={adminInputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-github" className="text-[var(--lab-ink)]">GitHub URL</Label>
              <Input
                id="project-github"
                type="url"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                className={adminInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-demo" className="text-[var(--lab-ink)]">Demo URL</Label>
              <Input
                id="project-demo"
                type="url"
                value={demoUrl}
                onChange={(event) => setDemoUrl(event.target.value)}
                className={adminInputClass}
              />
            </div>
          </div>
        </div>

        <aside className={cn(adminPanelClass, "h-fit space-y-5 p-5")}>
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
            <Label htmlFor="project-cover" className="text-[var(--lab-ink)]">Cover image URL</Label>
            <Input
              id="project-cover"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="https://…"
              className={adminInputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-order" className="text-[var(--lab-ink)]">Order</Label>
            <Input
              id="project-order"
              type="number"
              min={0}
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
              className={adminInputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[var(--lab-ink)]">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
            >
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-3 text-[15px] text-[var(--lab-ink)]">
            <Switch
              checked={featured}
              onCheckedChange={(value) => setFeatured(value)}
              aria-label="Feature on homepage"
            />
            Feature on homepage
          </label>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
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
