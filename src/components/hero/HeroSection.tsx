import { useRef } from "react"
import { Link } from "@tanstack/react-router"
import { useGSAP } from "@gsap/react"
import { ArrowRight } from "lucide-react"
import { Button } from "#/components/ui/button"
import { FieldCanvas } from "#/components/deepmind/FieldCanvas"
import { outlinePillClass, primaryPillClass } from "#/components/deepmind/styles"
import { gsap, prefersReducedMotion, registerGsap, SplitText } from "#/lib/gsap"

const SIGNALS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "< 24h", label: "Brief reply" },
  { value: "Fixed", label: "Price scope" },
  { value: "Weekly", label: "Demo loop" },
]

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const heading = headingRef.current
      if (!heading || prefersReducedMotion()) return

      SplitText.create(heading, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (split) =>
          gsap.from(split.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.12,
          }),
      })

      gsap.from("[data-hero-fade]", {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.4,
      })
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pt-36 pb-16 sm:pt-44"
    >
      <div aria-hidden className="dm-field-fade pointer-events-none absolute inset-0">
        <FieldCanvas seed="x90-hero" />
      </div>
      <div className="dm-shell relative">
        <div className="mx-auto max-w-4xl text-center">
          <p data-hero-fade className="dm-eyebrow">
            X90 Labs
          </p>
          <h1 id="hero-heading" ref={headingRef} className="dm-display mt-6">
            We build the AI, automation and software that real teams run on
          </h1>
          <p data-hero-fade className="dm-lede mx-auto mt-8 max-w-2xl">
            A small software house with a research habit. Brief in, working product out, production-grade and never a prototype.
          </p>
          <div data-hero-fade className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className={primaryPillClass}>
              <Link to="/" hash="contact">
                Start a brief
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className={outlinePillClass}>
              <Link to="/" hash="work">
                See our work
              </Link>
            </Button>
          </div>
        </div>

        <dl
          data-hero-fade
          className="mx-auto mt-20 grid max-w-3xl grid-cols-3 border-t border-[var(--lab-line)] pt-6 text-center sm:mt-24"
        >
          {SIGNALS.map((signal) => (
            <div key={signal.label}>
              <dd className="text-xl font-medium tracking-tight text-[var(--lab-ink)] sm:text-2xl">
                {signal.value}
              </dd>
              <dt className="dm-body mt-1">{signal.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
