import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Inbox, Loader2, MessageSquare, Trash2 } from "lucide-react"
import { AdminPageHeader } from "#/components/admin/AdminPageHeader"
import { AdminStatus, type AdminStatusTone } from "#/components/admin/AdminStatus"
import { adminOutlineClass, adminPanelClass, adminSelectTriggerClass } from "#/components/admin/styles"
import { FilterTabs, type FilterOption } from "#/components/deepmind/FilterTabs"
import { Button } from "#/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { Skeleton } from "#/components/ui/skeleton"
import {
  useAdminBriefs,
  useDeleteBrief,
  useUpdateBriefStatus,
  type BriefItem,
} from "#/hooks/useBriefs"
import {
  BRIEF_SERVICE_OPTIONS,
  BRIEF_STATUS,
  type BriefService,
  type BriefStatus,
} from "#/lib/schemas/brief"
import { cn } from "#/lib/utils"

export const Route = createFileRoute("/admin/briefs")({
  head: () => ({ meta: [{ title: "Briefs — Admin" }] }),
  component: AdminBriefsPage,
})

const ALL = "ALL"

const STATUS_META: Record<BriefStatus, { label: string; tone: AdminStatusTone }> = {
  [BRIEF_STATUS.NEW]: { label: "New", tone: "active" },
  [BRIEF_STATUS.REVIEWED]: { label: "Reviewed", tone: "neutral" },
  [BRIEF_STATUS.QUOTED]: { label: "Quoted", tone: "active" },
  [BRIEF_STATUS.ARCHIVED]: { label: "Archived", tone: "neutral" },
}

const STATUS_ORDER: ReadonlyArray<BriefStatus> = [
  BRIEF_STATUS.NEW,
  BRIEF_STATUS.REVIEWED,
  BRIEF_STATUS.QUOTED,
  BRIEF_STATUS.ARCHIVED,
]

function serviceLabel(service: BriefService): string {
  return BRIEF_SERVICE_OPTIONS.find((option) => option.value === service)?.label ?? service
}

function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function AdminBriefsPage() {
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, isPending, isError } = useAdminBriefs(
    statusFilter === ALL ? {} : { status: statusFilter as BriefStatus },
  )
  const updateStatus = useUpdateBriefStatus()
  const deleteBrief = useDeleteBrief()

  const briefs = (data ?? []) as BriefItem[]

  const selected = useMemo(
    () => briefs.find((brief) => brief.id === selectedId) ?? briefs[0] ?? null,
    [briefs, selectedId],
  )

  const filters = useMemo<ReadonlyArray<FilterOption>>(() => {
    const countOf = (status: BriefStatus): number =>
      briefs.filter((brief) => brief.status === status).length
    return [
      { value: ALL, label: statusFilter === ALL ? `All (${briefs.length})` : "All" },
      ...STATUS_ORDER.map((status) => ({
        value: status,
        label:
          statusFilter === status
            ? `${STATUS_META[status].label} (${countOf(status)})`
            : STATUS_META[status].label,
      })),
    ]
  }, [briefs, statusFilter])

  async function changeStatus(id: string, status: BriefStatus) {
    await updateStatus.mutateAsync({ id, status })
  }

  async function onDelete(brief: BriefItem) {
    if (typeof window !== "undefined" && !window.confirm(`Delete brief from ${brief.name}?`)) return
    await deleteBrief.mutateAsync(brief.id)
    if (selected?.id === brief.id) setSelectedId(null)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Briefs"
        description="Every brief submitted from the public site lands here. Review, quote, archive."
      />

      <FilterTabs
        label="Filter briefs by status"
        options={filters}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section aria-label="Brief queue" className={cn(adminPanelClass, "overflow-hidden")}>
          <ul className="divide-y divide-[var(--lab-line)]">
            {isPending &&
              Array.from({ length: 4 }).map((_, index) => (
                <li key={index} className="px-5 py-4">
                  <Skeleton className="h-14 w-full" />
                </li>
              ))}
            {isError && (
              <li className="px-5 py-8 text-center text-sm text-destructive">Could not load briefs.</li>
            )}
            {!isPending && !isError && briefs.length === 0 && (
              <li className="px-5 py-12 text-center text-[15px] text-[var(--lab-ink-soft)]">
                No briefs in this view.
              </li>
            )}
            {briefs.map((brief) => {
              const isSelected = selected?.id === brief.id
              const meta = STATUS_META[brief.status]
              return (
                <li key={brief.id}>
                  <button
                    type="button"
                    aria-current={isSelected}
                    onClick={() => setSelectedId(brief.id)}
                    className={cn(
                      "flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors",
                      isSelected ? "bg-[var(--lab-card)]" : "hover:bg-[var(--lab-card)]/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium text-[var(--lab-ink)]">{brief.name}</p>
                        <p className="truncate text-sm text-[var(--lab-ink-soft)]">
                          {brief.email}
                          {brief.company ? ` · ${brief.company}` : ""}
                        </p>
                      </div>
                      <AdminStatus label={meta.label} tone={meta.tone} className="shrink-0" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-[var(--lab-ink-soft)]">
                      <span>{serviceLabel(brief.service)}</span>
                      <span>{formatDate(brief.createdAt)}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <aside aria-label="Brief detail" className={cn(adminPanelClass, "overflow-hidden")}>
          {selected ? (
            <BriefDetail
              brief={selected}
              onChangeStatus={changeStatus}
              onDelete={onDelete}
              statusPending={updateStatus.isPending}
              deletePending={deleteBrief.isPending}
            />
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center text-[15px] text-[var(--lab-ink-soft)]">
              <Inbox className="size-6 text-[var(--lab-orange)]" aria-hidden />
              Pick a brief from the queue to read the full message.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

type BriefDetailProps = {
  brief: BriefItem
  onChangeStatus: (id: string, status: BriefStatus) => Promise<void>
  onDelete: (brief: BriefItem) => Promise<void>
  statusPending: boolean
  deletePending: boolean
}

function BriefDetail({ brief, onChangeStatus, onDelete, statusPending, deletePending }: BriefDetailProps) {
  const meta = STATUS_META[brief.status]
  const whatsappUrl = brief.whatsapp ? `https://wa.me/${brief.whatsapp.replace(/[^\d]/g, "")}` : null

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-[var(--lab-line)] px-6 py-5">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-medium tracking-tight text-[var(--lab-ink)]">{brief.name}</h2>
          <p className="mt-1 text-sm text-[var(--lab-ink-soft)]">{formatDate(brief.createdAt)}</p>
        </div>
        <AdminStatus label={meta.label} tone={meta.tone} className="shrink-0" />
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5">
        <Field label="Email" value={brief.email} />
        {brief.company && <Field label="Company" value={brief.company} />}
        {brief.whatsapp && whatsappUrl && <Field label="WhatsApp" value={brief.whatsapp} href={whatsappUrl} />}
        <Field label="Service" value={serviceLabel(brief.service)} />
        {brief.budget && <Field label="Budget" value={brief.budget} />}
        {brief.timeline && <Field label="Timeline" value={brief.timeline} />}
      </dl>

      <div className="border-y border-[var(--lab-line)] bg-[var(--lab-card)] px-6 py-5">
        <h3 className="text-sm text-[var(--lab-ink-soft)]">Message</h3>
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--lab-ink)]">
          {brief.message}
        </p>
        {brief.documentUrl && (
          <a
            href={brief.documentUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-[var(--lab-orange)] underline-offset-4 hover:underline"
          >
            View attachment
          </a>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-center gap-2">
          <Select
            value={brief.status}
            onValueChange={(value) => void onChangeStatus(brief.id, value as BriefStatus)}
            disabled={statusPending}
          >
            <SelectTrigger
              aria-label="Brief status"
              className={cn(adminSelectTriggerClass, "!w-44")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ORDER.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statusPending && <Loader2 className="size-4 animate-spin text-[var(--lab-orange)]" aria-hidden />}
        </div>
        <div className="flex items-center gap-2">
          {whatsappUrl && (
            <Button asChild variant="outline" className={cn("rounded-full", adminOutlineClass)}>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageSquare aria-hidden />
                WhatsApp
              </a>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => void onDelete(brief)}
            disabled={deletePending}
            className="rounded-full border-destructive/40 bg-transparent text-destructive shadow-none hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-[var(--lab-ink-soft)]">{label}</dt>
      <dd className="mt-0.5 truncate text-[15px] text-[var(--lab-ink)]">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-[var(--lab-ink)] underline-offset-4 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}
