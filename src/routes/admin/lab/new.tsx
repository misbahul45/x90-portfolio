import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { ExperimentForm } from "#/components/admin/ExperimentForm"
import { useAdminCreateExperiment } from "#/hooks/useAdminExperiments"
import type { ExperimentCreateInput } from "#/lib/schemas/experiment"

export const Route = createFileRoute("/admin/lab/new")({
  head: () => ({ meta: [{ title: "New experiment — Admin" }] }),
  component: NewExperimentPage,
})

function NewExperimentPage() {
  const navigate = useNavigate()
  const create = useAdminCreateExperiment()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (input: ExperimentCreateInput): Promise<void> => {
    setError(null)
    try {
      const created = await create.mutateAsync(input)
      await navigate({ to: "/admin/lab/$id", params: { id: created.id } })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The experiment could not be saved.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <Link
          to="/admin/lab"
          className="inline-flex items-center gap-2 text-[15px] text-[var(--lab-ink-soft)] no-underline hover:text-[var(--lab-orange)]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All experiments
        </Link>
        <h1 className="dm-title mt-6">New experiment</h1>
        <p className="dm-subtitle mt-1">Describe the run you want to track.</p>
      </header>
      <ExperimentForm submitLabel="Create experiment" pending={create.isPending} error={error} onSubmit={handleSubmit} />
    </div>
  )
}
