import { motion } from "motion/react"
import { TECH_STACK } from "#/lib/domain/services"
import { fadeInUp, staggerContainer, staggerItem, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

export function TechStackGrid() {
  return (
    <section id="stack" className="lab-page-bg border-b border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mx-auto max-w-3xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
            Production-grade by default
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
            Same stack we use to ship our own products and lab research. Boring
            choices, fast delivery, easy handover.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-line)] sm:grid-cols-2 lg:grid-cols-3"
        >
          {TECH_STACK.map((group) => (
            <motion.div
              key={group.group}
              variants={staggerItem}
              className="bg-[var(--lab-bg)] p-6 sm:p-8"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
                {group.group}
              </p>
              <ul className="mt-5 space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="text-[15px] leading-relaxed text-[var(--lab-ink)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
