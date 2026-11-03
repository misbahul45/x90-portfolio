import { Sparkles } from "lucide-react"
import { Button } from "#/components/ui/button"
import type { AskLabsContext } from "#/hooks/useAskLabs"
import { XninetzyLogo } from "#/components/XninetzyLogo"

function describeContext(context: AskLabsContext): { label: string; slug: string } | null {
  if (context.kind === "project" && context.slug) return { label: "Project", slug: context.slug }
  if (context.kind === "research" && context.slug) return { label: "Research", slug: context.slug }
  if (context.kind === "projects-index") return { label: "Index", slug: "projects" }
  if (context.kind === "research-index") return { label: "Index", slug: "research" }
  if (context.kind === "home") return { label: "Lab", slug: "overview" }
  if (context.kind === "about") return { label: "Lab", slug: "about" }
  if (context.kind === "contact") return { label: "Contact", slug: "brief" }
  return null
}

export function AskLabsHeader({
  context,
  showTrace,
  onToggleTrace,
}: {
  context: AskLabsContext
  showTrace: boolean
  onToggleTrace: () => void
}) {
  const ctx = describeContext(context)
  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-[var(--lab-line)] bg-[var(--lab-bg-soft)] pl-4 pr-14 sm:pl-6 sm:pr-16">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)]">
          <XninetzyLogo size={18} variant="mark" />
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-[14px] font-semibold tracking-tight text-[var(--lab-ink)]">Ask Labs</span>
          <span className="text-xs text-[var(--lab-ink-soft)]">X90 research navigator</span>
        </div>
        {ctx ? (
          <span className="ml-3 hidden min-w-0 items-center gap-1.5 text-sm text-[var(--lab-ink-soft)] sm:inline-flex">
            <span>{ctx.label}</span>
            <span aria-hidden>·</span>
            <span className="truncate text-[var(--lab-ink)]">{ctx.slug}</span>
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleTrace}
          aria-pressed={showTrace}
          className="text-sm text-[var(--lab-ink-soft)] hover:bg-transparent hover:text-[var(--lab-orange)]"
        >
          <Sparkles aria-hidden />
          System trace
        </Button>
      </div>
    </header>
  )
}
