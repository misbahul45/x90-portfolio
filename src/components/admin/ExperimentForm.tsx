import { useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { Textarea } from "#/components/ui/textarea"
import type { ExperimentItem } from "#/hooks/useAdminExperiments"
import {
  EXPERIMENT_METHODS,
  EXPERIMENT_METHOD_LABELS,
  EXPERIMENT_STATUSES,
  EXPERIMENT_STATUS_LABELS,
  defaultHyperparams,
  formatKeyValueLines,
  parseKeyValueLines,
  parseMetricLines,
  type ExperimentMethod,
  type ExperimentStatus,
} from "#/lib/domain/experiments"
import type { ExperimentCreateInput } from "#/lib/schemas/experiment"

type ExperimentFormProps = {
  initial?: ExperimentItem
  submitLabel: string
  pending: boolean
  error: string | null
  onSubmit: (input: ExperimentCreateInput) => void
}

type FieldProps = {
  id: string
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}

function Field({ id, label, hint, className, children }: FieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium text-[var(--lab-ink)]">
        {label}
      </Label>
      {hint ? <p className="mt-1 text-sm text-[var(--lab-ink-soft)]">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function ExperimentForm({ initial, submitLabel, pending, error, onSubmit }: ExperimentFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [summary, setSummary] = useState(initial?.summary ?? "")
  const [baseModel, setBaseModel] = useState(initial?.baseModel ?? "")
  const [method, setMethod] = useState<ExperimentMethod>(initial?.method ?? "LORA")
  const [datasetName, setDatasetName] = useState(initial?.datasetName ?? "")
  const [datasetSize, setDatasetSize] = useState(initial?.datasetSize?.toString() ?? "")
  const [hyperparamsText, setHyperparamsText] = useState(
    formatKeyValueLines(initial?.hyperparams ?? defaultHyperparams("LORA")),
  )
  const [metricsText, setMetricsText] = useState(formatKeyValueLines(initial?.metrics ?? {}))
  const [status, setStatus] = useState<ExperimentStatus>(initial?.status ?? "PLANNED")
  const [notes, setNotes] = useState(initial?.notes ?? "")

  const handleMethodChange = (next: ExperimentMethod): void => {
    const untouched = hyperparamsText.trim() === "" || hyperparamsText === formatKeyValueLines(defaultHyperparams(method))
    setMethod(next)
    if (untouched) setHyperparamsText(formatKeyValueLines(defaultHyperparams(next)))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const size = datasetSize.trim() === "" ? null : Number.parseInt(datasetSize, 10)
    onSubmit({
      title: title.trim(),
      summary: summary.trim(),
      baseModel: baseModel.trim(),
      method,
      datasetName: datasetName.trim() || null,
      datasetSize: size !== null && Number.isFinite(size) ? size : null,
      hyperparams: parseKeyValueLines(hyperparamsText),
      metrics: parseMetricLines(metricsText),
      status,
      stage: initial?.stage ?? 0,
      notes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="exp-title" label="Title" className="sm:col-span-2">
          <Input
            id="exp-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="LoRA adapter for support triage"
          />
        </Field>
        <Field id="exp-summary" label="Research question" className="sm:col-span-2">
          <Textarea
            id="exp-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            required
            rows={3}
            placeholder="What are we trying to find out, and why does it matter for a real project?"
          />
        </Field>
        <Field id="exp-base-model" label="Base model">
          <Input
            id="exp-base-model"
            value={baseModel}
            onChange={(event) => setBaseModel(event.target.value)}
            required
            placeholder="Qwen2.5-7B-Instruct"
          />
        </Field>
        <Field id="exp-method" label="Method">
          <Select value={method} onValueChange={(next) => handleMethodChange(next as ExperimentMethod)}>
            <SelectTrigger id="exp-method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPERIMENT_METHODS.map((option) => (
                <SelectItem key={option} value={option}>
                  {EXPERIMENT_METHOD_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="exp-dataset" label="Dataset">
          <Input
            id="exp-dataset"
            value={datasetName}
            onChange={(event) => setDatasetName(event.target.value)}
            placeholder="tickets-v3"
          />
        </Field>
        <Field id="exp-dataset-size" label="Dataset size">
          <Input
            id="exp-dataset-size"
            type="number"
            min={0}
            value={datasetSize}
            onChange={(event) => setDatasetSize(event.target.value)}
            placeholder="12000"
          />
        </Field>
        <Field id="exp-hyperparams" label="Hyperparameters" hint="One per line as key: value." className="sm:col-span-2">
          <Textarea
            id="exp-hyperparams"
            value={hyperparamsText}
            onChange={(event) => setHyperparamsText(event.target.value)}
            rows={7}
            className="font-mono text-sm"
          />
        </Field>
        <Field id="exp-metrics" label="Metrics" hint="Numeric results as key: value, for example accuracy: 0.91." className="sm:col-span-2">
          <Textarea
            id="exp-metrics"
            value={metricsText}
            onChange={(event) => setMetricsText(event.target.value)}
            rows={4}
            className="font-mono text-sm"
          />
        </Field>
        <Field id="exp-status" label="Status">
          <Select value={status} onValueChange={(next) => setStatus(next as ExperimentStatus)}>
            <SelectTrigger id="exp-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPERIMENT_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {EXPERIMENT_STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="exp-notes" label="Notes" hint="Findings, failure cases and what to try next." className="sm:col-span-2">
          <Textarea id="exp-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} />
        </Field>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {submitLabel}
      </Button>
    </form>
  )
}
