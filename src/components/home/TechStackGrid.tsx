import { motion } from "motion/react"
import { TECH_STACK } from "#/lib/domain/services"
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  VIEWPORT_OPTIONS,
} from "#/lib/motion-variants"

export function TechStackGrid() {
  return (
    <section
      id="stack"
      className="lab-page-bg relative overflow-hidden border-b border-[var(--lab-line)] py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/20 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] top-[18%] size-[360px] rounded-full bg-[var(--lab-orange)]/[0.035] blur-[120px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] bottom-[8%] size-[320px] rounded-full bg-white/[0.012] blur-[110px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-end"
        >
          <div>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[var(--lab-ink)] sm:text-4xl lg:text-[48px] lg:leading-[1.04]">
              Production-grade
              <span className="block text-[var(--lab-ink-soft)]">
                by default.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-sm leading-[1.85] text-[var(--lab-ink-soft)] sm:text-base">
              The same engineering foundations we use across products,
              experiments, and research. Deliberately familiar, composable,
              observable, and easy to hand over.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <span>
                <span className="text-[var(--lab-orange)]">
                  01
                </span>{" "}
                shared foundation
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  03
                </span>{" "}
                system layers
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  PROD
                </span>{" "}
                ready
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={staggerContainer}
          className="relative mt-14 grid grid-cols-1 overflow-hidden rounded-[1.15rem] border border-[var(--lab-line)] bg-[var(--lab-line)] sm:grid-cols-2 lg:grid-cols-3"
        >
          {TECH_STACK.map((group, index) => (
            <motion.article
              key={group.group}
              variants={staggerItem}
              whileHover={{
                y: -4,
                transition: {
                  duration: 0.25,
                  ease: "easeOut",
                },
              }}
              className="group relative min-h-[250px] overflow-hidden bg-[var(--lab-bg)] p-6 transition-colors duration-500 sm:p-7"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-[var(--lab-orange)] to-transparent transition-transform duration-700 group-hover:scale-x-100"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute right-[-20%] top-[-25%] size-[180px] rounded-full bg-[var(--lab-orange)]/[0.045] opacity-0 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:opacity-100"
              />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <span className="font-mono text-[9px] tracking-[0.2em] text-[var(--lab-orange)]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/45">
                  stack layer
                </span>
              </div>

              <div className="relative z-10 mt-9">
                <h3 className="text-xl font-semibold tracking-[-0.025em] text-[var(--lab-ink)]">
                  {group.group}
                </h3>

                <div className="mt-5 space-y-2.5">
                  {group.items.map((item, itemIndex) => (
                    <div
                      key={item}
                      className="group/item flex items-center gap-3"
                    >
                      <span className="font-mono text-[8px] tabular-nums text-[var(--lab-orange)]/45 transition-colors duration-300 group-hover/item:text-[var(--lab-orange)]">
                        {String(itemIndex + 1).padStart(2, "0")}
                      </span>

                      <span className="h-px w-4 bg-[var(--lab-line-strong)] transition-all duration-300 group-hover/item:w-7 group-hover/item:bg-[var(--lab-orange)]/45" />

                      <span className="text-[14px] leading-relaxed text-[var(--lab-ink-soft)] transition-colors duration-300 group-hover/item:text-[var(--lab-ink)]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-8">
                <div className="h-px bg-[var(--lab-line)] transition-colors duration-500 group-hover:bg-[var(--lab-orange)]/15" />

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]/40">
                    {group.items.length} technologies
                  </span>

                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--lab-orange)]/0 transition-colors duration-300 group-hover:text-[var(--lab-orange)]">
                    active
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={VIEWPORT_OPTIONS}
          transition={{
            duration: 0.55,
            delay: 0.1,
            ease: "easeOut",
          }}
          className="mt-7 flex flex-col gap-3 border-t border-[var(--lab-line)] pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--lab-ink-soft)]/60">
            Choose boring foundations.
            <span className="text-[var(--lab-orange)]">
              {" "}Spend complexity where it matters.
            </span>
          </p>

          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/35">
            application → intelligence → infrastructure
          </p>
        </motion.div>
      </div>
    </section>
  )
}