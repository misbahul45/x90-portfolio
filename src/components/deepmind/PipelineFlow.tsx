import { useEffect, useMemo, useState } from "react"
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
import { Pause, Play } from "lucide-react"
import { PacketEdge, type PacketEdgeType } from "#/components/deepmind/PacketEdge"
import { Button } from "#/components/ui/button"
import { useMediaQuery } from "#/hooks/useMediaQuery"
import { prefersReducedMotion } from "#/lib/gsap"
import {
  layoutPipeline,
  nextStageIndex,
  stageStatus,
  type Pipeline,
  type PipelineOrientation,
  type StageStatus,
} from "#/lib/domain/pipelines"
import { cn } from "#/lib/utils"

const ADVANCE_MS = 2400

type StageNodeData = {
  index: string
  title: string
  detail: string
  status: StageStatus
  failed: boolean
  orientation: PipelineOrientation
  stageIndex: number
}

type StageNode = Node<StageNodeData, "stage">

const hiddenHandle = "!size-1 !min-h-0 !min-w-0 !border-0 !bg-transparent"

function StageNodeView({ data }: NodeProps<StageNode>) {
  const horizontal = data.orientation === "horizontal"
  return (
    <div
      className={cn(
        "w-[200px] cursor-pointer border bg-[var(--lab-card)] p-4 text-left transition-[border-color,opacity] duration-300",
        data.status === "active" && !data.failed && "border-[var(--lab-orange)]",
        data.status === "active" && data.failed && "border-destructive",
        data.status === "done" && "border-[var(--lab-line-strong)]",
        data.status === "upcoming" && "border-[var(--lab-line)] opacity-60",
      )}
    >
      <Handle
        type="target"
        position={horizontal ? Position.Left : Position.Top}
        isConnectable={false}
        className={hiddenHandle}
      />
      <p
        className={cn(
          "font-mono text-2xl tabular-nums leading-none",
          data.status === "active" && !data.failed && "text-[var(--lab-orange)]",
          data.status === "active" && data.failed && "text-destructive",
          data.status !== "active" && "text-[var(--lab-ink-soft)]",
        )}
      >
        {data.index}
      </p>
      <p className="mt-3 text-[17px] font-medium leading-tight text-[var(--lab-ink)]">{data.title}</p>
      <p className="mt-1.5 text-[13px] leading-snug text-[var(--lab-ink-soft)]">{data.detail}</p>
      <Handle
        type="source"
        position={horizontal ? Position.Right : Position.Bottom}
        isConnectable={false}
        className={hiddenHandle}
      />
    </div>
  )
}

const nodeTypes = { stage: StageNodeView }
const edgeTypes = { packet: PacketEdge }

type PipelineCanvasProps = {
  pipeline: Pipeline
  className?: string
  value?: number
  onValueChange?: (index: number) => void
  failed?: boolean
}

function PipelineCanvas({ pipeline, className, value, onValueChange, failed = false }: PipelineCanvasProps) {
  const wide = useMediaQuery("(min-width: 1024px)", true)
  const orientation: PipelineOrientation = wide ? "horizontal" : "vertical"
  const stageCount = pipeline.stages.length
  const controlled = value !== undefined
  const [internalIndex, setInternalIndex] = useState(0)
  const [playing, setPlaying] = useState(!controlled)
  const activeIndex = controlled ? value : internalIndex

  useEffect(() => {
    if (prefersReducedMotion()) setPlaying(false)
  }, [])

  const selectStage = (index: number): void => {
    if (controlled) {
      onValueChange?.(index)
      return
    }
    setPlaying(false)
    setInternalIndex(index)
  }

  useEffect(() => {
    if (!playing || controlled) return
    const timer = window.setInterval(() => {
      setInternalIndex((current) => nextStageIndex(current, stageCount))
    }, ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [playing, controlled, stageCount])

  const positions = useMemo(() => layoutPipeline(stageCount, orientation), [stageCount, orientation])

  const nodes = useMemo<StageNode[]>(
    () =>
      pipeline.stages.map((stage, index) => ({
        id: stage.id,
        type: "stage",
        position: positions[index] ?? { x: 0, y: 0 },
        draggable: false,
        selectable: false,
        connectable: false,
        data: {
          index: String(index + 1).padStart(2, "0"),
          title: stage.title,
          detail: stage.detail,
          status: stageStatus(index, activeIndex),
          failed: failed && index === activeIndex,
          orientation,
          stageIndex: index,
        },
      })),
    [pipeline, positions, activeIndex, orientation, failed],
  )

  const edges = useMemo<PacketEdgeType[]>(
    () =>
      pipeline.stages.slice(1).map((stage, offset) => {
        const index = offset + 1
        const reached = index <= activeIndex
        const current = index === activeIndex
        return {
          id: `${pipeline.stages[offset].id}-${stage.id}`,
          source: pipeline.stages[offset].id,
          target: stage.id,
          type: "packet",
          data: { active: current },
          focusable: false,
          style: {
            stroke: current
              ? "var(--lab-orange)"
              : reached
                ? "var(--lab-ink-soft)"
                : "var(--lab-line-strong)",
            strokeWidth: current ? 1.75 : 1.25,
          },
        }
      }),
    [pipeline, activeIndex],
  )

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-[1.5rem] border border-[var(--lab-line)] bg-[var(--lab-bg-soft)]",
          wide ? "h-[280px]" : "h-[780px]",
        )}
      >
        <ReactFlow
          key={orientation}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
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
          minZoom={0.2}
          maxZoom={1.2}
          onNodeClick={(_event, node) => selectStage((node as StageNode).data.stageIndex)}
        >
          <Background gap={24} size={1} color="var(--lab-line)" />
        </ReactFlow>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--lab-ink-soft)]" aria-live="polite">
          Stage {activeIndex + 1} of {stageCount}: {pipeline.stages[activeIndex]?.title}
        </p>
        {controlled ? null : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPlaying((current) => !current)}
            aria-label={playing ? "Pause pipeline animation" : "Play pipeline animation"}
            className="size-10 rounded-full border-[var(--lab-line-strong)] bg-transparent text-[var(--lab-ink)] shadow-none hover:border-[var(--lab-orange)] hover:bg-[var(--lab-orange-soft)] hover:text-[var(--lab-orange)]"
          >
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
          </Button>
        )}
      </div>
    </div>
  )
}

export function PipelineFlow(props: PipelineCanvasProps) {
  return (
    <ReactFlowProvider>
      <PipelineCanvas {...props} />
    </ReactFlowProvider>
  )
}
