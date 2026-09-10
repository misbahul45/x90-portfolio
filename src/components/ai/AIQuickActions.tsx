import { motion } from "motion/react"
import { ArrowUpRight, MessageSquareText } from "lucide-react"
import { Button } from "#/components/ui/button"
import type { AIQuickAction } from "#/hooks/useAIChat"

export function AIQuickActions({
  actions,
  onSelect,
}: {
  actions: AIQuickAction[]
  onSelect: (action: AIQuickAction) => void
}) {
  return (
    <div className="flex flex-col gap-4 py-5">
      <div>
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
          <MessageSquareText className="size-3" aria-hidden />
          prompts
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--lab-ink)]">
          What would you like to explore?
        </p>
        <p className="mt-0.5 text-xs text-[var(--lab-ink-soft)]">
          Pick a prompt or write your own below.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.04 * index }}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="group h-auto w-full justify-between gap-2 whitespace-normal border-[var(--lab-line)] bg-[var(--lab-card)] py-2 text-left text-xs text-[var(--lab-ink)] transition-all hover:border-[var(--lab-orange)]/50 hover:bg-[var(--lab-card-elevated)]"
              onClick={() => onSelect(action)}
            >
              <span>{action.label}</span>
              <ArrowUpRight className="size-3 shrink-0 text-[var(--lab-orange)] opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
