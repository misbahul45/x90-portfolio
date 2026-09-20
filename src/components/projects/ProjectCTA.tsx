import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "#/components/ui/button"

type CTAProps = {
  eyebrow?: string
  title?: string
  body?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export function ProjectCTA({
  eyebrow = "Continue",
  title = "Have a similar system worth building?",
  body = "We work in the same loop: identify the real problem, build something concrete, learn from operating it. If that fits your situation, send us a brief.",
  primaryHref = "/#contact",
  primaryLabel = "Start a brief",
  secondaryHref = "/research",
  secondaryLabel = "See how we think",
}: CTAProps) {
  return (
    <section className="border-t border-[var(--lab-line)] bg-[var(--lab-bg)] py-16">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <div className="research-card-surface mx-auto max-w-3xl p-8 sm:p-10">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
            <Sparkles className="size-3.5" aria-hidden />
            {eyebrow}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
            {body}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild className="font-mono">
              <a href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="size-3.5" aria-hidden />
              </a>
            </Button>
            <Button asChild variant="outline" className="font-mono">
              <a href={secondaryHref}>{secondaryLabel}</a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="font-mono"
              onClick={() => document.dispatchEvent(new CustomEvent("ask-labs:open"))}
            >
              <Sparkles className="size-3.5" aria-hidden />
              Ask Labs about this
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
