import { motion } from "motion/react"
import { ArchitectureGraph } from "#/components/home/ArchitectureGraph"
import { fadeInUp, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

const STACK: Array<{ layer: string; items: string[] }> = [
  {
    layer: "Clients",
    items: ["Web", "Mobile", "API"],
  },
  {
    layer: "Application",
    items: ["Dashboard", "Workflow", "Auth"],
  },
  {
    layer: "Intelligence",
    items: ["Agents", "ML", "LLMs", "RAG"],
  },
  {
    layer: "Data",
    items: ["Postgres", "pgvector", "Cache"],
  },
  {
    layer: "Infrastructure",
    items: ["Docker", "CI/CD", "Cloud", "Observability"],
  },
]

export function ArchitectureShowcase() {
  return (
    <section id="architecture" className="lab-page-bg border-b border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mb-10 max-w-3xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
            Production system, end to end
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
            The agent runtime, the application surface, the data layer, and the
            infrastructure we ship on. This is how we actually build.
          </p>
        </motion.div>

        <ArchitectureGraph />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mt-8 grid gap-px bg-[var(--lab-line)] sm:grid-cols-2 lg:grid-cols-5"
        >
          {STACK.map((row) => (
            <div
              key={row.layer}
              className="bg-[var(--lab-bg)] px-5 py-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
                {row.layer}
              </p>
              <p className="mt-2 text-sm text-[var(--lab-ink)]">
                {row.items.join(" · ")}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
