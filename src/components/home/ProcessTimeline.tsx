import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { PROCESS_STEPS } from "#/lib/domain/services"

export function ProcessTimeline() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="dm-section border-t border-[var(--lab-line)]"
    >
      <div className="dm-shell">
        <Reveal>
          <SectionHeader
            headingId="process-heading"
            title="From brief to shipped product"
            description="Scope is explicit, work is visible and shipping is part of the process."
          />
        </Reveal>

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.index} className="border-t border-[var(--lab-line-strong)] pt-6">
              <Reveal delay={index * 0.08}>
                <p className="font-mono text-4xl tabular-nums leading-none text-[var(--lab-orange)]">
                  {step.index}
                </p>
                <h3 className="mt-6 text-2xl font-medium tracking-tight text-[var(--lab-ink)]">
                  {step.title}
                </h3>
                <p className="dm-body mt-3">{step.description}</p>
                <p className="mt-5 text-sm text-[var(--lab-ink)]">{step.duration}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
