import { useState, type FormEvent } from "react"
import { Check, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { AdminPageHeader } from "#/components/admin/AdminPageHeader"
import { adminIconButtonClass, adminInputClass, adminPanelClass } from "#/components/admin/styles"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Skeleton } from "#/components/ui/skeleton"
import { cn } from "#/lib/utils"

export type TaxonomyItem = {
  id: string
  name: string
  slug: string
}

type TaxonomyManagerProps = {
  noun: string
  title: string
  description: string
  namePlaceholder: string
  emptyHint: string
  items: ReadonlyArray<TaxonomyItem> | undefined
  isPending: boolean
  isError: boolean
  isSaving: boolean
  isDeleting: boolean
  onCreate: (input: { name: string; slug?: string }) => Promise<unknown>
  onUpdate: (input: { id: string; name: string; slug?: string }) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}

export function TaxonomyManager({
  noun,
  title,
  description,
  namePlaceholder,
  emptyHint,
  items,
  isPending,
  isError,
  isSaving,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
}: TaxonomyManagerProps) {
  const [editing, setEditing] = useState<TaxonomyItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setName("")
    setSlug("")
    setEditing(null)
    setShowForm(false)
    setError(null)
  }

  function startEditing(item: TaxonomyItem) {
    setEditing(item)
    setName(item.name)
    setSlug(item.slug)
    setError(null)
    setShowForm(true)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      if (editing) {
        await onUpdate({ id: editing.id, name, slug: slug || undefined })
      } else {
        await onCreate({ name, slug: slug || undefined })
      }
      reset()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Save failed.")
    }
  }

  async function remove(item: TaxonomyItem) {
    if (typeof window !== "undefined" && !window.confirm(`Delete ${noun} "${item.name}"?`)) return
    await onDelete(item.id)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={title}
        description={description}
        action={
          showForm ? undefined : (
            <Button type="button" onClick={() => setShowForm(true)}>
              <Plus aria-hidden />
              New {noun}
            </Button>
          )
        }
      />

      {showForm && (
        <form onSubmit={submit} className={cn(adminPanelClass, "space-y-5 p-6")}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-[var(--lab-ink)]">
              {editing ? `Edit ${noun}` : `New ${noun}`}
            </h2>
            <Button type="button" variant="ghost" onClick={reset} className="text-[var(--lab-ink-soft)]">
              Cancel
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${noun}-name`} className="text-[var(--lab-ink)]">
                Name
              </Label>
              <Input
                id={`${noun}-name`}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={namePlaceholder}
                className={adminInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${noun}-slug`} className="text-[var(--lab-ink)]">
                Slug
              </Label>
              <Input
                id={`${noun}-slug`}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="Generated if blank"
                className={adminInputClass}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            {error ? <p className="text-sm text-destructive">{error}</p> : <span aria-hidden />}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : editing ? (
                <Check aria-hidden />
              ) : (
                <Plus aria-hidden />
              )}
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      )}

      {isPending && (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Unable to load {title.toLowerCase()}.</p>}

      {items && items.length === 0 && !isPending && (
        <div className={cn(adminPanelClass, "p-10")}>
          <p className="text-xl font-medium text-[var(--lab-ink)]">No {title.toLowerCase()} yet</p>
          <p className="dm-body mt-2">{emptyHint}</p>
        </div>
      )}

      {items && items.length > 0 && (
        <ul className={cn(adminPanelClass, "divide-y divide-[var(--lab-line)] overflow-hidden")}>
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-[var(--lab-ink)]">{item.name}</p>
                <p className="truncate text-sm text-[var(--lab-ink-soft)]">{item.slug}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => startEditing(item)}
                  className={adminIconButtonClass}
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => void remove(item)}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-4 text-[var(--lab-ink-soft)] hover:text-destructive" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
