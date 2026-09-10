import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Trash2, Mail, Loader2 } from "lucide-react"
import {
  useAdminDeleteFeedback,
  useAdminFeedback,
  useAdminUpdateFeedbackStatus,
} from "#/hooks/useAdminFeedback"
import {
  FEEDBACK_STATUS,
  type FeedbackStatus,
  type FeedbackType,
} from "#/lib/domain/feedback"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import { FilterPill } from "#/components/projects/FilterPill"
import { FEEDBACK_STATUS_OPTIONS, FEEDBACK_TYPE_OPTIONS } from "#/lib/domain/feedback"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

const STATUS_FILTERS: Array<{ value: FeedbackStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  ...FEEDBACK_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
]

const TYPE_FILTERS: Array<{ value: FeedbackType | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  ...FEEDBACK_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
]

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Admin" }] }),
  component: AdminFeedbackPage,
})

function AdminFeedbackPage() {
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "ALL">("ALL")

  const filters = {
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    ...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
  }
  const { data: feedback, isPending, isError } = useAdminFeedback(filters)
  const updateStatus = useAdminUpdateFeedbackStatus()
  const remove = useAdminDeleteFeedback()

  async function onDelete(id: string, name: string) {
    if (typeof window !== "undefined" && !window.confirm(`Delete feedback from "${name}"?`)) return
    await remove.mutateAsync(id)
  }

  return (
    <div className="space-y-8">
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
          Feedback
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
          Inbox
        </h1>
        <p className="mt-2 text-sm text-[var(--lab-ink-soft)]">
          Submissions from the public homepage form.
        </p>
      </motion.header>

      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
          Status
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <FilterPill
              key={filter.value}
              active={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </FilterPill>
          ))}
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
          Type
        </p>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((filter) => (
            <FilterPill
              key={filter.value}
              active={typeFilter === filter.value}
              onClick={() => setTypeFilter(filter.value)}
            >
              {filter.label}
            </FilterPill>
          ))}
        </div>
      </div>

      {isPending && (
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Unable to load feedback.</p>}

      {!isPending && !isError && (feedback?.length ?? 0) === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--lab-line)] bg-[var(--lab-card)] p-10 text-center">
          <p className="text-sm font-medium text-[var(--lab-ink)]">No feedback here.</p>
          <p className="mt-1 text-xs text-[var(--lab-ink-soft)]">
            Once visitors submit the homepage form, messages will appear here.
          </p>
        </div>
      )}

      {feedback && feedback.length > 0 && (
        <ul className="space-y-3">
          {feedback.map((item) => (
            <motion.li
              key={item.id}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_OPTIONS}
              variants={fadeInUp}
              className="research-card-surface p-5"
            >
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="lab-tech-tag"
                    data-active={item.status === FEEDBACK_STATUS.NEW ? "true" : "false"}
                  >
                    {item.status}
                  </span>
                  <span className="lab-tech-tag">{item.type}</span>
                  <p className="font-mono text-xs text-[var(--lab-ink-soft)]">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${item.email}`}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                  >
                    <Mail className="size-3.5" />
                    Reply
                  </a>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete feedback from ${item.name}`}
                    onClick={() => void onDelete(item.id, item.name)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="size-3.5 text-[var(--lab-ink-soft)] hover:text-destructive" />
                  </Button>
                </div>
              </header>
              <div className="mt-3">
                <p className="text-sm font-medium text-[var(--lab-ink)]">{item.name}</p>
                <p className="text-xs text-[var(--lab-ink-soft)]">{item.email}</p>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                {item.message}
              </p>
              <footer className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                  Mark as
                </span>
                {FEEDBACK_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateStatus.mutate({ id: item.id, status: option.value })
                    }
                    disabled={
                      item.status === option.value || updateStatus.isPending
                    }
                    className={cn(
                      "rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                      item.status === option.value
                        ? "border-[var(--lab-orange)] bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]"
                        : "border-[var(--lab-line)] bg-transparent text-[var(--lab-ink-soft)] hover:border-[var(--lab-line-strong)] hover:text-[var(--lab-ink)]",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
                {updateStatus.isPending && (
                  <Loader2 className="size-3 animate-spin text-[var(--lab-ink-soft)]" />
                )}
              </footer>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}

function cn(...inputs: Array<string | undefined | false>): string {
  return inputs.filter(Boolean).join(" ")
}
