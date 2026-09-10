import { useMemo } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  Brain,
  CheckCircle2,
  Circle,
  Database,
  Eye,
  Loader2,
  type LucideIcon,
  MessageSquare,
  Wrench,
} from "lucide-react"
import type { AIExecutionStage } from "#/hooks/useAIChat"

type StageMeta = {
  id: AIExecutionStage
  label: string
  icon: LucideIcon
}

const STAGE_PIPELINE: ReadonlyArray<StageMeta> = [
  { id: "analyzing", label: "Intent", icon: MessageSquare },
  { id: "retrieving", label: "Retrieve", icon: Database },
  { id: "reasoning", label: "Reason", icon: Brain },
  { id: "responding", label: "Act", icon: Wrench },
  { id: "completed", label: "Audit", icon: Eye },
]

const STAGE_INDEX: Record<AIExecutionStage, number> = {
  idle: -1,
  analyzing: 0,
  retrieving: 1,
  reasoning: 2,
  responding: 3,
  completed: 4,
}

const STAGE_LABELS: Record<AIExecutionStage, string> = {
  idle: "",
  analyzing: "Classifying intent",
  retrieving: "Retrieving context",
  reasoning: "Reasoning over docs",
  responding: "Drafting reply",
  completed: "Audited & delivered",
}

export function AIExecutionState({ stage }: { stage: AIExecutionStage }) {
  const stageIdx = useMemo(() => STAGE_INDEX[stage], [stage])

  return (
    <ol className="flex flex-col gap-2">
      {STAGE_PIPELINE.map((meta, index) => {
        const isCompleted = index < stageIdx
        const isActive = index === stageIdx
        const Icon = meta.icon
        return (
          <li
            key={meta.id}
            className="flex items-center gap-3 border-b border-[var(--lab-line)] pb-2 last:border-b-0 last:pb-0"
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-md border ${
                isActive
                  ? "border-[var(--lab-orange)] bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]"
                  : isCompleted
                    ? "border-[var(--lab-orange-glow)] bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]"
                    : "border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink-soft)]"
              }`}
            >
              {isActive ? (
                <Loader2 className="size-3 animate-spin" aria-hidden />
              ) : isCompleted ? (
                <CheckCircle2 className="size-3" aria-hidden />
              ) : (
                <Circle className="size-2.5" aria-hidden />
              )}
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <Icon className="size-3 shrink-0 text-[var(--lab-ink-soft)]" aria-hidden />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
                  {meta.label}
                </span>
              </div>
              {isActive && (
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
                  running
                </span>
              )}
              {isCompleted && (
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/70">
                  done
                </span>
              )}
            </div>
          </li>
        )
      })}
      <AnimatePresence mode="wait">
        {stage !== "idle" && (
          <motion.li
            key={stage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-3 border-t border-[var(--lab-line)] pt-3 font-mono text-[10.5px] uppercase tracking-[0.16em]"
          >
            <span className="text-[var(--lab-orange)]">
              step {Math.max(stageIdx + 1, 1)}/{STAGE_PIPELINE.length}
            </span>
            <span className="mx-1.5 text-[var(--lab-line-strong)]">·</span>
            <span className="text-[var(--lab-ink-soft)] normal-case tracking-normal">
              {STAGE_LABELS[stage]}
            </span>
          </motion.li>
        )}
      </AnimatePresence>
    </ol>
  )
}
