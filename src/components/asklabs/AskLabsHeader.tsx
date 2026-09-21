import { Sparkles } from "lucide-react"
import { Button } from "#/components/ui/button"
import type { AskLabsContext } from "#/hooks/useAskLabs"
import { XninetzyLogo } from "#/components/XninetzyLogo"

function describeContext(context: AskLabsContext): { label: string; slug: string } | null {
  if (context.kind === "project" && context.slug) return { label: "PROJECT", slug: context.slug }
  if (context.kind === "research" && context.slug) return { label: "RESEARCH", slug: context.slug }
  if (context.kind === "projects-index") return { label: "INDEX", slug: "projects" }
  if (context.kind === "research-index") return { label: "INDEX", slug: "research" }
  if (context.kind === "home") return { label: "LAB", slug: "overview" }
  if (context.kind === "about") return { label: "LAB", slug: "about" }
  if (context.kind === "contact") return { label: "CONTACT", slug: "brief" }
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
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-[var(--lab-line)] bg-[var(--lab-bg-soft)] px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)]">
          <XninetzyLogo size={18} variant="mark" />
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-[14px] font-semibold tracking-tight text-[var(--lab-ink)]">Ask Labs</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
            XNINETZY Research Navigator
          </span>
        </div>
        {ctx ? (
          <span className="ml-2 hidden items-center gap-1.5 rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-orange)] sm:inline-flex">
            <span className="text-[var(--lab-ink-soft)]">{ctx.label}</span>
            <span aria-hidden className="text-[var(--lab-line-strong)]">·</span>
            <span className="truncate">{ctx.slug}</span>
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
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] hover:text-[var(--lab-orange)]"
        >
          <Sparkles className="size-3.5" aria-hidden />
          System trace
        </Button>
      </div>
    </header>
  )
}
