import { motion } from "motion/react"
import { ArchitectureGraph } from "#/components/home/ArchitectureGraph"
import { fadeInUp, staggerContainer, staggerItem, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

const STACK: Array<{
  layer: string
  index: string
  items: string[]
  description: string
}> = [
  {
    layer: "Clients",
    index: "01",
    items: ["Web", "Mobile", "API"],
    description: "Interfaces where users and external systems enter the product.",
  },
  {
    layer: "Application",
    index: "02",
    items: ["Dashboard", "Workflow", "Auth"],
    description: "Product logic, orchestration, permissions, and operational flows.",
  },
  {
    layer: "Intelligence",
    index: "03",
    items: ["Agents", "ML", "LLMs", "RAG"],
    description: "Reasoning, retrieval, prediction, and tool-using intelligence.",
  },
  {
    layer: "Data",
    index: "04",
    items: ["Postgres", "pgvector", "Cache"],
    description: "Structured state, semantic retrieval, persistence, and fast access.",
  },
  {
    layer: "Infrastructure",
    index: "05",
    items: ["Docker", "CI/CD", "Cloud", "Observability"],
    description: "The runtime layer that keeps the entire system deployable and observable.",
  },
]

export function ArchitectureShowcase() {
  return (
    <section
      id="architecture"
      className="lab-page-bg relative overflow-hidden border-b border-[var(--lab-line)] py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/25 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-[10%] size-[520px] rounded-full bg-[var(--lab-orange)]/5 blur-[130px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] bottom-[8%] size-[380px] rounded-full bg-white/[0.015] blur-[120px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-end"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--lab-orange)]">
                System architecture
              </span>

              <span className="h-px w-12 bg-[var(--lab-orange)]/35" />
            </div>

            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-[var(--lab-ink)] sm:text-4xl lg:text-[48px] lg:leading-[1.04]">
              Production systems,
              <span className="block text-[var(--lab-ink-soft)]">
                end to end.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-sm leading-[1.85] text-[var(--lab-ink-soft)] sm:text-base">
              Intelligence is only one layer. The systems we ship connect
              interfaces, application logic, model runtimes, data, and
              infrastructure into one observable production loop.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <span>
                <span className="text-[var(--lab-orange)]">
                  05
                </span>{" "}
                architecture layers
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  01
                </span>{" "}
                integrated runtime
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_OPTIONS}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="relative mt-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_45%,rgba(246,90,11,0.06),transparent_62%)]"
          />

          <div className="relative">
            <ArchitectureGraph />
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={staggerContainer}
          className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--lab-line)] bg-[var(--lab-line)] md:grid-cols-2 xl:grid-cols-5"
        >
          {STACK.map((row) => (
            <motion.article
              key={row.layer}
              variants={staggerItem}
              whileHover={{
                y: -3,
                transition: {
                  duration: 0.25,
                  ease: "easeOut",
                },
              }}
              className="group relative min-h-[190px] overflow-hidden bg-[var(--lab-bg)] px-5 py-5 transition-colors duration-500 hover:bg-[var(--lab-card)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-[var(--lab-orange)] to-transparent transition-transform duration-700 group-hover:scale-x-100"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute right-[-25%] top-[-30%] size-40 rounded-full bg-[var(--lab-orange)]/5 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
              />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <span className="font-mono text-[9px] tracking-[0.18em] text-[var(--lab-orange)]">
                  {row.index}
                </span>

                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/60">
                  layer
                </span>
              </div>

              <div className="relative z-10 mt-7">
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--lab-ink)]">
                  {row.layer}
                </h3>

                <p className="mt-2 text-[11px] leading-[1.65] text-[var(--lab-ink-soft)]">
                  {row.description}
                </p>
              </div>

              <div className="relative z-10 mt-5 flex flex-wrap gap-1.5">
                {row.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-[var(--lab-line)] bg-white/[0.02] px-2 py-1 font-mono text-[9px] tracking-[0.04em] text-[var(--lab-ink-soft)] transition-all duration-300 group-hover:border-[var(--lab-orange)]/20 group-hover:text-[var(--lab-ink)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_OPTIONS}
          transition={{
            duration: 0.6,
            delay: 0.12,
            ease: "easeOut",
          }}
          className="mt-8 flex flex-col gap-3 border-t border-[var(--lab-line)] pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--lab-ink-soft)]/70">
            Architecture is a constraint system, not a stack list.
          </p>

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/45">
            interface → logic → intelligence → data → runtime
          </p>
        </motion.div>
      </div>
    </section>
  )
}