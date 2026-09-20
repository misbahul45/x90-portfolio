import { motion } from "motion/react"
import { ArrowUpRight, MessageSquareText } from "lucide-react"
import { Button } from "#/components/ui/button"
import type { AskLabsContext, AskLabsQuickAction } from "#/hooks/useAskLabs"

export function AskLabsStarters({
  context,
  actions,
  landingQuestion,
  onSelect,
}: {
  context: AskLabsContext
  actions: AskLabsQuickAction[]
  landingQuestion: string
  onSelect: (action: AskLabsQuickAction) => void
}) {
  return (
    <div className="flex flex-col gap-4 py-5">
      <div>
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
          <MessageSquareText className="size-3" aria-hidden />
          Ask Labs
        </p>
        <p className="mt-1 text-base font-semibold leading-snug text-[var(--lab-ink)]">
          {landingQuestion}
        </p>
        <ContextLine context={context} />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

function ContextLine({ context }: { context: AskLabsContext }) {
  const map: Record<AskLabsContext["kind"], string> = {
    home: "Browsing the lab overview.",
    "projects-index": "Browsing the project catalog.",
    project: `On the project page${context.slug ? ` (${context.slug})` : ""}.`,
    "research-index": "Browsing the research catalog.",
    research: `On the research page${context.slug ? ` (${context.slug})` : ""}.`,
    about: "On the about page.",
    contact: "On the contact page.",
    none: "Browsing XNINETZY Labs.",
  }
  return (
    <p className="mt-2 text-xs leading-relaxed text-[var(--lab-ink-soft)]">{map[context.kind]}</p>
  )
}
