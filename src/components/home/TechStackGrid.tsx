import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { TECH_STACK } from "#/lib/domain/services"

export function TechStackGrid() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="dm-section border-t border-[var(--lab-line)]"
    >
      <div className="dm-shell">
        <Reveal>
          <SectionHeader
            headingId="stack-heading"
            title="Production-grade by default"
            description="The same foundations across products, experiments and research."
          />
        </Reveal>

        <Reveal className="mt-12">
          <dl className="grid gap-px overflow-hidden rounded-3xl border border-[var(--lab-line)] bg-[var(--lab-line)] sm:grid-cols-2 lg:grid-cols-3">
            {TECH_STACK.map((group) => (
              <div key={group.group} className="bg-[var(--lab-bg)] p-7">
                <dt className="text-xl font-medium tracking-tight text-[var(--lab-ink)]">
                  {group.group}
                </dt>
                <dd className="mt-3 font-mono text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                  {group.items.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
