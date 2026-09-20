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
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { cn } from "#/lib/utils"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

type StepState = "idle" | "running" | "completed"

type StepSeed = {
  id: string
  index: string
  label: string
  detail: string
  meta: string
}

type StepNodeData = {
  seed: StepSeed
  state: StepState
}

type ResearchPhase = {
  id: string
  label: string
  detail: string
  runtime: string
  active: string[]
  output: string[]
}

const STEPS: ReadonlyArray<StepSeed> = [
  {
    id: "signals",
    index: "01",
    label: "Signals",
    detail: "Ingest · clean · normalize",
    meta: "telemetry · events · queries",
  },
  {
    id: "features",
    index: "02",
    label: "Features",
    detail: "Parse · embed · index",
    meta: "pgvector · sparse · rerank",
  },
  {
    id: "model",
    index: "03",
    label: "Model",
    detail: "Train · tune · prompt",
    meta: "baselines · ablations · sweeps",
  },
  {
    id: "evaluate",
    index: "04",
    label: "Evaluate",
    detail: "k-fold · holdout · judge",
    meta: "metrics · regressions · alerts",
  },
  {
    id: "evidence",
    index: "05",
    label: "Evidence",
    detail: "Ground · cite · audit",
    meta: "logs · traces · citations",
  },
  {
    id: "decision",
    index: "06",
    label: "Decision",
    detail: "Ship · monitor · iterate",
    meta: "deploy · rollback · improve",
  },
]

const PHASES: ReadonlyArray<ResearchPhase> = [
  {
    id: "signals",
    label: "Signal ingestion",
    detail: "Raw observations enter the research system.",
    runtime: "12ms",
    active: ["signals"],
    output: [
      "Schema-validated event stream",
      "Deduplicated observations",
      "Session-aware boundaries",
    ],
  },
  {
    id: "features",
    label: "Feature construction",
    detail: "Raw signals become searchable representations.",
    runtime: "34ms",
    active: ["features"],
    output: [
      "Dense embedding shards",
      "Sparse retrieval indexes",
      "Hybrid candidate set",
    ],
  },
  {
    id: "model",
    label: "Model experimentation",
    detail: "Baselines and candidate systems are evaluated.",
    runtime: "142ms",
    active: ["model"],
    output: [
      "Baseline comparison",
      "Prompt and parameter sweeps",
      "Ablation results",
    ],
  },
  {
    id: "evaluate",
    label: "Evaluation",
    detail: "Results are tested against explicit criteria.",
    runtime: "198ms",
    active: ["evaluate"],
    output: [
      "Holdout and k-fold metrics",
      "Regression detection",
      "Judge consistency checks",
    ],
  },
  {
    id: "evidence",
    label: "Evidence capture",
    detail: "Claims become traceable and reproducible.",
    runtime: "214ms",
    active: ["evidence"],
    output: [
      "Citation-linked traces",
      "Reproducibility record",
      "Audit-ready experiment log",
    ],
  },
  {
    id: "decision",
    label: "Decision",
    detail: "Evidence determines what gets shipped next.",
    runtime: "241ms",
    active: ["decision"],
    output: [
      "Ship or reject decision",
      "Canary and rollback path",
      "Next experiment generated",
    ],
  },
]

const EDGE_LIST = STEPS.slice(0, -1).map((step, index) => ({
  id: `edge-${index}`,
  from: step.id,
  to: STEPS[index + 1]!.id,
}))

const STEP_INTERVAL_MS = 1700

const NODE_WIDTH = 150
const NODE_GAP = 38
const TOP_Y = 28
const BOTTOM_Y = 150

const NODE_POSITIONS = Object.fromEntries(
  STEPS.map((step, index) => [
    step.id,
    {
      x: index * (NODE_WIDTH + NODE_GAP),
      y: index % 2 === 0 ? TOP_Y : BOTTOM_Y,
    },
  ]),
) as Record<
  string,
  {
    x: number
    y: number
  }
>

function getState(
  tick: number,
  id: string,
): StepState {
  const index = STEPS.findIndex(
    (step) => step.id === id,
  )

  if (tick >= STEPS.length) {
    return "completed"
  }

  if (index < tick) {
    return "completed"
  }

  if (index === tick) {
    return "running"
  }

  return "idle"
}

function StepNode({
  data,
}: NodeProps<Node<StepNodeData>>) {
  const state = data.state

  const sourcePosition =
    data.seed.index === "01" || data.seed.index === "03" || data.seed.index === "05"
      ? Position.Right
      : Position.Left

  const targetPosition =
    data.seed.index === "01" || data.seed.index === "03" || data.seed.index === "05"
      ? Position.Right
      : Position.Left

  return (
    <motion.div
      animate={{
        y: state === "running" ? -3 : 0,
        scale: state === "running" ? 1.02 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className={cn(
        "relative min-w-[142px] overflow-hidden rounded-lg border px-3 py-2.5 backdrop-blur-xl transition-all duration-500",
        state === "running" &&
          "border-[var(--lab-orange)]/75 bg-[rgba(246,90,11,0.08)] shadow-[0_0_24px_rgba(246,90,11,0.13)]",
        state === "completed" &&
          "border-white/[0.16] bg-[#112946]/80",
        state === "idle" &&
          "border-white/[0.07] bg-[#0b1a30]/70",
      )}
    >
      <Handle
        type="target"
        position={targetPosition}
        className={cn(
          "!h-1.5 !w-1.5 !border-0",
          state === "running"
            ? "!bg-[var(--lab-orange)]"
            : "!bg-white/20",
        )}
      />

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-mono text-[8px] tracking-[0.18em]",
            state === "running"
              ? "text-[var(--lab-orange)]"
              : state === "completed"
                ? "text-white/45"
                : "text-white/20",
          )}
        >
          {data.seed.index}
        </span>

        <span
          className={cn(
            "size-1.5 rounded-full",
            state === "running" &&
              "bg-[var(--lab-orange)] shadow-[0_0_9px_rgba(246,90,11,0.8)]",
            state === "completed" &&
              "bg-white/50",
            state === "idle" &&
              "bg-white/10",
          )}
        />
      </div>

      <p
        className={cn(
          "mt-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
          state === "running"
            ? "text-white"
            : state === "completed"
              ? "text-white/75"
              : "text-white/35",
        )}
      >
        {data.seed.label}
      </p>

      <p className="mt-1 text-[8px] leading-relaxed text-white/30">
        {data.seed.detail}
      </p>

      <p className="mt-2 truncate border-t border-white/[0.05] pt-2 font-mono text-[7px] uppercase tracking-[0.08em] text-white/20">
        {data.seed.meta}
      </p>

      {state === "running" && (
        <motion.div
          className="absolute inset-x-0 bottom-0 h-px bg-[var(--lab-orange)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: STEP_INTERVAL_MS / 1000,
            ease: "linear",
          }}
        />
      )}

      <Handle
        type="source"
        position={sourcePosition}
        className={cn(
          "!h-1.5 !w-1.5 !border-0",
          state === "running"
            ? "!bg-[var(--lab-orange)]"
            : "!bg-white/20",
        )}
      />
    </motion.div>
  )
}

const nodeTypes = {
  step: StepNode,
}

export function ResearchPipeline() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick(
        (current) =>
          (current + 1) %
          (STEPS.length + 1),
      )
    }, STEP_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const isComplete = tick >= STEPS.length

  const focusedIndex = Math.min(
    tick,
    STEPS.length - 1,
  )

  const focusedStep = STEPS[focusedIndex]!
  const focusedPhase = PHASES[focusedIndex]!

  const nodes = useMemo<Node<StepNodeData>[]>(
    () =>
      STEPS.map((step) => ({
        id: step.id,
        type: "step",
        position: NODE_POSITIONS[step.id]!,
        data: {
          seed: step,
          state: getState(tick, step.id),
        },
        draggable: false,
        selectable: false,
      })),
    [tick],
  )

  const edges = useMemo<Edge[]>(
    () =>
      EDGE_LIST.map((edge, index) => {
        const fromIndex = index
        const toIndex = index + 1

        const active =
          fromIndex < tick &&
          toIndex <= tick

        const flowing =
          fromIndex === tick ||
          toIndex === tick

        return {
          id: edge.id,
          source: edge.from,
          target: edge.to,
          animated: flowing,
          type: "smoothstep",
          style: {
            stroke: active
              ? "var(--lab-orange)"
              : "rgba(255,255,255,0.10)",
            strokeWidth: active
              ? flowing
                ? 1.9
                : 1.15
              : 0.8,
            opacity: active
              ? flowing
                ? 0.95
                : 0.5
              : 0.22,
          },
        }
      }),
    [tick],
  )

  return (
    <section
      id="research"
      className="lab-page-bg relative overflow-hidden border-b border-[var(--lab-line)] py-20 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/20 to-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end"
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.26em] text-[var(--lab-orange)]">
                Research system
              </span>

              <span className="h-px w-10 bg-[var(--lab-orange)]/30" />
            </div>

            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[var(--lab-ink)] sm:text-4xl lg:text-[44px] lg:leading-[1.05]">
              Research is a loop,
              <span className="block text-[var(--lab-ink-soft)]">
                not a demo.
              </span>
            </h2>
          </div>

          <div>
            <p className="max-w-xl text-[13px] leading-[1.8] text-[var(--lab-ink-soft)] sm:text-sm">
              Signals become representations, representations become models,
              models are evaluated, evidence is captured, and every result
              creates the next experiment.
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
              <span>
                <span className="text-[var(--lab-orange)]">
                  06
                </span>{" "}
                stages
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  ∞
                </span>{" "}
                iterations
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  TRACE
                </span>{" "}
                evidence
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "0px 0px -60px 0px",
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          className="research-card-surface mt-10 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[var(--lab-line)] px-4 py-2.5 sm:px-5">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/35">
              xninetzy / experiment-loop
            </span>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isComplete
                    ? "bg-white/40"
                    : "bg-[var(--lab-orange)] shadow-[0_0_8px_rgba(246,90,11,0.7)]",
                )}
              />

              <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-[var(--lab-orange)]">
                {isComplete
                  ? "cycle complete"
                  : `step ${String(tick + 1).padStart(2, "0")} / ${String(STEPS.length).padStart(2, "0")}`}
              </span>
            </div>
          </div>

          <div className="bg-[var(--lab-bg)]">
            <div className="h-[245px] sm:h-[270px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{
                  padding: 0.08,
                }}
                proOptions={{
                  hideAttribution: true,
                }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                panOnDrag={false}
                panOnScroll={false}
                preventScrolling={false}
                minZoom={0.7}
                maxZoom={1.2}
              >
                <Background
                  gap={20}
                  size={1}
                  color="rgba(255,255,255,0.045)"
                />
              </ReactFlow>
            </div>
          </div>

          <div className="grid border-t border-[var(--lab-line)] bg-[var(--lab-card)] md:grid-cols-[1fr_270px]">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/25">
                    Focused stage
                  </p>

                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={focusedStep.id}
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white"
                    >
                      {focusedPhase.label}
                    </motion.h3>
                  </AnimatePresence>
                </div>

                <span className="font-mono text-[9px] text-[var(--lab-orange)]">
                  {focusedPhase.runtime}
                </span>
              </div>

              <p className="mt-2 max-w-xl text-[11px] leading-[1.7] text-white/38">
                {focusedPhase.detail}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {focusedPhase.output.map(
                  (output) => (
                    <span
                      key={output}
                      className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-[9px] text-white/42"
                    >
                      {output}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="border-t border-[var(--lab-line)] p-4 md:border-l md:border-t-0 sm:p-5">
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/25">
                Run state
              </p>

              <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.06]">
                <Metric
                  label="Stage"
                  value={`${Math.min(tick + 1, 6)}/6`}
                  active
                />

                <Metric
                  label="Runtime"
                  value={focusedPhase.runtime}
                />

                <Metric
                  label="Mode"
                  value={isComplete ? "loop" : "live"}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--lab-line)] bg-[var(--lab-card)]/55 px-4 py-3 sm:px-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {STEPS.map((step) => {
                const state = getState(
                  tick,
                  step.id,
                )

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "relative rounded-md border px-3 py-2.5 transition-all duration-500",
                      state === "running" &&
                        "border-[var(--lab-orange)]/30 bg-[var(--lab-orange)]/[0.045]",
                      state === "completed" &&
                        "border-white/[0.07] bg-white/[0.015]",
                      state === "idle" &&
                        "border-white/[0.04]",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[7px] text-white/20">
                        {step.index}
                      </span>

                      {state === "completed" ? (
                        <CheckCircle2 className="size-3 text-white/40" />
                      ) : state === "running" ? (
                        <Loader2 className="size-3 animate-spin text-[var(--lab-orange)]" />
                      ) : (
                        <Circle className="size-3 text-white/10" />
                      )}
                    </div>

                    <p
                      className={cn(
                        "mt-2 text-[9px]",
                        state === "running"
                          ? "text-white"
                          : state === "completed"
                            ? "text-white/45"
                            : "text-white/20",
                      )}
                    >
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
  active = false,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <div className="bg-[var(--lab-card)] px-2.5 py-2.5">
      <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-white/20">
        {label}
      </p>

      <p
        className={cn(
          "mt-1 font-mono text-[10px]",
          active
            ? "text-[var(--lab-orange)]"
            : "text-white/50",
        )}
      >
        {value}
      </p>
    </div>
  )
}