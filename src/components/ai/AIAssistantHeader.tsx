import { Sparkles } from "lucide-react"
import { XninetzyLogo } from "#/components/XninetzyLogo"

export function AIAssistantHeader() {
  return (
    <header className="relative overflow-hidden border-b border-[var(--lab-line)] bg-[var(--lab-bg-soft)] px-5 py-4 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(246,90,11,0.45), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(246,90,11,0.45) 50%, transparent 100%)",
        }}
      />

      <div className="relative flex items-center gap-3 pr-10">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] ring-1 ring-[var(--lab-orange)]/40">
          <XninetzyLogo size={26} variant="mark" className="drop-shadow-[0_0_6px_rgba(246,90,11,0.5)]" />
          <span className="absolute -right-0.5 -top-0.5 inline-flex size-2.5 rounded-full bg-[var(--lab-orange)] ring-2 ring-[var(--lab-bg-soft)]">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--lab-orange)] opacity-60" />
          </span>
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--lab-ink)]">
            XNINETZY Labs
            <Sparkles className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
            Research Assistant
          </span>
        </div>
      </div>
    </header>
  )
}
