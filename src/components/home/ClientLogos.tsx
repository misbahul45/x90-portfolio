import { useMemo } from "react"
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { CLIENT_LOGOS, type ClientLogo } from "#/lib/domain/clients"

type ClientNodeData = {
  logo: ClientLogo
  index: number
}

type ClientGraphNode = Node<ClientNodeData, "client">

function ClientNode({ data }: NodeProps<ClientGraphNode>) {
  return (
    <div className="group relative w-[190px] overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-card)] px-4 py-4 transition-all duration-500 hover:border-[var(--lab-orange)]/70 hover:bg-[var(--lab-card-elevated)]">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1 !w-1 !border-0 !bg-[var(--lab-orange)]"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1 !w-1 !border-0 !bg-[var(--lab-orange)]"
      />

      <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[var(--lab-orange)] transition-transform duration-500 group-hover:scale-x-100" />

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--lab-orange)]/30 bg-[var(--lab-orange)]/5 font-mono text-[10px] font-bold text-[var(--lab-orange)]">
          {data.logo.initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--lab-ink)]">
            {data.logo.name}
          </p>

          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
            {data.logo.sector}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--lab-line)] pt-3">
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
          Engagement
        </span>

        <span className="font-mono text-[9px] text-[var(--lab-orange)]">
          {String(data.index + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  )
}

function LabNode() {
  return (
    <div className="relative flex h-[118px] w-[210px] flex-col justify-between overflow-hidden border border-[var(--lab-orange)]/50 bg-[var(--lab-card-elevated)] p-5 shadow-[0_0_50px_rgba(246,90,11,0.10)]">
      <Handle
        type="source"
        position={Position.Top}
        className="!h-1 !w-1 !border-0 !bg-[var(--lab-orange)]"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1 !w-1 !border-0 !bg-[var(--lab-orange)]"
      />

      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
          Core
        </span>

        <span className="h-1.5 w-1.5 rounded-full bg-[var(--lab-orange)] shadow-[0_0_12px_var(--lab-orange)]" />
      </div>

      <div>
        <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--lab-ink)]">
          XNINETZY Labs
        </p>

        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
          Build · Learn · Research
        </p>
      </div>
    </div>
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
}: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          ...style,
          stroke: "var(--lab-line)",
          strokeWidth: 1,
        }}
      />

      <path
        d={path}
        fill="none"
        stroke="var(--lab-orange)"
        strokeWidth="1.5"
        strokeDasharray="4 10"
        strokeLinecap="round"
        pathLength={1}
        className="client-signal"
      />

      <EdgeLabelRenderer>
        <div
          className="pointer-events-none absolute font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          build
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export function ClientLogos() {
  const nodes = useMemo<ClientGraphNode[]>(() => {
    const count = CLIENT_LOGOS.length
    const radius = Math.max(300, Math.min(420, 120 + count * 48))

    return CLIENT_LOGOS.map((logo, index) => {
      const angle =
        -Math.PI / 2 + (index / Math.max(count, 1)) * Math.PI * 2

      return {
        id: `client-${logo.id}`,
        type: "client",
        position: {
          x: Math.cos(angle) * radius + 500,
          y: Math.sin(angle) * radius + 230,
        },
        data: {
          logo,
          index,
        },
      }
    })
  }, [])

  const centerNode = useMemo<Node>(
    () => ({
      id: "xninetzy-core",
      type: "lab",
      position: { x: 395, y: 172 },
      data: {},
    }),
    [],
  )

  const edges = useMemo<Edge[]>(
    () =>
      CLIENT_LOGOS.map((logo) => ({
        id: `edge-${logo.id}`,
        source: "xninetzy-core",
        target: `client-${logo.id}`,
        type: "signal",
      })),
    [],
  )

  const allNodes = useMemo(
    () => [centerNode, ...nodes],
    [centerNode, nodes],
  )

  return (
    <section className="lab-page-bg relative overflow-hidden border-b border-[var(--lab-line)] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-5 border-l border-[var(--lab-orange)] pl-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
              Selected work
            </p>

            <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-[-0.03em] text-[var(--lab-ink)] sm:text-3xl">
              Real problems feed the lab.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--lab-ink-soft)]">
              Every system we build becomes another source of engineering
              experience, product insight, and research context.
            </p>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
            {CLIENT_LOGOS.length} organizations
          </div>
        </div>

        <div className="relative h-[540px] overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-bg)] sm:h-[620px]">
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_38%,var(--lab-bg)_100%)] opacity-70" />

          <ReactFlow
            nodes={allNodes}
            edges={edges}
            nodeTypes={{
              client: ClientNode,
              lab: LabNode,
            }}
            edgeTypes={{
              signal: SignalEdge,
            }}
            fitView
            fitViewOptions={{
              padding: 0.18,
              minZoom: 0.55,
              maxZoom: 1.05,
            }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              gap={28}
              size={1}
              color="var(--lab-line)"
              style={{ opacity: 0.35 }}
            />
          </ReactFlow>

          <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-3 font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            <span className="h-px w-6 bg-[var(--lab-orange)]" />
            Active engineering network
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[var(--lab-line)] pt-6 sm:flex-row sm:items-center">
          <p className="max-w-xl text-sm leading-6 text-[var(--lab-ink-soft)]">
            Build products today. Learn from them. Turn that knowledge into
            better systems, better experiments, and eventually a stronger
            research lab.
          </p>

          <p className="shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            Build → Learn → Research → Evolve
          </p>
        </div>
      </div>

      <style>{`
        @keyframes client-signal {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -28;
          }
        }

        .client-signal {
          animation: client-signal 6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .client-signal {
            animation: none;
          }
        }

        .react-flow__attribution {
          display: none;
        }

        .react-flow__pane {
          cursor: default !important;
        }
      `}</style>
    </section>
  )
}