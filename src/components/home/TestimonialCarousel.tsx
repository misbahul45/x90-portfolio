import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Quote, Star } from "lucide-react"
import { TESTIMONIALS, type Testimonial } from "#/lib/domain/clients"
import { cn } from "#/lib/utils"

const ITEMS_PER_VIEW = 3
const AUTO_ADVANCE_MS = 5000

function chunked<T>(items: ReadonlyArray<T>, size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

function TestimonialCard({ testimonial, className }: { testimonial: Testimonial; className?: string }) {
  return (
    <article
      className={cn(
        "lab-card-surface flex h-full min-h-[260px] flex-col gap-4 p-6 sm:p-7",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Quote className="size-5 text-[var(--lab-orange)]" aria-hidden />
        <div className="flex items-center gap-0.5 text-[var(--lab-orange)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-current" aria-hidden />
          ))}
        </div>
      </div>
      <p className="text-base leading-relaxed text-[var(--lab-ink)]">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <footer className="mt-auto border-t border-[var(--lab-line)] pt-4">
        <p className="font-semibold text-[var(--lab-ink)]">{testimonial.name}</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
          {testimonial.role} · {testimonial.company}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lab-orange)]">
          {testimonial.service}
        </p>
      </footer>
    </article>
  )
}

export function TestimonialCarousel() {
  const reduceMotion = useReducedMotion()
  const pages = chunked(TESTIMONIALS, ITEMS_PER_VIEW)
  const [activePage, setActivePage] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduceMotion || paused) return
    const id = window.setInterval(() => {
      setActivePage((prev) => (prev + 1) % pages.length)
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion, paused, pages.length])

  const goTo = (index: number) =>
    setActivePage(((index % pages.length) + pages.length) % pages.length)

  return (
    <section
      id="feedback"
      className="lab-page-bg border-b border-[var(--lab-line)] py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1240px] px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--lab-ink)] sm:text-4xl">
              Signals from the people we shipped for
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]">
              {String(activePage + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goTo(activePage - 1)}
                aria-label="Previous testimonial"
                className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] transition-colors hover:border-[var(--lab-orange)]"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => goTo(activePage + 1)}
                aria-label="Next testimonial"
                className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)] transition-colors hover:border-[var(--lab-orange)]"
              >
                →
              </button>
            </div>
          </div>
        </motion.div>

        <div className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: `${-activePage * 100}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {pages.map((page, pageIndex) => (
              <div
                key={`page-${pageIndex}`}
                className="grid w-full shrink-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                aria-hidden={pageIndex !== activePage}
              >
                {page.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {pages.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to testimonial page ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activePage
                  ? "w-8 bg-[var(--lab-orange)]"
                  : "w-1.5 bg-[var(--lab-line-strong)] hover:bg-[var(--lab-ink-soft)]",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
