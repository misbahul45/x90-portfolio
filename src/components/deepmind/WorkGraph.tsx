import { useMemo, useRef, useState } from "react"
import {
  Background,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useGSAP } from "@gsap/react"
import { FilterTabs } from "#/components/deepmind/FilterTabs"
import { PacketEdge, type PacketEdgeType } from "#/components/deepmind/PacketEdge"
import { useMediaQuery } from "#/hooks/useMediaQuery"
import { gsap, prefersReducedMotion, registerGsap } from "#/lib/gsap"
import {
  buildFocusGraph,
  pickFocusSlideIndex,
  sharedTechCounts,
  type FocusGraph,
  type FocusNodeKind,
  type GraphOrientation,
} from "#/lib/domain/work-graph"
import type { WorkSlide } from "#/lib/domain/work-slides"
import { cn } from "#/lib/utils"

type FocusNodeData = {
  label: string
  orientation: GraphOrientation
  sharedWith: number
}

type FocusFlowNode = Node<FocusNodeData, FocusNodeKind>

const hiddenHandle = "!size-1 !min-h-0 !min-w-0 !border-0 !bg-transparent"

function targetPosition(orientation: GraphOrientation): Position {
  return orientation === "horizontal" ? Position.Left : Position.Top
}

function sourcePosition(orientation: GraphOrientation): Position {
  return orientation === "horizontal" ? Position.Right : Position.Bottom
}

function ResearchNode({ data }: NodeProps<FocusFlowNode>) {
  return (
    <div
      data-flow-node
      className={cn(
        "rounded-2xl border border-[var(--lab-line-strong)] bg-[var(--lab-card)] px-4 py-3 text-left",
        data.orientation === "horizontal" ? "w-[230px]" : "w-[156px]",
      )}
    >
      <p className="text-xs text-[var(--lab-ink-soft)]">Research</p>
      <p className="mt-1 line-clamp-3 text-[14px] font-medium leading-snug text-[var(--lab-ink)]">{data.label}</p>
      <Handle type="source" position={sourcePosition(data.orientation)} isConnectable={false} className={hiddenHandle} />
    </div>
  )
}

function ProjectNode({ data }: NodeProps<FocusFlowNode>) {
  return (
    <div
      data-flow-node
      className={cn(
        "rounded-2xl border-2 border-[var(--lab-orange)] bg-[var(--lab-card-elevated)] px-5 py-4 text-left",
        data.orientation === "horizontal" ? "w-[260px]" : "w-[240px]",
      )}
    >
      <Handle type="target" position={targetPosition(data.orientation)} isConnectable={false} className={hiddenHandle} />
      <p className="text-xs text-[var(--lab-ink-soft)]">System</p>
      <p className="mt-1 text-lg font-medium leading-snug text-[var(--lab-ink)]">{data.label}</p>
      <Handle type="source" position={sourcePosition(data.orientation)} isConnectable={false} className={hiddenHandle} />
    </div>
  )
}

function TechNode({ data }: NodeProps<FocusFlowNode>) {
  return (
    <div
      data-flow-node
      className={cn(
        "rounded-2xl border border-[var(--lab-line-strong)] bg-[var(--lab-card)] px-4 py-2.5 text-left",
        data.orientation === "horizontal" ? "w-[190px]" : "w-[156px]",
      )}
    >
      <Handle type="target" position={targetPosition(data.orientation)} isConnectable={false} className={hiddenHandle} />
      <p className="truncate font-mono text-[13px] text-[var(--lab-ink)]">{data.label}</p>
      {data.sharedWith > 0 ? (
        <p className="mt-0.5 text-xs text-[var(--lab-ink-soft)]">
          Also in {data.sharedWith} other {data.sharedWith === 1 ? "system" : "systems"}
        </p>
      ) : null}
    </div>
  )
}

const nodeTypes = { research: ResearchNode, project: ProjectNode, tech: TechNode }
const edgeTypes = { packet: PacketEdge }

const EDGE_STYLE = { stroke: "var(--lab-ink-soft)", strokeWidth: 1.5, opacity: 0.75 }
const STACK_PACKET_DELAY = 1

type FocusCanvasProps = {
  graph: FocusGraph
  orientation: GraphOrientation
}

function FocusCanvas({ graph, orientation }: FocusCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  const nodes = useMemo<FocusFlowNode[]>(
    () =>
      graph.nodes.map((node) => ({
        id: node.id,
        type: node.kind,
        position: { x: node.x, y: node.y },
        draggable: false,
        selectable: false,
        connectable: false,
        data: { label: node.label, orientation, sharedWith: node.sharedWith },
      })),
    [graph, orientation],
  )

  const edges = useMemo<PacketEdgeType[]>(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "packet",
        focusable: false,
        style: EDGE_STYLE,
        data: { active: true, duration: 1.4, delay: edge.kind === "stack" ? STACK_PACKET_DELAY : 0 },
      })),
    [graph],
  )

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || !ready || prefersReducedMotion()) return
      registerGsap()

      gsap.fromTo(
        root,
        { y: 56, opacity: 0.35 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 100%", end: "top 62%", scrub: true },
        },
      )

      gsap.delayedCall(0.06, () => {
        const flowNodes = gsap.utils.toArray<HTMLElement>("[data-flow-node]", root)
        const paths = gsap.utils.toArray<SVGPathElement>("[data-flow-path]", root)
        gsap.set(flowNodes, { opacity: 0, scale: 0.9, y: 14 })
        paths.forEach((path) => {
          const length = path.getTotalLength()
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        })
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: root, start: "top 82%", once: true },
        })
        timeline.to(flowNodes, { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" })
        paths.forEach((path, index) => {
          timeline.to(
            path,
            {
              strokeDashoffset: 0,
              duration: 0.9,
              ease: "power2.inOut",
              clearProps: "strokeDasharray,strokeDashoffset",
            },
            0.25 + index * 0.06,
          )
        })
      })
    },
    { scope: rootRef, dependencies: [ready, graph] },
  )

  return (
    <div
      ref={rootRef}
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-[var(--lab-line)] bg-[var(--lab-bg-soft)]",
        orientation === "horizontal" ? "h-[460px]" : "h-[620px]",
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        onInit={() => setReady(true)}
        fitViewOptions={{ padding: 0.12 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
        panOnScroll={false}
        preventScrolling={false}
        minZoom={0.3}
        maxZoom={1.15}
      >
        <Background gap={24} size={1} color="var(--lab-line)" />
      </ReactFlow>
    </div>
  )
}

type WorkGraphProps = {
  slides: ReadonlyArray<WorkSlide>
  activeIndex: number
  onSelect: (index: number) => void
  className?: string
}

export function WorkGraph({ slides, activeIndex, onSelect, className }: WorkGraphProps) {
  const wide = useMediaQuery("(min-width: 768px)", true)
  const orientation: GraphOrientation = wide ? "horizontal" : "vertical"
  const lastContentRef = useRef(0)
  const focusIndex = pickFocusSlideIndex(slides, activeIndex, lastContentRef.current)
  lastContentRef.current = focusIndex
  const focusSlide = slides[focusIndex]
  const usage = useMemo(() => sharedTechCounts(slides), [slides])
  const graph = useMemo(
    () => (focusSlide ? buildFocusGraph(focusSlide, orientation, usage) : null),
    [focusSlide, orientation, usage],
  )
  const options = useMemo(
    () =>
      slides
        .map((slide, index) => ({ slide, index }))
        .filter(({ slide }) => slide.kind !== "more")
        .map(({ slide }) => ({ value: slide.id, label: slide.title })),
    [slides],
  )

  if (!focusSlide || !graph) return null

  return (
    <div className={cn("space-y-6", className)}>
      <FilterTabs
        label="Choose a system to follow"
        options={options}
        value={focusSlide.id}
        onChange={(id) => {
          const index = slides.findIndex((slide) => slide.id === id)
          if (index >= 0) onSelect(index)
        }}
      />
      <ReactFlowProvider key={`${focusSlide.id}:${orientation}`}>
        <FocusCanvas graph={graph} orientation={orientation} />
      </ReactFlowProvider>
    </div>
  )
}
