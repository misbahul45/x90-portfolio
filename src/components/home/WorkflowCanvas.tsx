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
import { motion } from "motion/react"
import {
  Bot,
  CheckCircle2,
  Circle,
  Code2,
  Cpu,
  Database,
  Globe,
  Loader2,
  Smartphone,
  Webhook,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { cn } from "#/lib/utils"

type NodeState = "idle" | "running" | "completed"

type FlowNodeData = {
  label: string
  detail: string
  icon: LucideIcon
  state: NodeState
  index: string
}

type FlowNode = Node<FlowNodeData>

type Phase = {
  id: string
  label: string
  detail: string
  ms: number
  active: string[]
}

const PHASES: Phase[] = [
  {
    id: "trigger",
    label: "Signal received",
    detail: "Webhook accepted and normalized",
    ms: 12,
    active: ["trigger"],
  },
  {
    id: "route",
    label: "Intent routed",
    detail: "Execution graph selected",
    ms: 34,
    active: ["router"],
  },
  {
    id: "reason",
    label: "Context execution",
    detail: "Retrieval, planning and tools run",
    ms: 88,
    active: ["ingest", "agent", "tools"],
  },
  {
    id: "verify",
    label: "Output verified",
    detail: "Grounding, scoring and citation",
    ms: 198,
    active: ["verify"],
  },
  {
    id: "deliver",
    label: "Delivery fan-out",
    detail: "Web, mobile and API outputs",
    ms: 221,
    active: ["deliver", "deliver2", "deliver3"],
  },
]

const NODE_SEEDS: Array<{
  id: string
  x: number
  y: number
  label: string
  detail: string
  icon: LucideIcon
  index: string
}> = [
  {
    id: "trigger",
    x: 420,
    y: 0,
    label: "Trigger",
    detail: "webhook · form · schedule",
    icon: Webhook,
    index: "01",
  },
  {
    id: "router",
    x: 420,
    y: 120,
    label: "Router",
    detail: "branch by intent",
    icon: Cpu,
    index: "02",
  },
  {
    id: "ingest",
    x: 80,
    y: 260,
    label: "Ingest",
    detail: "parse · clean · embed",
    icon: Database,
    index: "03",
  },
  {
    id: "agent",
    x: 360,
    y: 260,
    label: "Agent",
    detail: "plan · reason · decide",
    icon: Bot,
    index: "04",
  },
  {
    id: "tools",
    x: 640,
    y: 260,
    label: "Tools",
    detail: "search · db · http",
    icon: Wrench,
    index: "05",
  },
  {
    id: "verify",
    x: 420,
    y: 410,
    label: "Verify",
    detail: "ground · score · cite",
    icon: CheckCircle2,
    index: "06",
  },
  {
    id: "deliver",
    x: 80,
    y: 560,
    label: "Web App",
    detail: "dashboard · CMS",
    icon: Globe,
    index: "07",
  },
  {
    id: "deliver2",
    x: 360,
    y: 560,
    label: "Mobile",
    detail: "iOS · Android",
    icon: Smartphone,
    index: "08",
  },
  {
    id: "deliver3",
    x: 640,
    y: 560,
    label: "API",
    detail: "REST · webhooks",
    icon: Code2,
    index: "09",
  },
]

const EDGE_SEEDS: Array<{
  id: string
  from: string
  to: string
}> = [
  { id: "e1", from: "trigger", to: "router" },
  { id: "e2", from: "router", to: "ingest" },
  { id: "e3", from: "router", to: "agent" },
  { id: "e4", from: "router", to: "tools" },
  { id: "e5", from: "ingest", to: "verify" },
  { id: "e6", from: "agent", to: "verify" },
  { id: "e7", from: "tools", to: "verify" },
  { id: "e8", from: "verify", to: "deliver" },
  { id: "e9", from: "verify", to: "deliver2" },
  { id: "e10", from: "verify", to: "deliver3" },
]

const MOBILE_SEQUENCE = [
  "trigger",
  "router",
  "ingest",
  "agent",
  "tools",
  "verify",
  "deliver",
  "deliver2",
  "deliver3",
]

const MOBILE_LABELS: Record<string, string> = {
  trigger: "Trigger · webhook / form / schedule",
  router: "Router · branch by intent",
  ingest: "Ingest · parse · clean · embed",
  agent: "Agent · plan · reason · decide",
  tools: "Tools · search · db · http",
  verify: "Verify · ground · score · cite",
  deliver: "Web App · dashboard · CMS",
  deliver2: "Mobile · iOS · Android",
  deliver3: "API · REST · webhooks",
}

function getNodeState(
  id: string,
  phaseIndex: number,
): NodeState {
  const currentPhase = PHASES[phaseIndex]

  if (currentPhase.active.includes(id)) {
    return "running"
  }

  const hasCompleted = PHASES
    .slice(0, phaseIndex)
    .some((phase) => phase.active.includes(id))

  return hasCompleted ? "completed" : "idle"
}

function getEdgeState(
  from: string,
  to: string,
  phaseIndex: number,
) {
  const sourceState = getNodeState(
    from,
    phaseIndex,
  )
  const targetState = getNodeState(
    to,
    phaseIndex,
  )

  const sourceActive = sourceState !== "idle"
  const targetActive = targetState !== "idle"
  const animated =
    sourceState === "running" ||
    targetState === "running"

  return {
    active: sourceActive && targetActive,
    animated,
  }
}

const STATE_STYLES: Record<
  NodeState,
  {
    border: string
    bg: string
    text: string
    line: string
  }
> = {
  idle: {
    border: "border-white/[0.08]",
    bg: "bg-[#0b1a30]/85",
    text: "text-white/42",
    line: "bg-white/20",
  },
  running: {
    border: "border-[var(--lab-orange)]/80",
    bg: "bg-[rgba(246,90,11,0.11)]",
    text: "text-[var(--lab-orange)]",
    line: "bg-[var(--lab-orange)]",
  },
  completed: {
    border: "border-white/20",
    bg: "bg-[#112946]/90",
    text: "text-white/75",
    line: "bg-white/45",
  },
}

function FlowNode({
  data,
}: NodeProps<FlowNode>) {
  const styles = STATE_STYLES[data.state]
  const Icon = data.icon

  return (
    <motion.div
      animate={{
        y: data.state === "running" ? -2 : 0,
        scale: data.state === "running" ? 1.015 : 1,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className={cn(
        "group relative min-w-[210px] overflow-hidden rounded-xl border px-3.5 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-500",
        styles.border,
        styles.bg,
        data.state === "running" &&
          "shadow-[0_0_30px_rgba(246,90,11,0.16)]",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "!h-1.5 !w-1.5 !border-0",
          data.state === "running"
            ? "!bg-[var(--lab-orange)]"
            : "!bg-white/25",
        )}
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300",
          data.state === "running" &&
            "opacity-100",
        )}
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,194,120,1), transparent)",
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "font-mono text-[9px] tracking-[0.18em]",
            styles.text,
          )}
        >
          {data.index}
        </span>

        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">
          {data.state}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <Icon
          className={cn(
            "size-4 transition-colors duration-300",
            styles.text,
          )}
          aria-hidden
        />

        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
          {data.label}
        </span>
      </div>

      <p className="mt-1 text-[10px] leading-relaxed text-white/40">
        {data.detail}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "h-px flex-1 transition-all duration-500",
            styles.line,
          )}
        />

        <span
          className={cn(
            "size-1 rounded-full transition-all duration-500",
            data.state === "running"
              ? "bg-[var(--lab-orange)] shadow-[0_0_10px_rgba(246,90,11,0.8)]"
              : data.state === "completed"
                ? "bg-white/60"
                : "bg-white/15",
          )}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "!h-1.5 !w-1.5 !border-0",
          data.state === "running"
            ? "!bg-[var(--lab-orange)]"
            : "!bg-white/25",
        )}
      />
    </motion.div>
  )
}

const nodeTypes = {
  flow: FlowNode,
}

export function WorkflowCanvas() {
  const [phaseIndex, setPhaseIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhaseIndex(
        (previous) =>
          (previous + 1) % PHASES.length,
      )
    }, 1500)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const nodes = useMemo<FlowNode[]>(
    () =>
      NODE_SEEDS.map((node) => ({
        id: node.id,
        type: "flow",
        position: {
          x: node.x,
          y: node.y,
        },
        data: {
          label: node.label,
          detail: node.detail,
          icon: node.icon,
          index: node.index,
          state: getNodeState(
            node.id,
            phaseIndex,
          ),
        },
        draggable: false,
        selectable: false,
      })),
    [phaseIndex],
  )

  const edges = useMemo<Edge[]>(
    () =>
      EDGE_SEEDS.map((edge) => {
        const state = getEdgeState(
          edge.from,
          edge.to,
          phaseIndex,
        )

        return {
          id: edge.id,
          source: edge.from,
          target: edge.to,
          animated: state.animated,
          style: {
            stroke: state.active
              ? "var(--lab-orange)"
              : "rgba(255,255,255,0.12)",
            strokeWidth: state.active
              ? state.animated
                ? 1.8
                : 1.25
              : 0.8,
            opacity: state.active
              ? state.animated
                ? 0.95
                : 0.5
              : 0.22,
          },
        }
      }),
    [phaseIndex],
  )

  const currentPhase = PHASES[phaseIndex]

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_OPTIONS}
      variants={fadeInUp}
      className="research-card-surface overflow-hidden"
    >
      <div className="relative flex items-center justify-between border-b border-[var(--lab-line)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            execution graph
          </span>

          <span className="hidden h-px w-7 bg-[var(--lab-orange)]/35 sm:block" />

          <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-white/25 sm:block">
            xninetzy / runtime
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full bg-[var(--lab-orange)]",
                "animate-ping opacity-60",
              )}
            />

            <span className="relative inline-flex size-1.5 rounded-full bg-[var(--lab-orange)]" />
          </span>

          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--lab-orange)]">
            {currentPhase.id}
          </span>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="relative h-[610px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(246,90,11,0.05), transparent 34%)",
            }}
          />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.15,
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
            minZoom={0.75}
            maxZoom={1.15}
          >
            <Background
              gap={22}
              size={1}
              color="rgba(255,255,255,0.07)"
            />
          </ReactFlow>
        </div>
      </div>

      <div className="md:hidden">
        <div className="border-b border-[var(--lab-line)] px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
            current phase
          </p>

          <p className="mt-2 text-sm font-medium text-white">
            {currentPhase.label}
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-white/40">
            {currentPhase.detail}
          </p>
        </div>

        <ul className="divide-y divide-white/[0.06]">
          {MOBILE_SEQUENCE.map(
            (id, index) => {
              const state = getNodeState(
                id,
                phaseIndex,
              )

              const node = NODE_SEEDS.find(
                (item) => item.id === id,
              )

              if (!node) {
                return null
              }

              const Icon = node.icon

              return (
                <li
                  key={id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-all duration-300",
                    state === "running" &&
                      "bg-[var(--lab-orange-soft)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md border font-mono text-[9px]",
                      state === "running"
                        ? "border-[var(--lab-orange)]/35 text-[var(--lab-orange)]"
                        : "border-white/[0.08] text-white/30",
                    )}
                  >
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      state === "running" &&
                        "text-[var(--lab-orange)]",
                      state === "completed" &&
                        "text-white/70",
                      state === "idle" &&
                        "text-white/20",
                    )}
                    aria-hidden
                  />

                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-xs",
                      state === "running"
                        ? "text-white"
                        : state === "completed"
                          ? "text-white/65"
                          : "text-white/35",
                    )}
                  >
                    {MOBILE_LABELS[id]}
                  </span>

                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">
                    {state}
                  </span>
                </li>
              )
            },
          )}
        </ul>
      </div>

      <div className="border-t border-[var(--lab-line)] bg-[var(--lab-card)]">
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/30">
                Pipeline trace
              </p>

              <p className="mt-1 text-[12px] text-white/55">
                {currentPhase.detail}
              </p>
            </div>

            <span className="font-mono text-[12px] font-medium text-[var(--lab-orange)]">
              {currentPhase.ms}ms
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {PHASES.map(
              (phase, index) => {
                const state =
                  index < phaseIndex
                    ? "completed"
                    : index === phaseIndex
                      ? "running"
                      : "idle"

                return (
                  <div
                    key={phase.id}
                    className={cn(
                      "relative rounded-lg border px-3 py-3 transition-all duration-500",
                      state === "running" &&
                        "border-[var(--lab-orange)]/35 bg-[var(--lab-orange)]/[0.06]",
                      state === "completed" &&
                        "border-white/[0.09] bg-white/[0.025]",
                      state === "idle" &&
                        "border-white/[0.05] bg-transparent",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {state === "completed" ? (
                        <CheckCircle2 className="size-3 text-white/60" />
                      ) : state === "running" ? (
                        <Loader2 className="size-3 animate-spin text-[var(--lab-orange)]" />
                      ) : (
                        <Circle className="size-3 text-white/20" />
                      )}

                      <span className="font-mono text-[8px] text-white/25">
                        {String(index + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>
                    </div>

                    <p
                      className={cn(
                        "mt-2 text-[10px] leading-relaxed",
                        state === "running"
                          ? "text-white"
                          : state === "completed"
                            ? "text-white/55"
                            : "text-white/25",
                      )}
                    >
                      {phase.label}
                    </p>

                    <p className="mt-1 font-mono text-[9px] text-white/20">
                      {phase.ms}ms
                    </p>
                  </div>
                )
              },
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function WorkflowSection() {
  return (
    <section
      id="how-we-build"
      className="lab-page-bg border-b border-[var(--lab-line)] py-24 sm:py-28"
    >
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-[var(--lab-orange)]">
                Execution model
              </span>

              <span className="h-px w-12 bg-[var(--lab-orange)]/35" />
            </div>

            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-[var(--lab-ink)] sm:text-4xl lg:text-[46px] lg:leading-[1.04]">
              An agentic delivery
              <span className="block text-[var(--lab-ink-soft)]">
                pipeline.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-sm leading-[1.85] text-[var(--lab-ink-soft)] sm:text-base">
              Intent enters the system, context is assembled, reasoning and
              tools execute in parallel, outputs are verified, then the result
              fans out into the product surface that needs it.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <span>
                <span className="text-[var(--lab-orange)]">
                  05
                </span>{" "}
                execution phases
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  03
                </span>{" "}
                delivery surfaces
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  HITL
                </span>{" "}
                when needed
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mt-14">
          <WorkflowCanvas />
        </div>
      </div>
    </section>
  )
}