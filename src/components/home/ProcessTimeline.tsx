import { motion, type Variants } from "motion/react"
import { PROCESS_STEPS } from "#/lib/domain/services"
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  VIEWPORT_OPTIONS,
} from "#/lib/motion-variants"
import { cn } from "#/lib/utils"

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: "blur(8px)",
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      delay: index * 0.08,
      ease: "easeOut",
    },
  }),
}

export function ProcessTimeline() {
  return (
    <section
      id="process"
      className="lab-page-bg relative overflow-hidden border-b border-[var(--lab-line)] py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/20 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-[22%] top-[22%] size-[360px] rounded-full bg-[var(--lab-orange)]/[0.035] blur-[120px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute right-[4%] bottom-[8%] size-[300px] rounded-full bg-white/[0.012] blur-[110px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--lab-orange)]">
                Delivery system
              </span>

              <span className="h-px w-12 bg-[var(--lab-orange)]/35" />
            </div>

            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-[var(--lab-ink)] sm:text-4xl lg:text-[48px] lg:leading-[1.04]">
              From brief to
              <span className="block text-[var(--lab-ink-soft)]">
                shipped product.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-sm leading-[1.85] text-[var(--lab-ink-soft)] sm:text-base">
              Every engagement follows the same operating model. Scope is
              explicit, work is visible, feedback arrives continuously, and
              shipping is part of the process rather than the final surprise.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <span>
                <span className="text-[var(--lab-orange)]">04</span>{" "}
                stages
              </span>
              <span>
                <span className="text-[var(--lab-orange)]">01</span>{" "}
                feedback loop
              </span>
              <span>
                <span className="text-[var(--lab-orange)]">∞</span>{" "}
                iterations
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={staggerContainer}
          className="relative mt-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[4.25rem] hidden h-px lg:block"
          >
            <div className="absolute inset-0 bg-[var(--lab-line)]" />

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 1.4,
                delay: 0.25,
                ease: "easeOut",
              }}
              className="absolute inset-0 origin-left bg-linear-to-r from-[var(--lab-orange)]/20 via-[var(--lab-orange)]/65 to-[var(--lab-orange)]/20"
            />

            <motion.div
              initial={{ x: "-20%", opacity: 0 }}
              whileInView={{
                x: "120%",
                opacity: [0, 0.9, 0],
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.8,
                delay: 0.9,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 h-6 w-24 -translate-y-1/2 bg-[var(--lab-orange)]/20 blur-xl"
            />
          </div>

          <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PROCESS_STEPS.map((step, index) => (
              <motion.li
                key={step.index}
                custom={index}
                variants={cardVariants}
                className="group relative"
              >
                <div
                  className={cn(
                    "relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-[1rem] border border-[var(--lab-line)] bg-[var(--lab-card)] p-6 transition-all duration-500",
                    "hover:-translate-y-2 hover:border-[var(--lab-orange)]/25 hover:bg-[var(--lab-card-elevated)]",
                  )}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-[var(--lab-orange)] to-transparent transition-transform duration-700 group-hover:scale-x-100"
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute right-[-25%] top-[-25%] size-44 rounded-full bg-[var(--lab-orange)]/[0.05] opacity-0 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:opacity-100"
                  />

                  <div className="relative z-10 flex items-start justify-between">
                    <div className="relative">
                      <span className="block font-mono text-[42px] font-semibold leading-none tracking-[-0.06em] text-[var(--lab-orange)]/80 transition-colors duration-500 group-hover:text-[var(--lab-orange)]">
                        {step.index}
                      </span>

                      <span className="absolute -right-2 top-1 h-1.5 w-1.5 rounded-full bg-[var(--lab-orange)] opacity-50 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 group-hover:shadow-[0_0_12px_rgba(246,90,11,0.7)]" />
                    </div>

                    <span className="rounded-md border border-[var(--lab-line)] bg-white/[0.02] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)] transition-colors duration-500 group-hover:border-[var(--lab-orange)]/20 group-hover:text-[var(--lab-orange)]">
                      {step.duration}
                    </span>
                  </div>

                  <div className="relative z-10 mt-10">
                    <h3 className="text-[22px] font-semibold tracking-[-0.025em] text-[var(--lab-ink)] sm:text-[24px]">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-[14px] leading-[1.8] text-[var(--lab-ink-soft)]">
                      {step.description}
                    </p>
                  </div>

                  <div className="relative z-10 mt-auto pt-8">
                    <div className="flex items-center gap-3">
                      <span className="h-px flex-1 bg-[var(--lab-line)] transition-all duration-500 group-hover:bg-[var(--lab-orange)]/30" />

                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/55">
                        {String(index + 1).padStart(2, "0")} /{" "}
                        {String(PROCESS_STEPS.length).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-all duration-500",
                          index === PROCESS_STEPS.length - 1
                            ? "bg-[var(--lab-orange)] shadow-[0_0_12px_rgba(246,90,11,0.45)]"
                            : "bg-[var(--lab-orange)]/35 group-hover:bg-[var(--lab-orange)]",
                        )}
                      />

                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/65">
                        {index === PROCESS_STEPS.length - 1
                          ? "Ready to ship"
                          : "Execution stage"}
                      </span>
                    </div>
                  </div>
                </div>

                {index < PROCESS_STEPS.length - 1 && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-4 top-[4.25rem] z-20 hidden lg:block"
                  >
                    <div className="relative h-px w-8 overflow-hidden bg-[var(--lab-line)]">
                      <motion.span
                        initial={{ x: "-100%" }}
                        whileInView={{ x: "220%" }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1.6,
                          delay: 0.6 + index * 0.12,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-y-0 left-0 w-1/2 bg-[var(--lab-orange)]"
                      />
                    </div>
                  </div>
                )}
              </motion.li>
            ))}
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_OPTIONS}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="mt-8 flex flex-col gap-3 border-t border-[var(--lab-line)] pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--lab-ink-soft)]/65">
            Weekly visibility.
            <span className="text-[var(--lab-orange)]">
              {" "}No black box handoff.
            </span>
          </p>

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/45">
            scope → build → review → ship
          </p>
        </motion.div>
      </div>
    </section>
  )
}