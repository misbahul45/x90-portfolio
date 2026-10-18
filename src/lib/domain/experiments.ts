export const EXPERIMENT_METHODS = ["SFT", "LORA", "QLORA", "DPO", "OTHER"] as const
export type ExperimentMethod = (typeof EXPERIMENT_METHODS)[number]

export const EXPERIMENT_STATUSES = ["PLANNED", "RUNNING", "EVALUATING", "COMPLETED", "FAILED"] as const
export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number]

export const EXPERIMENT_METHOD_LABELS: Record<ExperimentMethod, string> = {
  SFT: "Supervised fine-tuning",
  LORA: "LoRA",
  QLORA: "QLoRA",
  DPO: "Direct preference optimization",
  OTHER: "Other",
}

export const EXPERIMENT_STATUS_LABELS: Record<ExperimentStatus, string> = {
  PLANNED: "Planned",
  RUNNING: "Running",
  EVALUATING: "Evaluating",
  COMPLETED: "Completed",
  FAILED: "Failed",
}

export type ScalarValue = string | number | boolean

export type TrainingConfigInput = {
  title: string
  slug: string
  baseModel: string
  method: ExperimentMethod
  datasetName: string | null
  datasetSize: number | null
  hyperparams: Record<string, ScalarValue>
}

export type ArticleDraftInput = {
  title: string
  summary: string
  baseModel: string
  method: ExperimentMethod
  datasetName: string | null
  datasetSize: number | null
  hyperparams: Record<string, ScalarValue>
  metrics: Record<string, number>
  status: ExperimentStatus
  notes: string
}

export type TiptapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
}

export type ArticleDraft = {
  title: string
  excerpt: string
  content: { type: "doc"; content: TiptapNode[] }
}

const DEFAULT_HYPERPARAMS: Record<ExperimentMethod, Record<string, ScalarValue>> = {
  SFT: { learning_rate: 0.00002, epochs: 3, batch_size: 8, warmup_ratio: 0.03, max_seq_length: 2048 },
  LORA: { learning_rate: 0.0002, epochs: 3, batch_size: 8, lora_rank: 16, lora_alpha: 32, lora_dropout: 0.05 },
  QLORA: {
    learning_rate: 0.0002,
    epochs: 3,
    batch_size: 4,
    lora_rank: 64,
    lora_alpha: 16,
    lora_dropout: 0.05,
    quantization: "4bit",
  },
  DPO: { learning_rate: 0.000005, epochs: 1, batch_size: 4, beta: 0.1 },
  OTHER: {},
}

export function defaultHyperparams(method: ExperimentMethod): Record<string, ScalarValue> {
  return { ...DEFAULT_HYPERPARAMS[method] }
}

function parseScalar(raw: string): ScalarValue {
  const value = raw.trim()
  if (value === "true") return true
  if (value === "false") return false
  if (value !== "" && /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(value)) return Number(value)
  return value
}

export function parseKeyValueLines(text: string): Record<string, ScalarValue> {
  const result: Record<string, ScalarValue> = {}
  for (const line of text.split("\n")) {
    const separator = line.indexOf(":")
    if (separator <= 0) continue
    const key = line.slice(0, separator).trim()
    if (!key) continue
    result[key] = parseScalar(line.slice(separator + 1))
  }
  return result
}

export function formatKeyValueLines(record: Record<string, ScalarValue | number>): string {
  return Object.entries(record)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n")
}

export function parseMetricLines(text: string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(parseKeyValueLines(text))) {
    if (typeof value === "number" && Number.isFinite(value)) result[key] = value
  }
  return result
}

const YAML_PLAIN = /^[A-Za-z_][A-Za-z0-9_./-]*$/

function yamlScalar(value: ScalarValue | null): string {
  if (value === null) return "null"
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (YAML_PLAIN.test(value) && !["true", "false", "null"].includes(value)) return value
  return JSON.stringify(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function toYaml(value: Record<string, unknown>, depth = 0): string {
  const pad = "  ".repeat(depth)
  const lines: string[] = []
  for (const [key, entry] of Object.entries(value)) {
    if (isRecord(entry)) {
      lines.push(Object.keys(entry).length === 0 ? `${pad}${key}: {}` : `${pad}${key}:`)
      if (Object.keys(entry).length > 0) lines.push(toYaml(entry, depth + 1))
    } else {
      lines.push(`${pad}${key}: ${yamlScalar(entry as ScalarValue | null)}`)
    }
  }
  return lines.join("\n")
}

export type TrainingConfig = {
  run: { name: string; method: string }
  model: { base: string }
  dataset: { name: string | null; size: number | null }
  hyperparameters: Record<string, ScalarValue>
}

export function buildTrainingConfig(input: TrainingConfigInput): TrainingConfig {
  return {
    run: { name: input.slug, method: input.method.toLowerCase() },
    model: { base: input.baseModel },
    dataset: { name: input.datasetName, size: input.datasetSize },
    hyperparameters: { ...input.hyperparams },
  }
}

export function serializeTrainingConfig(input: TrainingConfigInput, format: "yaml" | "json"): string {
  const config = buildTrainingConfig(input)
  if (format === "json") return JSON.stringify(config, null, 2)
  return `${toYaml(config)}\n`
}

function text(value: string): TiptapNode {
  return { type: "text", text: value }
}

function paragraph(value: string): TiptapNode {
  return { type: "paragraph", content: [text(value)] }
}

function heading(level: number, value: string): TiptapNode {
  return { type: "heading", attrs: { level }, content: [text(value)] }
}

function bulletList(items: string[]): TiptapNode {
  return {
    type: "bulletList",
    content: items.map((item) => ({ type: "listItem", content: [paragraph(item)] })),
  }
}

export function buildArticleDraft(input: ArticleDraftInput): ArticleDraft {
  const setup = [
    `Base model: ${input.baseModel}`,
    `Method: ${EXPERIMENT_METHOD_LABELS[input.method]}`,
    input.datasetName
      ? `Dataset: ${input.datasetName}${input.datasetSize ? ` (${input.datasetSize.toLocaleString("en-US")} examples)` : ""}`
      : "",
    ...Object.entries(input.hyperparams).map(([key, value]) => `${key}: ${String(value)}`),
  ].filter(Boolean)
  const results = Object.entries(input.metrics).map(([key, value]) => `${key}: ${value}`)
  const content: TiptapNode[] = [
    heading(2, "Question"),
    paragraph(input.summary),
    heading(2, "Setup"),
    bulletList(setup),
    heading(2, "Results"),
    results.length > 0 ? bulletList(results) : paragraph("No metrics were recorded for this run."),
    heading(2, "Notes"),
    paragraph(input.notes.trim() || "Add findings, failure cases and what to try next."),
  ]
  const excerptSource = input.summary.trim()
  const excerpt = excerptSource.length >= 10 ? excerptSource.slice(0, 480) : `${input.title} — experiment write-up.`
  return { title: input.title, excerpt, content: { type: "doc", content } }
}
