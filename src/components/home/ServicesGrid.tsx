import { motion } from "motion/react"
import { ArrowUpRight, Bot, Code2, Cpu, MessageSquare, Smartphone, Workflow } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { SERVICE_OFFERINGS, type ServiceOffering } from "#/lib/domain/services"
import { fadeInUp, staggerContainer, staggerItem, VIEWPORT_OPTIONS } from "#/lib/motion-variants"

const ICON_MAP: Record<ServiceOffering["icon"], LucideIcon> = {
  automation: Workflow,
  assistant: MessageSquare,
  agent: Bot,
  web: Code2,
  mobile: Smartphone,
}

function ServiceCard({ service }: { service: ServiceOffering }) {
  const Icon = ICON_MAP[service.icon]
  return (
    <motion.article
      variants={staggerItem}
      className="lab-card-surface group flex h-full flex-col p-6 sm:p-7"
    >
      <header className="flex items-start justify-between gap-3">
        <Icon className="size-6 text-[var(--lab-orange)]" aria-hidden />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
          {service.index}
        </span>
      </header>

      <h3 className="mt-5 text-xl font-semibold leading-snug text-[var(--lab-ink)]">
        {service.title}
      </h3>
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-[var(--lab-orange)]">
        {service.tagline}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
        {service.description}
      </p>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
          Deliverables
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-[var(--lab-ink-soft)]">
          {service.deliverables.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 bg-[var(--lab-orange)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
        Stack
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--lab-ink)]">
        {service.stack.join(" · ")}
      </p>

      <a
        href="#contact"
        className="mt-5 inline-flex items-center gap-1.5 self-start font-mono text-xs font-medium text-[var(--lab-orange)] no-underline opacity-80 transition-opacity group-hover:opacity-100"
      >
        Brief us
        <ArrowUpRight className="size-3.5" aria-hidden />
      </a>
    </motion.article>
  )
}

export function ServicesGrid() {
  return (
    <section id="services" className="lab-page-bg border-b border-[var(--lab-line)] py-24">
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="mx-auto max-w-3xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
            Five services, one software house
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--lab-ink-soft)] sm:text-base">
            Automation, AI assistants, agentic systems, full web, and full mobile.
            Pick one or combine — we deliver from research to production.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICE_OFFERINGS.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}

          <motion.article
            variants={staggerItem}
            className="lab-card-surface relative flex h-full flex-col justify-between p-6 sm:p-7"
            style={{
              borderColor: "rgba(246, 90, 11, 0.30)",
            }}
          >
            <div>
              <Cpu className="size-6 text-[var(--lab-orange)]" aria-hidden />
              <h3 className="mt-4 text-xl font-semibold text-[var(--lab-ink)]">
                AI Labs — Research as a service
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                Beyond shipping, we publish. Our AI Labs publishes research on
                retrieval, agents, and long-context systems — the same ideas that
                power what we build for clients.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-[var(--lab-ink-soft)]">
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 bg-[var(--lab-orange)]" />
                  Custom retrieval + reranking R&D
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 bg-[var(--lab-orange)]" />
                  Agent evaluation harnesses
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 bg-[var(--lab-orange)]" />
                  Benchmark + ablation studies
                </li>
              </ul>
            </div>
            <a
              href="/research"
              className="mt-6 inline-flex items-center gap-1.5 self-start font-mono text-xs font-medium text-[var(--lab-orange)] no-underline"
            >
              Read research
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </motion.article>
        </motion.div>
      </div>
    </section>
  )
}
