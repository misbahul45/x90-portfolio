import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ChevronRight, Plus } from "lucide-react"
import { FilterTabs, type FilterOption } from "#/components/deepmind/FilterTabs"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import { useAdminExperiments } from "#/hooks/useAdminExperiments"
import {
  EXPERIMENT_METHOD_LABELS,
  EXPERIMENT_STATUSES,
  EXPERIMENT_STATUS_LABELS,
  type ExperimentStatus,
} from "#/lib/domain/experiments"
import { PIPELINES } from "#/lib/domain/pipelines"
import { formatMonthYear } from "#/lib/format-date"

export const Route = createFileRoute("/admin/lab/")({
  head: () => ({ meta: [{ title: "Lab — Admin" }] }),
  component: AdminLabPage,
})

const ALL = "all"
const STAGES = PIPELINES.find((pipeline) => pipeline.key === "finetune")?.stages ?? []

const STATUS_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: ALL, label: "All" },
  ...EXPERIMENT_STATUSES.map((status) => ({ value: status, label: EXPERIMENT_STATUS_LABELS[status] })),
]

function AdminLabPage() {
  const [filter, setFilter] = useState(ALL)
  const status = filter === ALL ? undefined : (filter as ExperimentStatus)
  const { data, isPending, isError } = useAdminExperiments({ status })

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="dm-title">Lab</h1>
          <p className="dm-subtitle mt-1">
            Track fine-tuning runs from dataset to release, then turn the findings into research.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/lab/new">
            <Plus aria-hidden />
            New experiment
          </Link>
        </Button>
      </header>

      <FilterTabs label="Filter experiments by status" options={STATUS_OPTIONS} value={filter} onChange={setFilter} />

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="dm-body">Experiments could not be loaded. If this is a new database, run the schema push first.</p>
      ) : data.length === 0 ? (
        <div className="rounded-3xl border border-[var(--lab-line)] p-10">
          <p className="text-xl font-medium text-[var(--lab-ink)]">No experiments yet</p>
          <p className="dm-body mt-2 max-w-xl">
            Create your first run to track its dataset, hyperparameters, metrics and the research it produces.
          </p>
          <Button asChild className="mt-6">
            <Link to="/admin/lab/new">New experiment</Link>
          </Button>
        </div>
      ) : (
        <ul className="border-b border-[var(--lab-line)]">
          {data.map((experiment) => (
            <li key={experiment.id}>
              <Link to="/admin/lab/$id" params={{ id: experiment.id }} className="dm-row dm-link">
                <span className="min-w-0">
                  <span className="block truncate text-xl font-medium">{experiment.title}</span>
                  <span className="dm-body mt-1 block truncate">
                    {experiment.baseModel} · {EXPERIMENT_METHOD_LABELS[experiment.method]}
                    {experiment.datasetName ? ` · ${experiment.datasetName}` : ""}
                  </span>
                </span>
                <span className="hidden w-44 shrink-0 text-right text-sm sm:block">
                  <span className="block text-[var(--lab-ink)]">
                    {EXPERIMENT_STATUS_LABELS[experiment.status]}
                  </span>
                  <span className="mt-1 block text-[var(--lab-ink-soft)]">
                    {STAGES[experiment.stage]?.title ?? "Dataset"} · {formatMonthYear(experiment.updatedAt)}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
