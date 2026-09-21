import { motion } from "motion/react"
import {
  SERVICE_OFFERINGS,
  type ServiceOffering,
} from "#/lib/domain/services"
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  VIEWPORT_OPTIONS,
} from "#/lib/motion-variants"

function ServiceCard({
  service,
}: {
  service: ServiceOffering
}) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{
        y: -6,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
      className="group relative flex h-full min-h-[470px] flex-col overflow-hidden rounded-[1.1rem] border border-[var(--lab-line)] bg-[var(--lab-card)] p-6 transition-colors duration-500 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(246,90,11,0.11), transparent 34%), radial-gradient(circle at 88% 92%, rgba(246,90,11,0.06), transparent 32%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-[var(--lab-orange)] to-transparent transition-transform duration-700 group-hover:scale-x-100"
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-[var(--lab-line)] bg-white/[0.02] px-2 font-mono text-[9px] font-medium tracking-[0.16em] text-[var(--lab-orange)]">
            {service.index}
          </span>

          <span className="h-px w-7 bg-[var(--lab-orange)]/35 transition-all duration-500 group-hover:w-12 group-hover:bg-[var(--lab-orange)]/70" />
        </div>

        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--lab-ink-soft)] transition-colors duration-300 group-hover:text-[var(--lab-orange)]">
          {service.key}
        </span>
      </div>

      <div className="relative z-10 mt-10">
        <h3 className="max-w-[18rem] text-[25px] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--lab-ink)] sm:text-[27px]">
          {service.title}
        </h3>

        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">
          {service.tagline}
        </p>

        <p className="mt-5 max-w-[34rem] text-[14px] leading-[1.8] text-[var(--lab-ink-soft)]">
          {service.description}
        </p>
      </div>

      <div className="relative z-10 mt-7 border-t border-[var(--lab-line)] pt-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--lab-ink-soft)]">
            Deliverables
          </p>

          <span className="text-[10px] tabular-nums text-[var(--lab-ink-soft)]">
            {service.deliverables.length.toString().padStart(2, "0")}
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {service.deliverables.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -4 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{
                once: true,
                amount: 0.4,
              }}
              transition={{
                duration: 0.35,
                delay: index * 0.04,
                ease: "easeOut",
              }}
              className="flex items-start gap-3 text-[13px] leading-relaxed text-[var(--lab-ink-soft)]"
            >
              <span className="mt-[0.6rem] h-px w-4 shrink-0 bg-[var(--lab-orange)]/55 transition-all duration-300 group-hover:w-6 group-hover:bg-[var(--lab-orange)]" />
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-auto pt-7">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--lab-ink-soft)]">
          Stack
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {service.stack.map((technology) => (
            <span
              key={technology}
              className="rounded-md border border-[var(--lab-line)] bg-white/[0.025] px-2 py-1 font-mono text-[9px] tracking-[0.04em] text-[var(--lab-ink-soft)] transition-all duration-300 group-hover:border-[var(--lab-orange)]/20 group-hover:text-[var(--lab-ink)]"
            >
              {technology}
            </span>
          ))}
        </div>

        <a
          href="#contact"
          className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--lab-orange)] no-underline transition-all duration-300 hover:gap-3"
        >
          Brief us
          <span
            aria-hidden
            className="h-px w-5 bg-[var(--lab-orange)] transition-all duration-300 hover:w-7"
          />
        </a>
      </div>
    </motion.article>
  )
}

function ResearchCard() {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{
        y: -6,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
      className="group relative flex h-full min-h-[470px] overflow-hidden rounded-[1.1rem] border border-[rgba(246,90,11,0.24)] bg-[linear-gradient(145deg,#101f33,#0b1a30)] p-6 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-[-8%] size-[260px] rounded-full bg-[radial-gradient(circle,rgba(246,90,11,0.18),transparent_68%)] blur-3xl transition-transform duration-1000 group-hover:scale-125"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(circle at 78% 20%, black, transparent 68%)",
          WebkitMaskImage:
            "radial-gradient(circle at 78% 20%, black, transparent 68%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)] to-transparent"
      />

      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 items-center rounded-md border border-[rgba(246,90,11,0.28)] bg-[var(--lab-orange)]/8 px-2 font-mono text-[9px] font-medium tracking-[0.16em] text-[var(--lab-orange)]">
              LAB
            </span>

            <span className="h-px w-10 bg-[var(--lab-orange)]/45" />
          </div>

          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--lab-orange)]/70">
            Research
          </span>
        </div>

        <div className="mt-10">
          <h3 className="max-w-[20rem] text-[25px] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--lab-ink)] sm:text-[27px]">
            AI Labs
            <span className="block text-[var(--lab-orange)]">
              Research as a service
            </span>
          </h3>

          <p className="mt-5 max-w-[34rem] text-[14px] leading-[1.8] text-[var(--lab-ink-soft)]">
            Beyond shipping software, we investigate the systems behind it:
            retrieval, agents, long-context reasoning, evaluation, and the
            engineering required to make research usable in production.
          </p>
        </div>

        <div className="mt-8 border-t border-[rgba(246,90,11,0.16)] pt-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--lab-ink-soft)]">
            Research tracks
          </p>

          <div className="mt-4 space-y-3">
            {[
              "Custom retrieval + reranking R&D",
              "Agent evaluation harnesses",
              "Benchmark + ablation studies",
              "Long-context system experiments",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 text-[13px] leading-relaxed text-[var(--lab-ink-soft)]"
              >
                <span className="font-mono text-[9px] text-[var(--lab-orange)]/65">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="transition-colors duration-300 group-hover:text-[var(--lab-ink)]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className="mb-5 h-px w-full bg-linear-to-r from-[var(--lab-orange)]/40 via-[var(--lab-orange)]/10 to-transparent" />

          <a
            href="/research"
            className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--lab-orange)] no-underline transition-all duration-300 hover:gap-3"
          >
            Explore research
            <span
              aria-hidden
              className="h-px w-5 bg-[var(--lab-orange)] transition-all duration-300"
            />
          </a>
        </div>
      </div>
    </motion.article>
  )
}

export function ServicesGrid() {
  return (
    <section
      id="services"
      className="lab-page-bg relative overflow-hidden border-b border-[var(--lab-line)] py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/20 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[15%] size-[420px] rounded-full bg-[var(--lab-orange)]/5 blur-[120px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end"
        >
          <div>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-[var(--lab-ink)] sm:text-4xl lg:text-[46px] lg:leading-[1.05]">
              Five services.
              <br />
              <span className="text-[var(--lab-ink-soft)]">
                One engineering system.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-sm leading-[1.8] text-[var(--lab-ink-soft)] sm:text-base">
              From automation and intelligent assistants to agentic systems,
              full-stack products, and mobile applications. Research and
              production live in the same loop.
            </p>

            <div className="mt-5 flex items-center gap-6 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
              <span>
                <span className="text-[var(--lab-orange)]">
                  05
                </span>{" "}
                core services
              </span>

              <span>
                <span className="text-[var(--lab-orange)]">
                  01
                </span>{" "}
                research lab
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {SERVICE_OFFERINGS.map((service) => (
            <ServiceCard
              key={service.key}
              service={service}
            />
          ))}

          <ResearchCard />
        </motion.div>
      </div>
    </section>
  )
}