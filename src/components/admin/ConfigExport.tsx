import { useMemo, useState } from "react"
import { Check, Copy, Download } from "lucide-react"
import { adminOutlineClass } from "#/components/admin/styles"
import { Button } from "#/components/ui/button"
import type { ExperimentItem } from "#/hooks/useAdminExperiments"
import { serializeTrainingConfig } from "#/lib/domain/experiments"
import { cn } from "#/lib/utils"

type ConfigFormat = "yaml" | "json"

const FORMATS: ReadonlyArray<{ value: ConfigFormat; label: string }> = [
  { value: "yaml", label: "YAML" },
  { value: "json", label: "JSON" },
]

type ConfigExportProps = {
  experiment: ExperimentItem
}

export function ConfigExport({ experiment }: ConfigExportProps) {
  const [format, setFormat] = useState<ConfigFormat>("yaml")
  const [copied, setCopied] = useState(false)

  const text = useMemo(
    () =>
      serializeTrainingConfig(
        {
          title: experiment.title,
          slug: experiment.slug,
          baseModel: experiment.baseModel,
          method: experiment.method,
          datasetName: experiment.datasetName,
          datasetSize: experiment.datasetSize,
          hyperparams: experiment.hyperparams,
        },
        format,
      ),
    [experiment, format],
  )

  const copy = async (): Promise<void> => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const download = (): void => {
    const blob = new Blob([text], { type: format === "json" ? "application/json" : "text/yaml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${experiment.slug}.${format}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section aria-labelledby="config-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="config-heading" className="text-xl font-medium text-[var(--lab-ink)]">
          Training config
        </h2>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Config format" className="flex rounded-full border border-[var(--lab-line-strong)] p-0.5">
            {FORMATS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={format === option.value}
                onClick={() => setFormat(option.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm transition-colors",
                  format === option.value
                    ? "bg-[var(--lab-card-elevated)] text-[var(--lab-ink)]"
                    : "text-[var(--lab-ink-soft)] hover:text-[var(--lab-ink)]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copy} className={adminOutlineClass}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={download} className={adminOutlineClass}>
            <Download aria-hidden />
            Download
          </Button>
        </div>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto rounded-2xl border border-[var(--lab-line)] bg-[var(--lab-card)] p-5 font-mono text-sm leading-relaxed text-[var(--lab-ink)]">
        {text}
      </pre>
    </section>
  )
}
