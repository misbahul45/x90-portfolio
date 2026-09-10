import { useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import {
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import {
  BRIEF_SERVICE_OPTIONS,
  BRIEF_STATUS,
  type BriefService,
  type BriefStatus,
} from "#/lib/schemas/brief"
import {
  useAdminBriefs,
  useDeleteBrief,
  useUpdateBriefStatus,
  type BriefItem,
} from "#/hooks/useBriefs"
import { Skeleton } from "#/components/ui/skeleton"
import { fadeInUp, staggerContainer, staggerItem, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { cn } from "#/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"

export const Route = createFileRoute("/admin/briefs")({
  head: () => ({ meta: [{ title: "Briefs — Admin" }] }),
  component: AdminBriefsPage,
})

const STATUS_FILTERS: Array<{ value: "ALL" | BriefStatus; label: string }> = [
  { value: "ALL", label: "All" },
  { value: BRIEF_STATUS.NEW, label: "New" },
  { value: BRIEF_STATUS.REVIEWED, label: "Reviewed" },
  { value: BRIEF_STATUS.QUOTED, label: "Quoted" },
  { value: BRIEF_STATUS.ARCHIVED, label: "Archived" },
]

const STATUS_BADGE: Record<BriefStatus, { label: string; className: string; icon: LucideIcon }> = {
  [BRIEF_STATUS.NEW]: {
    label: "New",
    className: "border-[var(--lab-orange)]/40 bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]",
    icon: Inbox,
  },
  [BRIEF_STATUS.REVIEWED]: {
    label: "Reviewed",
    className: "border-[var(--lab-line-strong)] bg-[var(--lab-card-elevated)] text-[var(--lab-ink-soft)]",
    icon: Mail,
  },
  [BRIEF_STATUS.QUOTED]: {
    label: "Quoted",
    className: "border-[var(--lab-orange)] bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]",
    icon: Send,
  },
  [BRIEF_STATUS.ARCHIVED]: {
    label: "Archived",
    className: "border-[var(--lab-line)] bg-[var(--lab-bg)] text-[var(--lab-ink-soft)]",
    icon: Inbox,
  },
}

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
  const [statusFilter, setStatusFilter] = useState<"ALL" | BriefStatus>("ALL")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, isPending, isError } = useAdminBriefs(
    statusFilter === "ALL" ? {} : { status: statusFilter },
  )
  const updateStatus = useUpdateBriefStatus()
  const deleteBrief = useDeleteBrief()

  const briefs = (data ?? []) as BriefItem[]

  const selected = useMemo(
    () => briefs.find((brief) => brief.id === selectedId) ?? briefs[0] ?? null,
    [briefs, selectedId],
  )

  const counts = useMemo(() => {
    const result: Record<BriefStatus | "ALL", number> = {
      ALL: briefs.length,
      [BRIEF_STATUS.NEW]: 0,
      [BRIEF_STATUS.REVIEWED]: 0,
      [BRIEF_STATUS.QUOTED]: 0,
      [BRIEF_STATUS.ARCHIVED]: 0,
    }
    for (const brief of briefs) result[brief.status] += 1
    return result
  }, [briefs])

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
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
          Inbox
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--lab-ink)]">
          Briefs
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--lab-ink-soft)]">
          Every brief submitted from the public site lands here. Review, quote, archive.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.value
          const value = counts[filter.value as keyof typeof counts]
          return (
            <motion.button
              key={filter.value}
              variants={staggerItem}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "research-card-surface group flex items-center justify-between gap-3 p-4 text-left transition-colors",
                active ? "border-[var(--lab-orange)]/60" : "hover:border-[var(--lab-line-strong)]",
              )}
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                  {filter.label}
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-[var(--lab-ink)]">
                  {value}
                </p>
              </div>
              {active && (
                <span className="size-1.5 rounded-full bg-[var(--lab-orange)] shadow-[0_0_6px_rgba(255,138,61,0.7)]" />
              )}
            </motion.button>
          )
        })}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_OPTIONS}
        variants={fadeInUp}
        className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <div className="overflow-hidden rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)]">
          <header className="flex items-center justify-between border-b border-[var(--lab-line)] px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              Queue
            </p>
            <span className="font-mono text-[11px] text-[var(--lab-ink-soft)]">
              {briefs.length} {briefs.length === 1 ? "brief" : "briefs"}
            </span>
          </header>
          <ul className="divide-y divide-[var(--lab-line)]">
            {isPending &&
              Array.from({ length: 4 }).map((_, idx) => (
                <li key={idx} className="px-4 py-3">
                  <Skeleton className="h-14 w-full" />
                </li>
              ))}
            {isError && (
              <li className="px-4 py-6 text-center text-sm text-destructive">
                Could not load briefs.
              </li>
            )}
            {!isPending && briefs.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-[var(--lab-ink-soft)]">
                No briefs in this view.
              </li>
            )}
            {briefs.map((brief) => {
              const isSelected = selected?.id === brief.id
              const Badge = STATUS_BADGE[brief.status]
              return (
                <li key={brief.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(brief.id)}
                    className={cn(
                      "flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-[var(--lab-card-elevated)]"
                        : "hover:bg-[var(--lab-card-elevated)]/60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--lab-ink)]">
                          {brief.name}
                        </p>
                        <p className="truncate text-[12px] text-[var(--lab-ink-soft)]">
                          {brief.email}
                          {brief.company ? ` · ${brief.company}` : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                          Badge.className,
                        )}
                      >
                        <Badge.icon className="size-3" aria-hidden />
                        {Badge.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)]">
                      <span>{serviceLabel(brief.service)}</span>
                      <span>{formatDate(brief.createdAt)}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <aside className="overflow-hidden rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)]">
          {selected ? (
            <BriefDetail
              brief={selected}
              onChangeStatus={changeStatus}
              onDelete={onDelete}
              statusPending={updateStatus.isPending}
              deletePending={deleteBrief.isPending}
            />
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center text-sm text-[var(--lab-ink-soft)]">
              <Inbox className="size-6 text-[var(--lab-orange)]" aria-hidden />
              Pick a brief from the queue to read the full message.
            </div>
          )}
        </aside>
      </motion.div>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_OPTIONS}
        variants={fadeInUp}
        className="rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)] p-6 text-sm text-[var(--lab-ink-soft)]"
      >
        <p className="text-[var(--lab-ink)]">
          Need to triage articles or team?
        </p>
        <p className="mt-1">
          Switch to{" "}
          <Link to="/admin" className="text-[var(--lab-orange)] underline-offset-4 hover:underline">
            workspace overview
          </Link>
          , or open the{" "}
          <Link to="/admin/feedback" className="text-[var(--lab-orange)] underline-offset-4 hover:underline">
            feedback inbox
          </Link>
          .
        </p>
      </motion.section>
    </div>
  )
}

function BriefDetail({
  brief,
  onChangeStatus,
  onDelete,
  statusPending,
  deletePending,
}: {
  brief: BriefItem
  onChangeStatus: (id: string, status: BriefStatus) => Promise<void>
  onDelete: (brief: BriefItem) => Promise<void>
  statusPending: boolean
  deletePending: boolean
}) {
  const Badge = STATUS_BADGE[brief.status]
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b border-[var(--lab-line)] px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
            Brief {brief.id.slice(0, 8)}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--lab-ink)]">
            {brief.name}
          </h2>
          <p className="mt-1 text-[12px] text-[var(--lab-ink-soft)]">{formatDate(brief.createdAt)}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
            Badge.className,
          )}
        >
          <Badge.icon className="size-3" aria-hidden />
          {Badge.label}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5 py-4 text-[12px] text-[var(--lab-ink-soft)]">
        <Field label="Email" value={brief.email} mono />
        {brief.company && <Field label="Company" value={brief.company} />}
        {brief.whatsapp && (
          <Field
            label="WhatsApp"
            value={brief.whatsapp}
            mono
            href={`https://wa.me/${brief.whatsapp.replace(/[^\d]/g, "")}`}
          />
        )}
        <Field label="Service" value={serviceLabel(brief.service)} />
        {brief.budget && <Field label="Budget" value={brief.budget} />}
        {brief.timeline && <Field label="Timeline" value={brief.timeline} />}
      </div>

      <div className="border-y border-[var(--lab-line)] bg-[var(--lab-card-elevated)] px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
          Message
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--lab-ink)]">
          {brief.message}
        </p>
        {brief.documentUrl && (
          <a
            href={brief.documentUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lab-orange)]"
          >
            View attachment
          </a>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <Select
            value={brief.status}
            onValueChange={(value) => onChangeStatus(brief.id, value as BriefStatus)}
            disabled={statusPending}
          >
            <SelectTrigger className="h-9 w-[160px] border-[var(--lab-line)] bg-[var(--lab-card-elevated)] text-[var(--lab-ink)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(BRIEF_STATUS).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_BADGE[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statusPending && <Loader2 className="size-4 animate-spin text-[var(--lab-orange)]" />}
        </div>
        <div className="flex items-center gap-2">
          {brief.whatsapp && (
            <a
              href={`https://wa.me/${brief.whatsapp.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-[var(--lab-orange)] bg-[var(--lab-orange-soft)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--lab-orange)] transition-colors hover:bg-[var(--lab-orange)] hover:text-[var(--lab-bg)]"
            >
              <MessageSquare className="size-3.5" aria-hidden />
              WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => onDelete(brief)}
            disabled={deletePending}
            className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive transition-colors hover:border-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  mono,
  href,
}: {
  label: string
  value: string
  mono?: boolean
  href?: string
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "mt-1 inline-block text-[var(--lab-ink)] underline-offset-4 hover:underline",
            mono && "font-mono",
          )}
        >
          {value}
        </a>
      ) : (
        <p className={cn("mt-1 text-[var(--lab-ink)]", mono && "font-mono")}>{value}</p>
      )}
    </div>
  )
}
