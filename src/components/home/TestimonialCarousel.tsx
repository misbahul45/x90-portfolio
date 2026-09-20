import { useEffect, useMemo, useState } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react"
import {
  TESTIMONIALS,
  type Testimonial,
} from "#/lib/domain/clients"
import { cn } from "#/lib/utils"

const ITEMS_PER_VIEW = 3
const AUTO_ADVANCE_MS = 5600

function chunked<T>(
  items: ReadonlyArray<T>,
  size: number,
): T[][] {
  const result: T[][] = []

  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }

  return result
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial
  index: number
}) {
  return (
    <motion.article
      variants={cardVariants}
      whileHover={{
        y: -5,
        transition: {
          duration: 0.28,
          ease: "easeOut",
        },
      }}
      className="group relative flex min-h-[330px] h-full flex-col overflow-hidden rounded-[1rem] border border-[var(--lab-line)] bg-[var(--lab-card)] p-6 transition-colors duration-500 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-[var(--lab-orange)] to-transparent transition-transform duration-700 group-hover:scale-x-100"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute right-[-20%] top-[-20%] size-44 rounded-full bg-[var(--lab-orange)]/[0.035] opacity-0 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:opacity-100"
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <span className="font-mono text-[9px] tracking-[0.22em] text-[var(--lab-orange)]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/45">
          verified signal
        </span>
      </div>

      <div className="relative z-10 mt-8">
        <span
          aria-hidden
          className="block font-serif text-5xl leading-none text-[var(--lab-orange)]/35"
        >
          “
        </span>

        <p className="mt-1 text-[17px] leading-[1.75] tracking-[-0.01em] text-[var(--lab-ink)] sm:text-[18px]">
          {testimonial.quote}
        </p>
      </div>

      <div className="relative z-10 mt-auto border-t border-[var(--lab-line)] pt-5">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--lab-ink)]">
              {testimonial.name}
            </p>

            <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
              {testimonial.role}
              {testimonial.company
                ? ` · ${testimonial.company}`
                : ""}
            </p>
          </div>

          <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--lab-orange)]">
            {testimonial.service}
          </span>
        </div>
      </div>
    </motion.article>
  )
}

export function TestimonialCarousel() {
  const reduceMotion = useReducedMotion()
  const pages = useMemo(
    () =>
      chunked(
        TESTIMONIALS,
        ITEMS_PER_VIEW,
      ),
    [],
  )

  const [activePage, setActivePage] =
    useState(0)
  const [paused, setPaused] =
    useState(false)

  useEffect(() => {
    if (
      reduceMotion ||
      paused ||
      pages.length <= 1
    ) {
      return
    }

    const timer = window.setInterval(
      () => {
        setActivePage(
          (current) =>
            (current + 1) % pages.length,
        )
      },
      AUTO_ADVANCE_MS,
    )

    return () =>
      window.clearInterval(timer)
  }, [
    reduceMotion,
    paused,
    pages.length,
  ])

  const goTo = (index: number) => {
    setActivePage(
      ((index % pages.length) +
        pages.length) %
        pages.length,
    )
  }

  const currentPage =
    pages[activePage] ?? []

  return (
    <section
      id="feedback"
      className="lab-page-bg relative overflow-hidden border-b border-[var(--lab-line)] py-24 sm:py-28"
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
      onFocusCapture={() =>
        setPaused(true)
      }
      onBlurCapture={() =>
        setPaused(false)
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[var(--lab-orange)]/20 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] top-[20%] size-[320px] rounded-full bg-[var(--lab-orange)]/[0.03] blur-[110px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute right-[-5%] bottom-[10%] size-[280px] rounded-full bg-white/[0.015] blur-[100px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin:
              "0px 0px -80px 0px",
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--lab-orange)]">
                Field feedback
              </span>

              <span className="h-px w-12 bg-[var(--lab-orange)]/30" />
            </div>

            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[var(--lab-ink)] sm:text-4xl lg:text-[46px] lg:leading-[1.05]">
              Signals from people
              <span className="block text-[var(--lab-ink-soft)]">
                we shipped for.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-[1.8] text-[var(--lab-ink-soft)] sm:text-base">
              Feedback is another form of system evidence: what worked,
              what changed, and what became useful after the software left
              the lab.
            </p>
          </div>

          <div className="flex items-center gap-4 lg:pb-1">
            <div className="text-right">
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/50">
                Evidence set
              </p>

              <p className="mt-1 font-mono text-[11px] text-[var(--lab-orange)]">
                {String(activePage + 1).padStart(
                  2,
                  "0",
                )}
                {" / "}
                {String(pages.length).padStart(
                  2,
                  "0",
                )}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  goTo(activePage - 1)
                }
                aria-label="Previous testimonials"
                className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] font-mono text-xs text-[var(--lab-ink)] transition-all duration-300 hover:border-[var(--lab-orange)]/50 hover:text-[var(--lab-orange)]"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() =>
                  goTo(activePage + 1)
                }
                aria-label="Next testimonials"
                className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] font-mono text-xs text-[var(--lab-ink)] transition-all duration-300 hover:border-[var(--lab-orange)]/50 hover:text-[var(--lab-orange)]"
              >
                →
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-12">
          <AnimatePresence
            mode="wait"
            initial={false}
          >
            <motion.div
              key={activePage}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: reduceMotion
                  ? 0
                  : 0.45,
                ease: "easeOut",
              }}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {currentPage.map(
                (testimonial, index) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={
                      testimonial
                    }
                    index={index}
                  />
                ),
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  goTo(index)
                }
                aria-label={`Go to testimonial page ${index + 1}`}
                aria-current={
                  index === activePage
                    ? "true"
                    : undefined
                }
                className="relative h-1.5 overflow-hidden rounded-full bg-[var(--lab-line)] transition-all duration-300"
              >
                <span
                  className={cn(
                    "block h-full rounded-full transition-all duration-500",
                    index === activePage
                      ? "w-10 bg-[var(--lab-orange)]"
                      : "w-1.5 bg-[var(--lab-line-strong)] hover:bg-[var(--lab-ink-soft)]",
                  )}
                />

                {index ===
                  activePage &&
                  !paused &&
                  !reduceMotion && (
                    <motion.span
                      key={`progress-${activePage}`}
                      className="absolute inset-y-0 left-0 bg-white/40"
                      initial={{
                        width: "0%",
                      }}
                      animate={{
                        width: "100%",
                      }}
                      transition={{
                        duration:
                          AUTO_ADVANCE_MS /
                          1000,
                        ease: "linear",
                      }}
                    />
                  )}
              </button>
            ))}
          </div>

          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]/45">
            {paused
              ? "paused"
              : "auto-rotating evidence"}
          </p>
        </div>
      </div>
    </section>
  )
}