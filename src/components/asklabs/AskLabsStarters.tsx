import { ArrowUpRight, MessageSquareText } from "lucide-react"
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
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--lab-ink-soft)]">
        <MessageSquareText className="size-4 text-[var(--lab-orange)]" aria-hidden />
        Ask Labs
      </div>
      <h2 className="max-w-[40rem] text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--lab-ink)] sm:text-[34px]">
        {landingQuestion}
      </h2>
      <ContextLine context={context} />
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              onClick={() => onSelect(action)}
              className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)] px-4 py-3 text-left text-[15px] leading-relaxed text-[var(--lab-ink)] transition-colors hover:border-[var(--lab-orange)] hover:bg-[var(--lab-orange-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lab-bg)]"
            >
              <span>{action.label}</span>
              <ArrowUpRight
                className="size-4 shrink-0 text-[var(--lab-ink-soft)] transition-colors group-hover:text-[var(--lab-orange)]"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContextLine({ context }: { context: AskLabsContext }) {
  const map: Record<AskLabsContext["kind"], string> = {
    home: "Browsing the lab overview.",
    "projects-index": "Browsing the project catalog.",
    project: `Reading ${context.slug ?? "a project"}.`,
    "research-index": "Browsing the research catalog.",
    research: `Reading ${context.slug ?? "research"}.`,
    about: "On the about page.",
    contact: "On the contact page.",
    none: "Browsing X90 Labs.",
  }
  return (
    <p className="text-sm leading-relaxed text-[var(--lab-ink-soft)]">{map[context.kind]}</p>
  )
}
