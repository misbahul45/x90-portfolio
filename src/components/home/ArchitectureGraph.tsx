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
  ArrowRight,
  Brain,
  CheckCircle2,
  Circle,
  Cpu,
  Database,
  Loader2,
  MemoryStick,
  MessageSquare,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { cn } from "#/lib/utils"

type NodeState = "idle" | "running" | "completed"

type AgentNodeData = {
  label: string
  state: NodeState
  detail: string
  icon: LucideIcon
}

const STATE_STYLES: Record<NodeState, { border: string; accent: string }> = {
  idle: {
    border: "border-[var(--lab-line)]",
    accent: "text-[var(--lab-ink-soft)]/60",
  },
  running: {
    border: "border-[var(--lab-orange)]",
    accent: "text-[var(--lab-orange)]",
  },
  completed: {
    border: "border-white/30",
    accent: "text-[var(--lab-ink)]",
  },
}

function StateIcon({ state }: { state: NodeState }) {
  if (state === "completed") return <CheckCircle2 className="size-3.5 text-[var(--lab-ink)]" />
  if (state === "running") return <Loader2 className="size-3.5 animate-spin text-[var(--lab-orange)]" />
  return <Circle className="size-3.5 text-[var(--lab-ink-soft)]/60" />
}

function AgentNode({ data }: NodeProps<Node<AgentNodeData>>) {
  const styles = STATE_STYLES[data.state]
  const Icon = data.icon
  return (
    <div
      className={cn(
        "min-w-[150px] rounded-md border bg-[var(--lab-card)] px-3 py-2.5 transition-all",
        styles.border,
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
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
        position={Position.Right}
        className="!h-1.5 !w-1.5 !bg-[var(--lab-orange)] !border-0"
      />
    </div>
  )
}

const nodeTypes = { agent: AgentNode }

const EXECUTION_LOG: Array<{ name: string; ms: number }> = [
  { name: "Planner", ms: 84 },
  { name: "Retriever", ms: 152 },
  { name: "Tool call", ms: 220 },
  { name: "Reasoner", ms: 0 },
]

type AgentSeed = Omit<AgentNodeData, "state"> & {
  id: string
  x: number
  y: number
}

const NODES_DATA: AgentSeed[] = [
  { id: "input", x: 0, y: 60, icon: MessageSquare, label: "Input", detail: "user query" },
  { id: "planner", x: 180, y: 60, icon: Brain, label: "Planner", detail: "decompose" },
  { id: "rag", x: 360, y: -40, icon: Database, label: "RAG", detail: "5 passages" },
  { id: "tools", x: 360, y: 60, icon: Wrench, label: "Tools", detail: "code_exec" },
  { id: "memory", x: 360, y: 160, icon: MemoryStick, label: "Memory", detail: "episodic" },
  { id: "reasoner", x: 560, y: 60, icon: Cpu, label: "Reasoner", detail: "queued" },
  { id: "output", x: 740, y: 60, icon: ArrowRight, label: "Output", detail: "awaiting" },
]

const EDGE_LIST: Array<{ id: string; from: string; to: string }> = [
  { id: "e1", from: "input", to: "planner" },
  { id: "e2", from: "planner", to: "rag" },
  { id: "e3", from: "planner", to: "tools" },
  { id: "e4", from: "planner", to: "memory" },
  { id: "e5", from: "rag", to: "reasoner" },
  { id: "e6", from: "tools", to: "reasoner" },
  { id: "e7", from: "memory", to: "reasoner" },
  { id: "e8", from: "reasoner", to: "output" },
]

const ACTIVE_SEQUENCE = ["input", "planner", "rag", "tools", "memory", "reasoner", "output"]

const VERTICAL_SEQUENCE = [
  "input",
  "planner",
  "rag",
  "tools",
  "memory",
  "reasoner",
  "output",
]

const VERTICAL_LABELS: Record<string, string> = {
  input: "Input · user query",
  planner: "Planner · decompose",
  rag: "RAG · 5 passages",
  tools: "Tools · code_exec",
  memory: "Memory · episodic",
  reasoner: "Reasoner · queued",
  output: "Output · awaiting",
}

const LOOP_INTERVAL_MS = 1500

function computeState(activeIndex: number, id: string): NodeState {
  const pos = ACTIVE_SEQUENCE.indexOf(id)
  if (pos === -1) return "idle"
  if (pos < activeIndex) return "completed"
  if (pos === activeIndex) return "running"
  return "idle"
}

export function ArchitectureGraph() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((prev) => (prev + 1) % (ACTIVE_SEQUENCE.length + 1))
    }, LOOP_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  const nodes = useMemo<Node<AgentNodeData>[]>(
    () =>
      NODES_DATA.map((node) => ({
        id: node.id,
        type: "agent",
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

  const logTick = Math.min(tick, EXECUTION_LOG.length - 1)
  const totalMs = EXECUTION_LOG.slice(0, logTick + 1).reduce((acc, e) => acc + e.ms, 0)

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
          <Brain className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
          xninetzy-labs / agent-runtime
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
        <div className="h-[360px]">
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
            defaultEdgeOptions={{
              style: { stroke: "var(--lab-orange)", strokeWidth: 1.5, opacity: 0.7 },
            }}
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
            const node = NODES_DATA.find((n) => n.id === id)
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
          Execution log
        </p>
        <ul className="mt-3 divide-y divide-[var(--lab-line)]">
          {EXECUTION_LOG.map((step, index) => {
            const state: NodeState =
              index < tick ? "completed" : index === tick ? "running" : "idle"
            return (
              <li
                key={step.name}
                className="flex items-center justify-between gap-3 py-2 text-xs"
              >
                <span className="flex items-center gap-2">
                  <StateIcon state={state} />
                  <span className="font-medium text-[var(--lab-ink)]">{step.name}</span>
                </span>
                <span className="font-mono text-[var(--lab-ink-soft)]">
                  {step.ms > 0 ? `${step.ms}ms` : "—"}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </motion.div>
  )
}
