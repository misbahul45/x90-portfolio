import { useState, type FormEvent } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ExternalLink, Github, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { AdminPageHeader } from "#/components/admin/AdminPageHeader"
import { adminIconButtonClass, adminInputClass, adminPanelClass } from "#/components/admin/styles"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Skeleton } from "#/components/ui/skeleton"
import { Switch } from "#/components/ui/switch"
import { Textarea } from "#/components/ui/textarea"
import { useAdminCreateProject, useAdminDeleteProject, useAdminProjects } from "#/hooks/useAdminProjects"
import { cn } from "#/lib/utils"

export const Route = createFileRoute("/admin/projects")({
  head: () => ({ meta: [{ title: "Projects — Admin" }] }),
  component: AdminProjectsPage,
})

const STACK_PREVIEW = 4

function AdminProjectsPage() {
  const navigate = useNavigate()
  const { data: projects, isPending, isError } = useAdminProjects()
  const deleteProject = useAdminDeleteProject()
  const createProject = useAdminCreateProject()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [tech, setTech] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [demoUrl, setDemoUrl] = useState("")
  const [featured, setFeatured] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const created = await createProject.mutateAsync({
        title: name,
        slug: slug || undefined,
        description,
        content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: description }] }] }),
        coverImage: null,
        technologies: tech.split(",").map((value) => value.trim()).filter(Boolean),
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        featured,
        order: 0,
        categoryId: null,
        status: "DRAFT",
        researchArticleIds: [],
      })
      setName("")
      setSlug("")
      setDescription("")
      setTech("")
      setGithubUrl("")
      setDemoUrl("")
      setFeatured(false)
      setShowForm(false)
      navigate({ to: "/admin/projects/$id", params: { id: created.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.")
    } finally {
      setSubmitting(false)
    }
  }

  async function onDelete(id: string, title: string) {
    if (typeof window !== "undefined" && !window.confirm(`Delete "${title}"?`)) return
    await deleteProject.mutateAsync(id)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Projects"
        description="Curate the systems we have built."
        action={
          <Button type="button" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus aria-hidden />
                New project
              </>
            )}
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={onCreate} className={cn(adminPanelClass, "space-y-5 p-6")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-name" className="text-[var(--lab-ink)]">
                Name
              </Label>
              <Input
                id="project-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={adminInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-slug" className="text-[var(--lab-ink)]">
                Slug
              </Label>
              <Input
                id="project-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="Generated if blank"
                className={adminInputClass}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-description" className="text-[var(--lab-ink)]">
              Description
            </Label>
            <Textarea
              id="project-description"
              required
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={cn(adminInputClass, "h-auto min-h-24 py-2.5")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-tech" className="text-[var(--lab-ink)]">
              Stack (comma-separated)
            </Label>
            <Input
              id="project-tech"
              value={tech}
              onChange={(event) => setTech(event.target.value)}
              placeholder="TypeScript, PostgreSQL, OpenAI"
              className={adminInputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-github" className="text-[var(--lab-ink)]">
                GitHub URL
              </Label>
              <Input
                id="project-github"
                type="url"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                className={adminInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-demo" className="text-[var(--lab-ink)]">
                Demo URL
              </Label>
              <Input
                id="project-demo"
                type="url"
                value={demoUrl}
                onChange={(event) => setDemoUrl(event.target.value)}
                className={adminInputClass}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3 text-[15px] text-[var(--lab-ink)]">
              <Switch
                checked={featured}
                onCheckedChange={(value) => setFeatured(value)}
                aria-label="Feature on homepage"
              />
              Feature on homepage
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
              Create project
            </Button>
          </div>
        </form>
      )}

      {isPending && (
        <div className="space-y-3">
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Unable to load projects.</p>}

      {!isPending && !isError && (projects?.length ?? 0) === 0 && (
        <div className={cn(adminPanelClass, "p-10")}>
          <p className="text-xl font-medium text-[var(--lab-ink)]">No projects yet</p>
          <p className="dm-body mt-2">Create the first project to feature it on the site.</p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <ul className={cn(adminPanelClass, "divide-y divide-[var(--lab-line)] overflow-hidden")}>
          {projects.map((project) => (
            <li
              key={project.id}
              className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_9.5rem] sm:items-center sm:gap-6"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-[var(--lab-ink)]">{project.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-[var(--lab-ink-soft)] sm:line-clamp-1">
                  {project.category?.name ? `${project.category.name} · ` : ""}
                  {project.description}
                </p>
              </div>
              <p className="truncate font-mono text-sm text-[var(--lab-ink-soft)]">
                {project.technologies.slice(0, STACK_PREVIEW).join(" · ")}
                {project.technologies.length > STACK_PREVIEW
                  ? ` · +${project.technologies.length - STACK_PREVIEW}`
                  : ""}
              </p>
              <div className="-mr-2 flex items-center justify-end gap-0.5 sm:shrink-0">
                {project.githubUrl ? (
                  <Button asChild size="icon" variant="ghost" aria-label="Source" className={adminIconButtonClass}>
                    <a href={project.githubUrl} target="_blank" rel="noreferrer">
                      <Github className="size-4" />
                    </a>
                  </Button>
                ) : null}
                {project.demoUrl ? (
                  <Button asChild size="icon" variant="ghost" aria-label="Demo" className={adminIconButtonClass}>
                    <a href={project.demoUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}
                <Button asChild size="icon" variant="ghost" aria-label={`Edit ${project.title}`} className={adminIconButtonClass}>
                  <Link to="/admin/projects/$id" params={{ id: project.id }}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${project.title}`}
                  onClick={() => void onDelete(project.id, project.title)}
                  disabled={deleteProject.isPending}
                >
                  <Trash2 className="size-4 text-[var(--lab-ink-soft)] hover:text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
