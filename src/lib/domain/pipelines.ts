export type PipelineKey = "delivery" | "research" | "finetune"

export type PipelineStage = {
  id: string
  title: string
  detail: string
}

export type Pipeline = {
  key: PipelineKey
  label: string
  summary: string
  stages: ReadonlyArray<PipelineStage>
}

export type PipelineOrientation = "horizontal" | "vertical"

export type StageStatus = "done" | "active" | "upcoming"

export const PIPELINE_NODE_WIDTH = 200
export const PIPELINE_NODE_GAP_X = 56
export const PIPELINE_NODE_GAP_Y = 60
export const PIPELINE_NODE_HEIGHT = 120

export const PIPELINES: ReadonlyArray<Pipeline> = [
  {
    key: "delivery",
    label: "Delivery pipeline",
    summary:
      "How a brief becomes a running product: scoped, built in small verified steps, and handed over with the tooling to operate it.",
    stages: [
      { id: "brief", title: "Brief", detail: "Goals, constraints and the one outcome that has to move." },
      { id: "scope", title: "Scope", detail: "A fixed plan with milestones, risks and a price." },
      { id: "build", title: "Build", detail: "Weekly shippable increments on your infrastructure." },
      { id: "verify", title: "Verify", detail: "Tests, evaluation sets and review against the brief." },
      { id: "operate", title: "Operate", detail: "Monitoring, handover and a path to keep improving." },
    ],
  },
  {
    key: "research",
    label: "Research loop",
    summary:
      "Every lab note starts as a question we need answered for a real project, and ends as something other teams can reuse.",
    stages: [
      { id: "question", title: "Question", detail: "A concrete uncertainty taken from client work." },
      { id: "experiment", title: "Experiment", detail: "Small, reproducible runs with logged configs." },
      { id: "evaluate", title: "Evaluate", detail: "Held-out comparisons against a stated baseline." },
      { id: "write", title: "Write up", detail: "Findings, failures and the exact setup used." },
      { id: "publish", title: "Publish", detail: "Released to the research feed and the project it informs." },
    ],
  },
  {
    key: "finetune",
    label: "Fine-tuning pipeline",
    summary:
      "From curated examples to a model we can defend: every run is tracked in the admin lab and linked to the research it produces.",
    stages: [
      { id: "dataset", title: "Dataset", detail: "Curate, deduplicate and split instruction data." },
      { id: "preprocess", title: "Preprocess", detail: "Template, tokenise and validate every example." },
      { id: "train", title: "Train", detail: "SFT, LoRA or DPO with pinned hyperparameters." },
      { id: "evaluate", title: "Evaluate", detail: "Task metrics and regression checks versus the base model." },
      { id: "release", title: "Release", detail: "Export the config, publish the write-up, ship the adapter." },
    ],
  },
]

export function layoutPipeline(
  stageCount: number,
  orientation: PipelineOrientation,
): Array<{ x: number; y: number }> {
  return Array.from({ length: Math.max(0, stageCount) }, (_, index) =>
    orientation === "horizontal"
      ? { x: index * (PIPELINE_NODE_WIDTH + PIPELINE_NODE_GAP_X), y: 0 }
      : { x: 0, y: index * (PIPELINE_NODE_HEIGHT + PIPELINE_NODE_GAP_Y) },
  )
}

export function nextStageIndex(current: number, total: number): number {
  if (total <= 0) return 0
  return (current + 1) % total
}

export function stageStatus(index: number, activeIndex: number): StageStatus {
  if (index < activeIndex) return "done"
  if (index === activeIndex) return "active"
  return "upcoming"
}

export function findPipeline(key: string): Pipeline | undefined {
  return PIPELINES.find((pipeline) => pipeline.key === key)
}
