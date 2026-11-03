import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Loader2, Mail, Trash2 } from "lucide-react"
import { AdminPageHeader } from "#/components/admin/AdminPageHeader"
import { AdminStatus } from "#/components/admin/AdminStatus"
import { adminOutlineClass, adminPanelClass } from "#/components/admin/styles"
import { FilterTabs, type FilterOption } from "#/components/deepmind/FilterTabs"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import {
  useAdminDeleteFeedback,
  useAdminFeedback,
  useAdminUpdateFeedbackStatus,
} from "#/hooks/useAdminFeedback"
import {
  FEEDBACK_STATUS,
  FEEDBACK_STATUS_OPTIONS,
  FEEDBACK_TYPE_OPTIONS,
  type FeedbackStatus,
  type FeedbackType,
} from "#/lib/domain/feedback"
import { cn } from "#/lib/utils"

const ALL = "ALL"

const STATUS_FILTERS: ReadonlyArray<FilterOption> = [
  { value: ALL, label: "All" },
  ...FEEDBACK_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
]

const TYPE_FILTERS: ReadonlyArray<FilterOption> = [
  { value: ALL, label: "All" },
  ...FEEDBACK_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
]

const STATUS_LABEL = Object.fromEntries(
  FEEDBACK_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<FeedbackStatus, string>

const TYPE_LABEL = Object.fromEntries(
  FEEDBACK_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<FeedbackType, string>

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Admin" }] }),
  component: AdminFeedbackPage,
})

function AdminFeedbackPage() {
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [typeFilter, setTypeFilter] = useState(ALL)

  const filters = {
    ...(statusFilter !== ALL ? { status: statusFilter as FeedbackStatus } : {}),
    ...(typeFilter !== ALL ? { type: typeFilter as FeedbackType } : {}),
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
      <AdminPageHeader title="Inbox" description="Submissions from the public homepage form." />

      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm text-[var(--lab-ink-soft)]">Status</p>
          <FilterTabs
            label="Filter feedback by status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-[var(--lab-ink-soft)]">Type</p>
          <FilterTabs
            label="Filter feedback by type"
            options={TYPE_FILTERS}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </div>
      </div>

      {isPending && (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">Unable to load feedback.</p>}

      {!isPending && !isError && (feedback?.length ?? 0) === 0 && (
        <div className={cn(adminPanelClass, "p-10")}>
          <p className="text-xl font-medium text-[var(--lab-ink)]">No feedback here</p>
          <p className="dm-body mt-2">
            Once visitors submit the homepage form, messages will appear here.
          </p>
        </div>
      )}

      {feedback && feedback.length > 0 && (
        <ul className="space-y-4">
          {feedback.map((item) => (
            <li key={item.id} className={cn(adminPanelClass, "p-6")}>
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                  <AdminStatus
                    label={STATUS_LABEL[item.status]}
                    tone={item.status === FEEDBACK_STATUS.NEW ? "active" : "neutral"}
                  />
                  <span className="text-sm text-[var(--lab-ink-soft)]">{TYPE_LABEL[item.type]}</span>
                  <span className="text-sm text-[var(--lab-ink-soft)]">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm" className="text-[var(--lab-ink-soft)]">
                    <a href={`mailto:${item.email}`}>
                      <Mail aria-hidden />
                      Reply
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete feedback from ${item.name}`}
                    onClick={() => void onDelete(item.id, item.name)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="size-4 text-[var(--lab-ink-soft)] hover:text-destructive" />
                  </Button>
                </div>
              </header>
              <div className="mt-4">
                <p className="text-lg font-medium text-[var(--lab-ink)]">{item.name}</p>
                <p className="text-sm text-[var(--lab-ink-soft)]">{item.email}</p>
              </div>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[var(--lab-ink-soft)]">
                {item.message}
              </p>
              <footer className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--lab-line)] pt-4">
                <span className="mr-1 text-sm text-[var(--lab-ink-soft)]">Mark as</span>
                {FEEDBACK_STATUS_OPTIONS.map((option) => {
                  const current = item.status === option.value
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-pressed={current}
                      onClick={() => updateStatus.mutate({ id: item.id, status: option.value })}
                      disabled={current || updateStatus.isPending}
                      className={cn(
                        "rounded-full",
                        adminOutlineClass,
                        current && "border-[var(--lab-orange)] text-[var(--lab-orange)]",
                      )}
                    >
                      {option.label}
                    </Button>
                  )
                })}
                {updateStatus.isPending && (
                  <Loader2 className="size-4 animate-spin text-[var(--lab-ink-soft)]" aria-hidden />
                )}
              </footer>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
