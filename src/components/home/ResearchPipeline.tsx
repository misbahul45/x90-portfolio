import { useEffect, useMemo, useState } from "react"
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { AnimatePresence, motion } from "motion/react"
import {
  Beaker,
  CheckCircle2,
  CircuitBoard,
  Database,
  FileSearch,
  Loader2,
  Scale,
  Send,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { cn } from "#/lib/utils"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

type StepState = "idle" | "running" | "completed"

type StepSeed = {
  id: string
  index: string
  label: string
  detail: string
  meta: string
  icon: LucideIcon
}

type StepNodeData = {
  seed: StepSeed
  state: StepState
}

const STEPS: ReadonlyArray<StepSeed> = [
  {
    id: "signals",
    index: "01",
    label: "Signals",
    detail: "Ingest · clean · normalize",
    meta: "telemetry · events · queries",
    icon: Database,
  },
  {
    id: "features",
    index: "02",
    label: "Features",
    detail: "Parse · embed · index",
    meta: "pgvector · sparse · rerank",
    icon: CircuitBoard,
  },
  {
    id: "model",
    index: "03",
    label: "Model",
    detail: "Train · tune · prompt",
    meta: "baselines · ablations · sweeps",
    icon: Beaker,
  },
  {
    id: "evaluate",
    index: "04",
    label: "Evaluate",
    detail: "k-fold · holdout · judge",
    meta: "metrics · regressions · alerts",
    icon: Scale,
  },
  {
    id: "evidence",
    index: "05",
    label: "Evidence",
    detail: "Ground · cite · audit",
    meta: "logs · traces · citations",
    icon: FileSearch,
  },
  {
    id: "decision",
    index: "06",
    label: "Decision",
    detail: "Ship · monitor · iterate",
    meta: "deploy · rollback · improve",
    icon: Send,
  },
]

const ACTIVE_SEQUENCE = STEPS.map((step) => step.id)

const STATE_STYLES: Record<
  StepState,
  { border: string; bg: string; accent: string; ring: string }
> = {
  idle: {
    border: "border-[var(--lab-line-strong)]",
    bg: "bg-[var(--lab-card)]",
    accent: "text-[var(--lab-ink-soft)]",
    ring: "ring-0",
  },
  running: {
    border: "border-[var(--lab-orange)]",
    bg: "bg-[var(--lab-orange-soft)]",
    accent: "text-[var(--lab-orange)]",
    ring: "ring-2 ring-[var(--lab-orange)]/40",
  },
  completed: {
    border: "border-[var(--lab-orange-glow)]",
    bg: "bg-[var(--lab-orange-soft)]",
    accent: "text-[var(--lab-orange)]",
    ring: "ring-0",
  },
}

function StepNode({ data }: NodeProps<Node<StepNodeData>>) {
  const styles = STATE_STYLES[data.state]
  const Icon = data.seed.icon
  return (
    <div
      className={cn(
        "min-w-[160px] rounded-lg border-2 bg-[var(--lab-card)] px-3 py-2.5 shadow-sm transition-all",
        styles.border,
        styles.bg,
        styles.ring,
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !bg-[var(--lab-orange)] !border-0" />
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", styles.accent)} aria-hidden />
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--lab-ink)]">
          {data.seed.label}
        </span>
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)]">
        {data.seed.index}
      </p>
      <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !bg-[var(--lab-orange)] !border-0" />
    </div>
  )
}

const nodeTypes = { step: StepNode }

const STEP_INTERVAL_MS = 1600

function computeState(activeIndex: number, id: string): StepState {
  const pos = ACTIVE_SEQUENCE.indexOf(id)
  if (pos === -1) return "idle"
  if (pos < activeIndex) return "completed"
  if (pos === activeIndex) return "running"
  return "idle"
}

const NODE_WIDTH = 200
const ROW_HEIGHT = 100

const NODE_POSITIONS: Record<string, { x: number; y: number }> = STEPS.reduce(
  (acc, step, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    acc[step.id] = { x: col * (NODE_WIDTH + 40), y: row * ROW_HEIGHT }
    return acc
  },
  {} as Record<string, { x: number; y: number }>,
)

const EDGE_LIST: Array<{ id: string; from: string; to: string }> = STEPS.slice(0, -1).map((step, index) => ({
  id: `e-${index}`,
  from: step.id,
  to: STEPS[index + 1]!.id,
}))

export function ResearchPipeline() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((prev) => (prev + 1) % (ACTIVE_SEQUENCE.length + 1))
    }, STEP_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  const nodes = useMemo<Node<StepNodeData>[]>(
    () =>
      STEPS.map((seed) => ({
        id: seed.id,
        type: "step",
        position: NODE_POSITIONS[seed.id] ?? { x: 0, y: 0 },
        data: {
          seed,
          state: computeState(tick, seed.id),
        },
      })),
    [tick],
  )

  const edges = useMemo<Edge[]>(
    () =>
      EDGE_LIST.map((edge) => {
        const fromPos = ACTIVE_SEQUENCE.indexOf(edge.from)
        const toPos = ACTIVE_SEQUENCE.indexOf(edge.to)
        const active = fromPos < tick && toPos < tick
        return {
          id: edge.id,
          source: edge.from,
          target: edge.to,
          animated: active,
          style: {
            stroke: active ? "var(--lab-orange)" : "var(--lab-line-strong)",
            strokeWidth: active ? 1.6 : 1,
            opacity: active ? 0.85 : 0.35,
          },
        }
      }),
    [tick],
  )

  const focusedStep = STEPS[tick] ?? STEPS[0]!
  const FocusedIcon = focusedStep.icon
  const focusedState: StepState =
    tick >= STEPS.length ? "completed" : tick === ACTIVE_SEQUENCE.indexOf(focusedStep.id) ? "running" : "completed"
  const isCycleDone = tick >= STEPS.length

  return (
    <section id="research" className="lab-page-bg border-b border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mb-10 max-w-3xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
            Research console
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
            Every experiment moves through the same loop: signals become features, features train models,
            models are evaluated, evidence is captured, and a decision ships to production.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.5 }}
          className="research-card-surface overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[var(--lab-line)] px-4 py-2.5">
            <span className="font-mono text-xs text-[var(--lab-ink-soft)]">
              xninetzy-labs / experiment-loop
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-medium text-[var(--lab-ink-soft)]">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--lab-orange)] opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[var(--lab-orange)]" />
              </span>
              {isCycleDone ? "cycle complete" : `step ${(tick + 1).toString().padStart(2, "0")} of ${STEPS.length.toString().padStart(2, "0")}`}
            </span>
          </div>

          <div className="grid gap-px bg-[var(--lab-line)] lg:grid-cols-[1fr_360px]">
            <div className="h-[420px] bg-[var(--lab-bg)]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                panOnDrag={false}
                zoomOnDoubleClick={false}
                defaultEdgeOptions={{ style: { stroke: "var(--lab-orange)", strokeWidth: 1.4, opacity: 0.6 } }}
                minZoom={0.9}
                maxZoom={1.2}
              >
                <Background gap={20} size={1} color="var(--lab-line)" />
              </ReactFlow>
            </div>

            <aside className="bg-[var(--lab-card)] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                Focused step
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={focusedStep.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                  className="mt-3"
                >
                  <div className="flex items-center gap-2">
                    <FocusedIcon className="size-4 text-[var(--lab-orange)]" aria-hidden />
                    <h3 className="text-lg font-semibold leading-tight text-[var(--lab-ink)]">
                      {focusedStep.label}
                    </h3>
                    <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
                      {focusedStep.index}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                    {focusedStep.detail}
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink)]">
                    {focusedStep.meta}
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-[var(--lab-ink-soft)]">
                    {focusedOutputs(focusedStep.id).map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 bg-[var(--lab-orange)]" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                    {focusedState === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 text-[var(--lab-orange)]">
                        <CheckCircle2 className="size-3" aria-hidden />
                        Captured
                      </span>
                    ) : focusedState === "running" ? (
                      <span className="inline-flex items-center gap-1.5 text-[var(--lab-orange)]">
                        <Loader2 className="size-3 animate-spin" aria-hidden />
                        Running
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[var(--lab-ink-soft)]">
                        Queued
                      </span>
                    )}
                    <span aria-hidden className="text-[var(--lab-line-strong)]">·</span>
                    <span className="inline-flex items-center gap-1.5 text-[var(--lab-ink-soft)]">
                      <ShieldCheck className="size-3" aria-hidden />
                      Audit on
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </aside>
          </div>

          <div className="border-t border-[var(--lab-line)] bg-[var(--lab-card)]/40 px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
              Run metrics
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { name: "MAE", note: "mean abs error" },
                { name: "R²", note: "variance explained" },
                { name: "F1", note: "precision · recall" },
                { name: "CV%", note: "cross-validation" },
                { name: "Δ", note: "regression delta" },
                { name: "n", note: "sample size" },
              ].map((metric) => (
                <li
                  key={metric.name}
                  className="flex flex-col gap-0.5 border-l border-[var(--lab-line)] pl-3"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
                    {metric.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
                    {metric.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function focusedOutputs(id: string): string[] {
  switch (id) {
    case "signals":
      return ["Schema-validated raw events", "Deduplicated query logs", "Session-aware batch boundaries"]
    case "features":
      return ["Embedding shards · 1536d", "Sparse BM25 indexes", "Hybrid retrieval candidates"]
    case "model":
      return ["Baseline vs candidate runs", "Hyperparameter sweeps", "Prompt + tool ablations"]
    case "evaluate":
      return ["k-fold + holdout splits", "LLM-as-judge scoring", "Regression guardrails"]
    case "evidence":
      return ["Citation-linked traces", "Drift + bias checks", "Reproducibility runbook"]
    case "decision":
      return ["Shadow deploy + canary", "Rollback path baked in", "Monitoring + alerts wired"]
    default:
      return []
  }
}
