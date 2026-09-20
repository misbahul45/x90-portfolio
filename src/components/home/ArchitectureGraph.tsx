import { useEffect, useMemo, useState } from "react"
import {
  BaseEdge,
  Background,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  motion,
  useReducedMotion,
} from "motion/react"
import { cn } from "#/lib/utils"

type NodeState = "idle" | "running" | "completed"

type AgentNodeData = {
  index: string
  label: string
  detail: string
  metric: string
  state: NodeState
}

type RuntimePhase = {
  id: string
  label: string
  detail: string
  runtime: number
  active: string[]
  completed: string[]
}

const RUNTIME_PHASES: RuntimePhase[] = [
  {
    id: "input",
    label: "Input received",
    detail: "Normalize the request and establish execution context.",
    runtime: 18,
    active: ["input"],
    completed: [],
  },
  {
    id: "plan",
    label: "Plan generated",
    detail: "Decompose intent into executable sub-problems.",
    runtime: 84,
    active: ["planner"],
    completed: ["input"],
  },
  {
    id: "context",
    label: "Context assembled",
    detail: "RAG, tools and memory execute as parallel branches.",
    runtime: 176,
    active: ["rag", "tools", "memory"],
    completed: ["input", "planner"],
  },
  {
    id: "reason",
    label: "Reasoning",
    detail: "Merge retrieved evidence, tool results and memory.",
    runtime: 248,
    active: ["reasoner"],
    completed: [
      "input",
      "planner",
      "rag",
      "tools",
      "memory",
    ],
  },
  {
    id: "output",
    label: "Response formed",
    detail: "Validate the result and expose the final response.",
    runtime: 282,
    active: ["output"],
    completed: [
      "input",
      "planner",
      "rag",
      "tools",
      "memory",
      "reasoner",
    ],
  },
  {
    id: "complete",
    label: "Cycle complete",
    detail: "Execution trace captured. Ready for the next request.",
    runtime: 296,
    active: [],
    completed: [
      "input",
      "planner",
      "rag",
      "tools",
      "memory",
      "reasoner",
      "output",
    ],
  },
]

const NODE_SEEDS = [
  {
    id: "input",
    x: 0,
    y: 130,
    index: "01",
    label: "Input",
    detail: "user query",
    metric: "raw intent",
  },
  {
    id: "planner",
    x: 230,
    y: 130,
    index: "02",
    label: "Planner",
    detail: "decompose",
    metric: "task graph",
  },
  {
    id: "rag",
    x: 470,
    y: 0,
    index: "03",
    label: "RAG",
    detail: "retrieve",
    metric: "5 passages",
  },
  {
    id: "tools",
    x: 470,
    y: 130,
    index: "04",
    label: "Tools",
    detail: "execute",
    metric: "3 calls",
  },
  {
    id: "memory",
    x: 470,
    y: 260,
    index: "05",
    label: "Memory",
    detail: "recall",
    metric: "episodic",
  },
  {
    id: "reasoner",
    x: 720,
    y: 130,
    index: "06",
    label: "Reasoner",
    detail: "synthesize",
    metric: "context merge",
  },
  {
    id: "output",
    x: 960,
    y: 130,
    index: "07",
    label: "Output",
    detail: "respond",
    metric: "verified",
  },
] as const

const EDGE_SEEDS = [
  { id: "e1", from: "input", to: "planner" },
  { id: "e2", from: "planner", to: "rag" },
  { id: "e3", from: "planner", to: "tools" },
  { id: "e4", from: "planner", to: "memory" },
  { id: "e5", from: "rag", to: "reasoner" },
  { id: "e6", from: "tools", to: "reasoner" },
  { id: "e7", from: "memory", to: "reasoner" },
  { id: "e8", from: "reasoner", to: "output" },
] as const

const MOBILE_SEQUENCE = [
  "input",
  "planner",
  "rag",
  "tools",
  "memory",
  "reasoner",
  "output",
]

const MOBILE_LABELS: Record<string, string> = {
  input: "Input · user query",
  planner: "Planner · task graph",
  rag: "RAG · 5 passages",
  tools: "Tools · 3 calls",
  memory: "Memory · episodic",
  reasoner: "Reasoner · context merge",
  output: "Output · verified",
}

const STEP_INTERVAL_MS = 1600

function getPhaseIndex(
  phases: readonly RuntimePhase[],
  nodeId: string,
) {
  for (let index = phases.length - 1; index >= 0; index -= 1) {
    if (
      phases[index]?.active.includes(nodeId) ||
      phases[index]?.completed.includes(nodeId)
    ) {
      return index
    }
  }

  return -1
}

function getNodeState(
  phaseIndex: number,
  nodeId: string,
): NodeState {
  const phase = RUNTIME_PHASES[phaseIndex]

  if (!phase) {
    return "idle"
  }

  if (phase.active.includes(nodeId)) {
    return "running"
  }

  if (phase.completed.includes(nodeId)) {
    return "completed"
  }

  return "idle"
}

function getEdgeState(
  phaseIndex: number,
  from: string,
  to: string,
) {
  const fromState = getNodeState(
    phaseIndex,
    from,
  )

  const toState = getNodeState(
    phaseIndex,
    to,
  )

  const active =
    fromState !== "idle" &&
    toState !== "idle"

  const flowing =
    fromState === "running" ||
    toState === "running"

  return {
    active,
    flowing,
  }
}

function AgentNode({
  data,
}: NodeProps<Node<AgentNodeData>>) {
  const running = data.state === "running"
  const completed =
    data.state === "completed"

  return (
    <motion.div
      animate={{
        y: running ? -3 : 0,
        scale: running ? 1.02 : 1,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className={cn(
        "relative min-w-[190px] overflow-hidden rounded-xl border bg-[#0b1a30]/85 px-4 py-3 backdrop-blur-xl transition-all duration-500",
        running &&
          "border-[var(--lab-orange)]/80 shadow-[0_0_32px_rgba(246,90,11,0.15)]",
        completed &&
          "border-white/[0.18]",
        !running &&
          !completed &&
          "border-white/[0.08]",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "!h-1.5 !w-1.5 !border-0",
          running
            ? "!bg-[var(--lab-orange)]"
            : "!bg-white/20",
        )}
      />

      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "!h-1.5 !w-1.5 !border-0",
          running
            ? "!bg-[var(--lab-orange)]"
            : "!bg-white/20",
        )}
      />

      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500",
          running && "opacity-100",
        )}
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(255,194,120,1),transparent)",
        }}
      />

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-mono text-[8px] tracking-[0.2em]",
            running
              ? "text-[var(--lab-orange)]"
              : completed
                ? "text-white/45"
                : "text-white/20",
          )}
        >
          {data.index}
        </span>

        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/20">
          {data.state}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <span
          className={cn(
            "size-1.5 rounded-full transition-all duration-500",
            running &&
              "bg-[var(--lab-orange)] shadow-[0_0_12px_rgba(246,90,11,0.8)]",
            completed &&
              "bg-white/60",
            !running &&
              !completed &&
              "bg-white/12",
          )}
        />

        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-white/85">
          {data.label}
        </span>
      </div>

      <p className="mt-2 text-[10px] text-white/38">
        {data.detail}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/24">
          {data.metric}
        </span>

        <span
          className={cn(
            "h-px w-6 transition-all duration-500",
            running
              ? "bg-[var(--lab-orange)]"
              : completed
                ? "bg-white/30"
                : "bg-white/10",
          )}
        />
      </div>
    </motion.div>
  )
}

function SignalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const active =
    Number(style?.opacity ?? 0) > 0.5

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={style}
        markerEnd={markerEnd}
      />

      {active && (
        <motion.path
          d={path}
          fill="none"
          stroke="rgba(255,194,120,0.95)"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeDasharray="2 14"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -32 }}
          transition={{
            duration: 1.25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {active && (
        <EdgeLabelRenderer>
          <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2">
            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-[var(--lab-orange)]/40">
              signal
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const nodeTypes = {
  agent: AgentNode,
}

const edgeTypes = {
  signal: SignalEdge,
}

export function ArchitectureGraph() {
  const reducedMotion = useReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick(
        (current) =>
          (current + 1) %
          RUNTIME_PHASES.length,
      )
    }, STEP_INTERVAL_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const phase =
    RUNTIME_PHASES[tick] ??
    RUNTIME_PHASES[0]!

  const nodes = useMemo<Node<AgentNodeData>[]>(
    () =>
      NODE_SEEDS.map((seed) => ({
        id: seed.id,
        type: "agent",
        position: {
          x: seed.x,
          y: seed.y,
        },
        data: {
          index: seed.index,
          label: seed.label,
          detail: seed.detail,
          metric: seed.metric,
          state: getNodeState(
            tick,
            seed.id,
          ),
        },
        draggable: false,
        selectable: false,
      })),
    [tick],
  )

  const edges = useMemo<Edge[]>(
    () =>
      EDGE_SEEDS.map((edge) => {
        const state = getEdgeState(
          tick,
          edge.from,
          edge.to,
        )

        return {
          id: edge.id,
          type: "signal",
          source: edge.from,
          target: edge.to,
          animated:
            state.flowing &&
            !reducedMotion,
          style: {
            stroke: state.active
              ? "var(--lab-orange)"
              : "rgba(255,255,255,0.09)",
            strokeWidth:
              state.active
                ? state.flowing
                  ? 1.8
                  : 1.2
                : 0.8,
            opacity: state.active
              ? state.flowing
                ? 0.92
                : 0.48
              : 0.2,
          },
        }
      }),
    [tick, reducedMotion],
  )

  const totalBranches =
    phase.active.filter(
      (id) =>
        id === "rag" ||
        id === "tools" ||
        id === "memory",
    ).length

  const completedCount =
    phase.completed.length

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "0px 0px -80px 0px",
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      className="research-card-surface overflow-hidden"
    >
      <div className="relative flex items-center justify-between border-b border-[var(--lab-line)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
            xninetzy / agent-runtime
          </span>

          <span className="hidden h-px w-7 bg-[var(--lab-orange)]/30 sm:block" />

          <span className="hidden font-mono text-[8px] uppercase tracking-[0.14em] text-white/20 sm:block">
            execution graph
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--lab-orange)] shadow-[0_0_10px_rgba(246,90,11,0.7)]" />

          <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--lab-orange)]">
            {phase.id}
          </span>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="relative h-[390px] bg-[var(--lab-bg)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(246,90,11,0.045),transparent_42%)]"
          />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{
              padding: 0.16,
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
            minZoom={0.78}
            maxZoom={1.08}
          >
            <Background
              gap={22}
              size={1}
              color="rgba(255,255,255,0.055)"
            />
          </ReactFlow>

          <div className="pointer-events-none absolute inset-x-5 bottom-4 z-20 flex items-center justify-between border-t border-white/[0.06] pt-3">
            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/20">
              input → plan → context → reason → output
            </span>

            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--lab-orange)]/50">
              live runtime
            </span>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="border-b border-[var(--lab-line)] px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
              Current phase
            </span>

            <span className="font-mono text-[9px] text-white/25">
              {String(tick + 1).padStart(2, "0")} /
              {" "}
              {String(
                RUNTIME_PHASES.length,
              ).padStart(2, "0")}
            </span>
          </div>

          <h3 className="mt-2 text-lg font-semibold text-white">
            {phase.label}
          </h3>

          <p className="mt-1 text-[11px] leading-relaxed text-white/40">
            {phase.detail}
          </p>
        </div>

        <ul className="divide-y divide-white/[0.06]">
          {MOBILE_SEQUENCE.map(
            (id, index) => {
              const state =
                getNodeState(
                  tick,
                  id,
                )

              return (
                <li
                  key={id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors duration-300",
                    state === "running" &&
                      "bg-[var(--lab-orange)]/[0.055]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md border font-mono text-[8px]",
                      state === "running"
                        ? "border-[var(--lab-orange)]/35 text-[var(--lab-orange)]"
                        : "border-white/[0.07] text-white/22",
                    )}
                  >
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      state === "running" &&
                        "bg-[var(--lab-orange)] shadow-[0_0_10px_rgba(246,90,11,0.7)]",
                      state === "completed" &&
                        "bg-white/50",
                      state === "idle" &&
                        "bg-white/10",
                    )}
                  />

                  <span
                    className={cn(
                      "min-w-0 flex-1 text-xs",
                      state === "running"
                        ? "text-white"
                        : state === "completed"
                          ? "text-white/60"
                          : "text-white/25",
                    )}
                  >
                    {MOBILE_LABELS[id]}
                  </span>

                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/20">
                    {state}
                  </span>
                </li>
              )
            },
          )}
        </ul>
      </div>

      <div className="border-t border-[var(--lab-line)] bg-[var(--lab-card)]/70 px-4 py-4 sm:px-5">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
          <RuntimeMetric
            label="Runtime"
            value={`${phase.runtime}ms`}
            active
          />

          <RuntimeMetric
            label="Completed"
            value={`${completedCount}/7`}
          />

          <RuntimeMetric
            label="Parallel"
            value={`${totalBranches || 0}`}
          />

          <RuntimeMetric
            label="Context"
            value={
              phase.id === "context"
                ? "assembled"
                : phase.id === "reason"
                  ? "merged"
                  : "waiting"
            }
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">
              execution trace
            </span>

            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/20">
              {phase.id}
            </span>
          </div>

          <div className="mt-2 h-px overflow-hidden bg-white/[0.07]">
            <motion.div
              className="h-full bg-linear-to-r from-[var(--lab-orange)]/30 via-[var(--lab-orange)] to-[var(--lab-orange)]/30"
              animate={{
                width: `${((tick + 1) / RUNTIME_PHASES.length) * 100}%`,
              }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RuntimeMetric({
  label,
  value,
  active = false,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <div className="bg-[var(--lab-card)] px-3 py-3 sm:px-4">
      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/20">
        {label}
      </p>

      <p
        className={cn(
          "mt-1.5 font-mono text-xs",
          active
            ? "text-[var(--lab-orange)]"
            : "text-white/55",
        )}
      >
        {value}
      </p>
    </div>
  )
}