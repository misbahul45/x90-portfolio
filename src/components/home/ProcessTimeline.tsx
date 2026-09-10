import { motion } from "motion/react"
import { ArrowDown, Check } from "lucide-react"
import { PROCESS_STEPS } from "#/lib/domain/services"
import { fadeInUp, staggerContainer, staggerItem, VIEWPORT_OPTIONS } from "#/lib/motion-variants"
import { cn } from "#/lib/utils"

export function ProcessTimeline() {
  return (
    <section id="process" className="lab-page-bg border-b border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mx-auto max-w-3xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
            From brief to shipped, in four steps
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
            Every project — automation, AI, web, or mobile — moves through the
            same four stages. You see progress every Friday, not at the end.
          </p>
        </motion.div>

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {PROCESS_STEPS.map((step, index) => (
            <motion.li
              key={step.index}
              variants={staggerItem}
              className={cn(
                "lab-card-surface relative flex h-full flex-col gap-3 p-6",
              )}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[28px] font-semibold leading-none text-[var(--lab-orange)]">
                  {step.index}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
                  {step.duration}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--lab-ink)]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                {step.description}
              </p>
              {index < PROCESS_STEPS.length - 1 ? (
                <ArrowDown
                  aria-hidden
                  className="absolute -bottom-3 left-1/2 hidden -translate-x-1/2 text-[var(--lab-orange)] lg:block"
                />
              ) : (
                <Check
                  aria-hidden
                  className="absolute right-4 top-4 size-4 text-[var(--lab-orange)]"
                />
              )}
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
