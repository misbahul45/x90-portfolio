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
}

const STATE_STYLES: Record<NodeState, { border: string; bg: string; accent: string }> = {
  idle: {
    border: "border-[var(--lab-line)]",
    bg: "bg-[var(--lab-card)]",
    accent: "text-[var(--lab-ink-soft)]",
  },
  running: {
    border: "border-[var(--lab-orange)]",
    bg: "bg-[var(--lab-orange-soft)]",
    accent: "text-[var(--lab-orange)]",
  },
  completed: {
    border: "border-white/30",
    bg: "bg-[var(--lab-card-elevated)]",
    accent: "text-[var(--lab-ink)]",
  },
}

function FlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const styles = STATE_STYLES[data.state]
  const Icon = data.icon
  return (
    <div
      className={cn(
        "min-w-[170px] rounded-md border bg-[var(--lab-card)] px-3 py-2.5 transition-all",
        styles.border,
        styles.bg,
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !bg-[var(--lab-orange)] !border-0"
      />
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", styles.accent)} aria-hidden />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--lab-ink)]">
          {data.label}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-[var(--lab-ink-soft)]">{data.detail}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !bg-[var(--lab-orange)] !border-0"
      />
    </div>
  )
}

const nodeTypes = { flow: FlowNode }

type NodeSeed = {
  id: string
  x: number
  y: number
  label: string
  detail: string
  icon: LucideIcon
}

const NODE_WIDTH = 200
const ROW_HEIGHT = 110

const NODES: NodeSeed[] = [
  { id: "trigger", x: 200, y: 0, label: "Trigger", detail: "webhook · form · schedule", icon: Webhook },
  { id: "router", x: 200, y: ROW_HEIGHT, label: "Router", detail: "branch by intent", icon: Cpu },
  { id: "ingest", x: 0, y: ROW_HEIGHT * 2, label: "Ingest", detail: "parse · clean · embed", icon: Database },
  { id: "agent", x: NODE_WIDTH, y: ROW_HEIGHT * 2, label: "Agent", detail: "plan · tool · reason", icon: Bot },
  { id: "tools", x: NODE_WIDTH * 2, y: ROW_HEIGHT * 2, label: "Tools", detail: "search · db · http", icon: Wrench },
  { id: "verify", x: 200, y: ROW_HEIGHT * 3, label: "Verify", detail: "ground · score · cite", icon: CheckCircle2 },
  { id: "deliver", x: 0, y: ROW_HEIGHT * 4, label: "Web App", detail: "dashboard · CMS", icon: Globe },
  { id: "deliver2", x: NODE_WIDTH, y: ROW_HEIGHT * 4, label: "Mobile", detail: "iOS · Android", icon: Smartphone },
  { id: "deliver3", x: NODE_WIDTH * 2, y: ROW_HEIGHT * 4, label: "API", detail: "REST · webhooks", icon: Code2 },
]

const EDGE_LIST: Array<{ id: string; from: string; to: string }> = [
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

const ACTIVE_SEQUENCE = ["trigger", "router", "agent", "verify", "deliver3"]

function computeState(activeIndex: number, id: string): NodeState {
  const pos = ACTIVE_SEQUENCE.indexOf(id)
  if (pos === -1) return "idle"
  if (pos < activeIndex) return "completed"
  if (pos === activeIndex) return "running"
  return "idle"
}

const EXECUTION_TICKS = [
  { step: "trigger", label: "Webhook received", ms: 12 },
  { step: "router", label: "Intent classified", ms: 34 },
  { step: "ingest", label: "Context retrieved", ms: 88 },
  { step: "agent", label: "Plan drafted", ms: 142 },
  { step: "verify", label: "Grounded & cited", ms: 198 },
  { step: "deliver", label: "Response shipped", ms: 221 },
]

const LOOP_INTERVAL_MS = 1400

const VERTICAL_SEQUENCE = [
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

const VERTICAL_LABELS: Record<string, string> = {
  trigger: "Trigger · webhook / form / schedule",
  router: "Router · branch by intent",
  ingest: "Ingest · parse · clean · embed",
  agent: "Agent · plan · tool · reason",
  tools: "Tools · search · db · http",
  verify: "Verify · ground · score · cite",
  deliver: "Web App · dashboard · CMS",
  deliver2: "Mobile · iOS · Android",
  deliver3: "API · REST · webhooks",
}

export function WorkflowCanvas() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((prev) => (prev + 1) % (ACTIVE_SEQUENCE.length + 1))
    }, LOOP_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  const nodes = useMemo<Node<FlowNodeData>[]>(
    () =>
      NODES.map((node) => ({
        id: node.id,
        type: "flow",
        position: { x: node.x, y: node.y },
        data: {
          label: node.label,
          detail: node.detail,
          icon: node.icon,
          state: computeState(tick, node.id),
        },
      })),
    [tick],
  )

  const edges = useMemo<Edge[]>(
    () =>
      EDGE_LIST.map((edge) => {
        const fromActive = ACTIVE_SEQUENCE.indexOf(edge.from) <= tick
        const toActive = ACTIVE_SEQUENCE.indexOf(edge.to) <= tick
        const active = fromActive && toActive
        return {
          id: edge.id,
          source: edge.from,
          target: edge.to,
          animated: active,
          style: {
            stroke: active ? "var(--lab-orange)" : "var(--lab-line-strong)",
            strokeWidth: active ? 1.6 : 1,
            opacity: active ? 0.85 : 0.3,
          },
        }
      }),
    [tick],
  )

  const totalMs = EXECUTION_TICKS[Math.min(tick, EXECUTION_TICKS.length - 1)]?.ms ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.5 }}
      className="research-card-surface overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-[var(--lab-line)] px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-xs text-[var(--lab-ink-soft)]">
          <Bot className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
          xninetzy-labs / delivery-pipeline
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-medium text-[var(--lab-ink-soft)]">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--lab-orange)] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[var(--lab-orange)]" />
          </span>
          {tick < ACTIVE_SEQUENCE.length ? `running · ${totalMs}ms` : "ready"}
        </span>
      </div>

      <div className="hidden md:block">
        <div className="h-[540px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnDrag={false}
            defaultEdgeOptions={{ style: { stroke: "var(--lab-orange)", strokeWidth: 1.4 } }}
          >
            <Background gap={20} size={1} color="var(--lab-line)" />
          </ReactFlow>
        </div>
      </div>

      <div className="md:hidden">
        <ul className="divide-y divide-[var(--lab-line)]">
          {VERTICAL_SEQUENCE.map((id, index) => {
            const state: NodeState =
              index < tick ? "completed" : index === tick ? "running" : "idle"
            const node = NODES.find((n) => n.id === id)
            if (!node) return null
            const Icon = node.icon
            return (
              <li
                key={id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors",
                  state === "running" && "bg-[var(--lab-orange-soft)]",
                )}
              >
                <span className="flex size-7 items-center justify-center border border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink-soft)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    state === "running" && "text-[var(--lab-orange)]",
                    state === "completed" && "text-[var(--lab-ink)]",
                    state === "idle" && "text-[var(--lab-ink-soft)]/60",
                  )}
                  aria-hidden
                />
                <span className="text-sm text-[var(--lab-ink)]">
                  {VERTICAL_LABELS[id] ?? node.detail}
                </span>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)]">
                  {state}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-[var(--lab-line)] bg-[var(--lab-card)] px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
          Pipeline execution
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {EXECUTION_TICKS.map((entry, index) => {
            const state: NodeState =
              index < tick ? "completed" : index === tick ? "running" : "idle"
            return (
              <li
                key={entry.step}
                className="flex items-center justify-between gap-2 font-mono text-[11px] text-[var(--lab-ink-soft)]"
              >
                <span className="flex items-center gap-1.5">
                  {state === "completed" ? (
                    <CheckCircle2 className="size-3 text-[var(--lab-ink)]" aria-hidden />
                  ) : state === "running" ? (
                    <Loader2 className="size-3 animate-spin text-[var(--lab-orange)]" aria-hidden />
                  ) : (
                    <Circle className="size-3 text-[var(--lab-ink-soft)]/40" aria-hidden />
                  )}
                  <span className="text-[var(--lab-ink)]">{entry.label}</span>
                </span>
                <span>{entry.ms}ms</span>
              </li>
            )
          })}
        </ul>
      </div>
    </motion.div>
  )
}

export function WorkflowSection() {
  return (
    <section id="how-we-build" className="lab-page-bg border-b border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mb-10 max-w-3xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
            An agentic delivery pipeline
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
            From intent to execution, our systems route context, invoke models,
            use tools, verify results, and deliver production-ready outputs.
          </p>
        </motion.div>

        <WorkflowCanvas />
      </div>
    </section>
  )
}
