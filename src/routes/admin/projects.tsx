import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Plus, Trash2, ExternalLink, Github, Loader2, Pencil } from "lucide-react"
import { useAdminProjects, useAdminDeleteProject, useAdminCreateProject } from "#/hooks/useAdminProjects"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Textarea } from "#/components/ui/textarea"
import { Label } from "#/components/ui/label"
import { Skeleton } from "#/components/ui/skeleton"
import { Switch } from "#/components/ui/switch"
import { fadeInUp } from "#/lib/motion-variants"

export const Route = createFileRoute("/admin/projects")({
  head: () => ({ meta: [{ title: "Projects — Admin" }] }),
  component: AdminProjectsPage,
})

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

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
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
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
            Projects
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
            Engineering systems
          </h1>
          <p className="mt-2 text-sm text-[var(--lab-ink-soft)]">
            Curate the systems we&apos;ve built.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="font-mono"
        >
          {showForm ? "Cancel" : (
            <>
              <Plus className="size-4" />
              New project
            </>
          )}
        </Button>
      </motion.header>

      {showForm && (
        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          onSubmit={onCreate}
          className="research-card-surface space-y-4 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-name" className="text-[var(--lab-ink)]">Name</Label>
              <Input
                id="project-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-slug" className="text-[var(--lab-ink)]">Slug</Label>
              <Input
                id="project-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="auto if blank"
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-description" className="text-[var(--lab-ink)]">Description</Label>
            <Textarea
              id="project-description"
              required
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-tech" className="text-[var(--lab-ink)]">Stack (comma-separated)</Label>
            <Input
              id="project-tech"
              value={tech}
              onChange={(event) => setTech(event.target.value)}
              placeholder="TypeScript, PostgreSQL, OpenAI"
              className="border-[var(--lab-line)] bg-[var(--lab-card)] font-mono text-xs text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
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
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-demo" className="text-[var(--lab-ink)]">Demo URL</Label>
              <Input
                id="project-demo"
                type="url"
                value={demoUrl}
                onChange={(event) => setDemoUrl(event.target.value)}
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <Switch
                checked={featured}
                onCheckedChange={(value) => setFeatured(value)}
                aria-label="Feature on homepage"
              />
              Feature on homepage
            </label>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting} className="font-mono">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Create project
            </Button>
          </div>
        </motion.form>
      )}

      {isPending && (
        <div className="space-y-2">
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">Unable to load projects.</p>
      )}

      {!isPending && !isError && (projects?.length ?? 0) === 0 && (
        <p className="text-sm text-[var(--lab-ink-soft)]">No projects yet.</p>
      )}

      {projects && projects.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)]">
          <ul className="divide-y divide-[var(--lab-line)]">
            {projects.map((project) => (
              <li
                key={project.id}
                className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[2fr_1fr_160px] sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="lab-tech-tag w-fit shrink-0">
                    {project.category?.name ?? "—"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--lab-ink)]">
                      {project.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-[var(--lab-ink-soft)]">
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map((techItem) => (
                    <span key={techItem} className="lab-tech-tag">
                      {techItem}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-1">
                  {project.githubUrl && (
                    <Button asChild size="icon" variant="ghost" aria-label="Source">
                      <a href={project.githubUrl} target="_blank" rel="noreferrer">
                        <Github className="size-3.5" />
                      </a>
                    </Button>
                  )}
                  {project.demoUrl && (
                    <Button asChild size="icon" variant="ghost" aria-label="Demo">
                      <a href={project.demoUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                  <Button asChild size="icon" variant="ghost" aria-label={`Edit ${project.title}`}>
                    <Link to="/admin/projects/$id" params={{ id: project.id }}>
                      <Pencil className="size-3.5 text-[var(--lab-ink-soft)]" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${project.title}`}
                    onClick={() => void onDelete(project.id, project.title)}
                    disabled={deleteProject.isPending}
                  >
                    <Trash2 className="size-3.5 text-[var(--lab-ink-soft)] hover:text-destructive" />
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
