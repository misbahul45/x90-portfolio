import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { Check, Loader2, Plus } from "lucide-react"
import { motion } from "motion/react"
import type { ReactNode } from "react"
import { cn } from "#/lib/utils"

export type BriefNodeStatus = "upcoming" | "active" | "completed"

export type BriefNodeData = {
  index: string
  title: string
  prompt: string
  hint: string
  status: BriefNodeStatus
  render: ReactNode
}

const STATUS_STYLES: Record<BriefNodeStatus, string> = {
  upcoming:
    "border-slate-200/80 bg-white/85 text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.04)]",
  active:
    "border-orange-500/60 bg-white text-slate-900 shadow-[0_18px_48px_-12px_rgba(246,90,10,0.32)] ring-1 ring-orange-500/15",
  completed:
    "border-[rgba(246,90,11,0.45)] bg-white text-slate-900 shadow-[0_8px_24px_-8px_rgba(246,90,11,0.18)]",
}

export function BriefNode({ data }: NodeProps<Node<BriefNodeData>>) {
  const isActive = data.status === "active"
  const isCompleted = data.status === "completed"

  return (
    <motion.div
      initial={false}
      animate={{
        scale: isActive ? 1.01 : 1,
        opacity: data.status === "upcoming" ? 0.62 : 1,
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "min-w-[280px] max-w-[320px] rounded-2xl border p-5 transition-colors duration-300",
        STATUS_STYLES[data.status],
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-0 !bg-orange-500/40"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em]">
          <Plus className="size-3 text-orange-500" aria-hidden />
          <span className="text-orange-500">{data.index}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">{data.title}</span>
        </div>
        {isCompleted && (
          <span className="flex size-5 items-center justify-center rounded-full bg-orange-500/15 text-[#D94D08]">
            <Check className="size-3" aria-hidden />
          </span>
        )}
        {isActive && (
          <span className="flex size-5 items-center justify-center rounded-full bg-orange-500/12 text-orange-500">
            <Loader2 className="size-3 animate-spin" aria-hidden />
          </span>
        )}
      </div>
      <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-tight">
        {data.prompt}
      </h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{data.hint}</p>
      <div className="mt-4">{data.render}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-0 !bg-orange-500/40"
      />
    </motion.div>
  )
}
