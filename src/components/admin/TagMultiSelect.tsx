import { useMemo, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Skeleton } from "#/components/ui/skeleton"
import { useTags, type TagItem } from "#/hooks/useTags"
import { cn } from "#/lib/utils"

type TagMultiSelectProps = {
  value: string[]
  onChange: (next: string[]) => void
  emptyHint?: string
}

export function TagMultiSelect({ value, onChange, emptyHint }: TagMultiSelectProps) {
  const { data: tags, isPending, isError } = useTags()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState("")

  const selected = useMemo(() => new Set(value), [value])
  const filtered = useMemo(() => {
    if (!tags) return []
    const needle = filter.trim().toLowerCase()
    if (!needle) return tags
    return tags.filter((tag) => tag.name.toLowerCase().includes(needle))
  }, [tags, filter])

  function toggle(tag: TagItem) {
    const next = new Set(selected)
    if (next.has(tag.id)) next.delete(tag.id)
    else next.add(tag.id)
    onChange(Array.from(next))
  }

  const triggerLabel = value.length === 0
    ? (emptyHint ?? "Select tags…")
    : `${value.length} tag${value.length === 1 ? "" : "s"} selected`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-[var(--lab-line)] bg-[var(--lab-card)] font-mono text-xs uppercase tracking-[0.16em] text-[var(--lab-ink)] hover:bg-[var(--lab-card)] hover:text-[var(--lab-ink)]"
        >
          <span className="truncate normal-case">{triggerLabel}</span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] border-[var(--lab-line)] bg-[var(--lab-card)] p-0"
      >
        <div className="border-b border-[var(--lab-line)] p-2">
          <Input
            autoFocus
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter tags…"
            className="h-8 border-[var(--lab-line)] bg-[var(--lab-bg)] font-mono text-xs text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)]"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {isPending && (
            <div className="space-y-1.5 p-2">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-7 w-full" />
              ))}
            </div>
          )}
          {isError && (
            <p className="px-2 py-3 text-xs text-destructive">Unable to load tags.</p>
          )}
          {!isPending && !isError && filtered.length === 0 && (
            <p className="px-2 py-3 text-xs text-[var(--lab-ink-soft)]">
              No tags match this filter.
            </p>
          )}
          {!isPending && !isError && filtered.map((tag) => {
            const active = selected.has(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--lab-bg)]",
                  active ? "text-[var(--lab-orange)]" : "text-[var(--lab-ink)]"
                )}
              >
                <span className="min-w-0 truncate">{tag.name}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
                    {tag.slug}
                  </span>
                  {active && <Check className="size-3.5 text-[var(--lab-orange)]" />}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--lab-line)] px-2 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
            {value.length} selected
          </span>
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)]"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TagMultiSelectSkeleton() {
  return <Skeleton className="h-10 w-full" />
}
