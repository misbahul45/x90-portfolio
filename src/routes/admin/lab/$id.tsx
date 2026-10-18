import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, ArrowUpRight, FilePen, Trash2 } from "lucide-react"
import { ConfigExport } from "#/components/admin/ConfigExport"
import { ExperimentForm } from "#/components/admin/ExperimentForm"
import { adminOutlineClass } from "#/components/admin/styles"
import { PipelineFlow } from "#/components/deepmind/PipelineFlow"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import {
  useAdminDeleteExperiment,
  useAdminDraftArticleFromExperiment,
  useAdminExperiment,
  useAdminUpdateExperiment,
  type ExperimentItem,
} from "#/hooks/useAdminExperiments"
import { EXPERIMENT_STATUS_LABELS } from "#/lib/domain/experiments"
import { findPipeline } from "#/lib/domain/pipelines"
import type { ExperimentCreateInput } from "#/lib/schemas/experiment"

export const Route = createFileRoute("/admin/lab/$id")({
  head: () => ({ meta: [{ title: "Experiment — Admin" }] }),
  component: ExperimentDetailPage,
})

function BackLink() {
  return (
    <Link
      to="/admin/lab"
      className="inline-flex items-center gap-2 text-[15px] text-[var(--lab-ink-soft)] no-underline hover:text-[var(--lab-orange)]"
    >
      <ArrowLeft className="size-4" aria-hidden />
      All experiments
    </Link>
  )
}

function ExperimentDetailPage() {
  const { id } = Route.useParams()
  const { data, isPending, isError } = useAdminExperiment(id)

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <BackLink />
        <h1 className="dm-title">Experiment not found</h1>
        <p className="dm-subtitle">It may have been deleted.</p>
      </div>
    )
  }

  return <ExperimentDetail experiment={data} />
}

function ExperimentDetail({ experiment }: { experiment: ExperimentItem }) {
  const navigate = useNavigate()
  const update = useAdminUpdateExperiment()
  const remove = useAdminDeleteExperiment()
  const draft = useAdminDraftArticleFromExperiment()
  const [error, setError] = useState<string | null>(null)
  const pipeline = findPipeline("finetune")

  const handleSave = async (input: ExperimentCreateInput): Promise<void> => {
    setError(null)
    try {
      await update.mutateAsync({ ...input, id: experiment.id })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The experiment could not be saved.")
    }
  }

  const handleStageChange = (stage: number): void => {
    update.mutate({ id: experiment.id, stage })
  }

  const handleDraft = (): void => {
    draft.mutate(experiment.id)
  }

  const handleDelete = async (): Promise<void> => {
    if (!window.confirm(`Delete "${experiment.title}"? This cannot be undone.`)) return
    await remove.mutateAsync(experiment.id)
    await navigate({ to: "/admin/lab" })
  }

  return (
    <div className="space-y-12">
      <header className="space-y-6">
        <BackLink />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="dm-title">{experiment.title}</h1>
            <p className="dm-subtitle mt-1">{experiment.summary}</p>
            <p className="mt-4 text-[15px] text-[var(--lab-ink-soft)]">
              {EXPERIMENT_STATUS_LABELS[experiment.status]} · {experiment.baseModel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {experiment.article ? (
              <Button asChild variant="outline" className={adminOutlineClass}>
                <Link to="/admin/articles/$id" params={{ id: experiment.article.id }}>
                  <ArrowUpRight aria-hidden />
                  Open research draft
                </Link>
              </Button>
            ) : (
              <Button type="button" onClick={handleDraft} disabled={draft.isPending}>
                <FilePen aria-hidden />
                {draft.isPending ? "Drafting…" : "Draft research from this run"}
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={handleDelete} disabled={remove.isPending}>
              <Trash2 aria-hidden />
              Delete
            </Button>
          </div>
        </div>
        {draft.isError ? (
          <p className="text-sm text-destructive">The research draft could not be created. Please try again.</p>
        ) : null}
      </header>

      {pipeline ? (
        <section aria-labelledby="pipeline-heading">
          <h2 id="pipeline-heading" className="text-xl font-medium text-[var(--lab-ink)]">
            Pipeline
          </h2>
          <p className="dm-body mt-1">Select a stage to record how far this run has progressed.</p>
          <PipelineFlow
            pipeline={pipeline}
            value={experiment.stage}
            onValueChange={handleStageChange}
            failed={experiment.status === "FAILED"}
            className="mt-6"
          />
        </section>
      ) : null}

      <div className="grid gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <section aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-xl font-medium text-[var(--lab-ink)]">
            Run details
          </h2>
          <div className="mt-6">
            <ExperimentForm
              key={experiment.updatedAt}
              initial={experiment}
              submitLabel="Save changes"
              pending={update.isPending}
              error={error}
              onSubmit={handleSave}
            />
          </div>
        </section>
        <ConfigExport experiment={experiment} />
      </div>
    </div>
  )
}
