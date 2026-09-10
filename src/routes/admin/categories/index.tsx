import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Plus, Pencil, Trash2, Loader2, Check, X } from "lucide-react"
import {
  useCategories,
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminDeleteCategory,
  type CategoryItem,
} from "#/hooks/useCategories"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp } from "#/lib/motion-variants"

export const Route = createFileRoute("/admin/categories/")({
  head: () => ({ meta: [{ title: "Categories — Admin" }] }),
  component: AdminCategoriesPage,
})

function AdminCategoriesPage() {
  const { data: categories, isPending, isError } = useCategories()
  const createCategory = useAdminCreateCategory()
  const updateCategory = useAdminUpdateCategory()
  const deleteCategory = useAdminDeleteCategory()

  const [editing, setEditing] = useState<CategoryItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setSlug(editing.slug)
      setShowForm(true)
    }
  }, [editing])

  function reset() {
    setName("")
    setSlug("")
    setEditing(null)
    setShowForm(false)
    setError(null)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, name, slug: slug || undefined })
      } else {
        await createCategory.mutateAsync({ name, slug: slug || undefined })
      }
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.")
    }
  }

  async function onDelete(category: CategoryItem) {
    if (typeof window !== "undefined" && !window.confirm(`Delete category "${category.name}"?`)) return
    await deleteCategory.mutateAsync(category.id)
  }

  const submitting = createCategory.isPending || updateCategory.isPending

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
            Taxonomy
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
            Categories
          </h1>
          <p className="mt-2 text-sm text-[var(--lab-ink-soft)]">
            Group research articles and projects under shared labels.
          </p>
        </div>
        {!showForm && (
          <Button type="button" onClick={() => setShowForm(true)} className="font-mono">
            <Plus className="size-4" />
            New category
          </Button>
        )}
      </motion.header>

      {showForm && (
        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          onSubmit={onSubmit}
          className="research-card-surface space-y-4 p-6"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
              {editing ? "Edit category" : "New category"}
            </p>
            <button
              type="button"
              onClick={reset}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-ink)]"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-[var(--lab-ink)]">Name</Label>
              <Input
                id="cat-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Large language models"
                className="border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug" className="text-[var(--lab-ink)]">Slug</Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="auto if blank"
                className="border-[var(--lab-line)] bg-[var(--lab-card)] font-mono text-xs text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : (
              <span aria-hidden />
            )}
            <Button type="submit" disabled={submitting} className="font-mono">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                <Check className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </motion.form>
      )}

      {isPending && (
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Unable to load categories.</p>}

      {categories && categories.length === 0 && !isPending && (
        <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)] p-10 text-center">
          <p className="text-sm font-medium text-[var(--lab-ink)]">No categories yet.</p>
          <p className="mt-1 text-xs text-[var(--lab-ink-soft)]">
            Create one to group articles and projects.
          </p>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)]">
          <ul className="divide-y divide-[var(--lab-line)]">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--lab-ink)]">
                    {category.name}
                  </p>
                  <p className="font-mono text-xs text-[var(--lab-ink-soft)]">
                    {category.slug}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => setEditing(category)}
                  >
                    <Pencil className="size-3.5 text-[var(--lab-ink-soft)]" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => void onDelete(category)}
                    disabled={deleteCategory.isPending}
                  >
                    <Trash2 className="size-3.5 text-[var(--lab-ink-soft)] hover:text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!showForm && categories && categories.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="font-mono text-[var(--lab-ink-soft)]"
            onClick={reset}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}
