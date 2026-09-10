import { motion } from "motion/react"

const STAGES: ReadonlyArray<{ index: string; label: string }> = [
  { index: "01", label: "Brief" },
  { index: "02", label: "Scope" },
  { index: "03", label: "Build" },
  { index: "04", label: "Ship" },
]

export function WorkflowRail() {
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em]">
      {STAGES.map((stage, idx) => (
        <div key={stage.index} className="flex items-center gap-2.5">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06 }}
            className="flex items-center gap-1.5"
          >
            <span className="font-mono text-[11px] font-semibold text-white/70">
              {stage.index}
            </span>
            <span className="text-white/90">{stage.label}</span>
          </motion.div>
          {idx < STAGES.length - 1 && (
            <span
              aria-hidden
              className="h-px w-10 bg-gradient-to-r from-white/60 via-white/30 to-transparent"
            />
          )}
        </div>
      ))}
    </div>
  )
}
