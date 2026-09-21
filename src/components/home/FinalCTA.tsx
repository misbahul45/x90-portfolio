import { motion, useReducedMotion } from "motion/react"
import { Button } from "#/components/ui/button"
import { CONTACT_INFO } from "#/lib/domain/services"
import {
  fadeInUp,
  VIEWPORT_OPTIONS,
} from "#/lib/motion-variants"
import { cn } from "#/lib/utils"

export function FinalCTA() {
  const reducedMotion = useReducedMotion()

  return (
    <section
      id="contact"
      className="lab-page-bg relative overflow-hidden border-t border-[var(--lab-line)] py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/30 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--lab-orange)]/[0.04] blur-[130px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[10%] top-1/2 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/10 to-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_OPTIONS}
          variants={fadeInUp}
          className="group relative overflow-hidden rounded-[1.25rem] border border-[var(--lab-line)] bg-[var(--lab-card)]"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-linear-to-r from-transparent via-[var(--lab-orange)] to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-[20%] top-0 h-full w-[35%] bg-linear-to-r from-transparent via-white/[0.035] to-transparent"
            animate={
              reducedMotion
                ? undefined
                : {
                    x: ["0%", "380%"],
                  }
            }
            transition={
              reducedMotion
                ? undefined
                : {
                    duration: 6,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "linear",
                  }
            }
          />

          <div className="grid lg:grid-cols-[1fr_380px]">
            <div className="relative p-8 sm:p-10 lg:p-14">
              <div
                aria-hidden
                className="pointer-events-none absolute right-[-15%] top-[-20%] size-[280px] rounded-full bg-[var(--lab-orange)]/[0.045] blur-[90px] transition-all duration-1000 group-hover:scale-125 group-hover:bg-[var(--lab-orange)]/[0.07]"
              />

              <div className="relative z-10">

                <h2 className="max-w-3xl text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--lab-ink)] sm:text-4xl lg:text-[52px]">
                  Have a problem
                  <span className="block text-[var(--lab-ink-soft)]">
                    worth engineering?
                  </span>
                </h2>

                <p className="mt-6 max-w-2xl text-sm leading-[1.85] text-[var(--lab-ink-soft)] sm:text-base">
                  Build something with XNINETZY Labs. Send the problem,
                  constraints, or a rough brief. We turn ambiguity into a
                  system you can actually ship.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="rounded-md border border-[var(--lab-line)] bg-white/[0.02] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)]">
                    {CONTACT_INFO.responseTime} response
                  </span>

                  <span className="rounded-md border border-[var(--lab-line)] bg-white/[0.02] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)]">
                    Direct communication
                  </span>

                  <span className="rounded-md border border-[var(--lab-line)] bg-white/[0.02] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--lab-ink-soft)]">
                    Production focused
                  </span>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="font-mono text-[10px] text-[var(--lab-ink-soft)]">
                    {CONTACT_INFO.email}
                  </span>

                  <span
                    aria-hidden
                    className="text-[var(--lab-line-strong)]"
                  >
                    /
                  </span>

                  <span className="font-mono text-[10px] text-[var(--lab-ink-soft)]">
                    {CONTACT_INFO.whatsappDisplay}
                  </span>

                  <span
                    aria-hidden
                    className="text-[var(--lab-line-strong)]"
                  >
                    /
                  </span>

                  <span className="font-mono text-[10px] text-[var(--lab-ink-soft)]">
                    {CONTACT_INFO.responseTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative border-t border-[var(--lab-line)] bg-[#09182a] p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                  maskImage:
                    "radial-gradient(circle at 50% 30%, black, transparent 75%)",
                  WebkitMaskImage:
                    "radial-gradient(circle at 50% 30%, black, transparent 75%)",
                }}
              />

              <div className="relative z-10">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--lab-orange)]">
                  Contact paths
                </p>

                <div className="mt-6 space-y-3">
                  <CTAItem
                    href="#contact"
                    label="Start a brief"
                    detail="Describe the problem and desired outcome"
                    primary
                  />

                  <CTAItem
                    href={`https://wa.me/${CONTACT_INFO.whatsappNumber}`}
                    label="WhatsApp"
                    detail={`Usually replies within ${CONTACT_INFO.responseTime}`}
                    external
                  />

                  <CTAItem
                    href={`mailto:${CONTACT_INFO.email}`}
                    label="Email"
                    detail={CONTACT_INFO.email}
                    external
                  />

                  <CTAItem
                    href="https://github.com/X90-labs"
                    label="X90 Labs"
                    detail="Open-source work and research"
                    external
                  />
                </div>

                <div className="mt-7 border-t border-white/[0.07] pt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">
                      Response window
                    </span>

                    <span className="font-mono text-[9px] text-[var(--lab-orange)]">
                      {CONTACT_INFO.responseTime}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 8 }).map(
                      (_, index) => (
                        <motion.span
                          key={index}
                          className="h-1 flex-1 rounded-full bg-[var(--lab-orange)]/20"
                          animate={
                            reducedMotion
                              ? undefined
                              : {
                                  opacity:
                                    index < 6
                                      ? [0.35, 0.75, 0.35]
                                      : 0.2,
                                }
                          }
                          transition={
                            reducedMotion
                              ? undefined
                              : {
                                  duration: 1.8,
                                  delay: index * 0.08,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[var(--lab-line)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--lab-ink-soft)]/55">
              Problem → system → evidence → production
            </p>

            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/35">
              XNINETZY LABS
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function CTAItem({
  href,
  label,
  detail,
  primary = false,
  external = false,
}: {
  href: string
  label: string
  detail: string
  primary?: boolean
  external?: boolean
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "group h-auto w-full justify-between rounded-lg border px-4 py-3.5 text-left transition-all duration-300",
        primary
          ? "border-[var(--lab-orange)]/40 bg-[var(--lab-orange)]/10 hover:border-[var(--lab-orange)]/70 hover:bg-[var(--lab-orange)]/15"
          : "border-white/[0.07] bg-white/[0.015] hover:border-[var(--lab-orange)]/25 hover:bg-[var(--lab-orange)]/[0.04]",
      )}
    >
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="flex w-full items-center justify-between gap-4 no-underline"
      >
        <span className="min-w-0">
          <span
            className={cn(
              "block font-mono text-[11px] uppercase tracking-[0.16em]",
              primary
                ? "text-[var(--lab-orange)]"
                : "text-[var(--lab-ink)]",
            )}
          >
            {label}
          </span>

          <span className="mt-1 block truncate text-[10px] text-[var(--lab-ink-soft)]">
            {detail}
          </span>
        </span>

        <span className="shrink-0 font-mono text-[12px] text-[var(--lab-ink-soft)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--lab-orange)]">
          →
        </span>
      </a>
    </Button>
  )
}