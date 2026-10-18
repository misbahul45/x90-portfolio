import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { outlinePillClass } from "#/components/deepmind/styles"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/ui/accordion"
import { Button } from "#/components/ui/button"
import { SERVICE_OFFERINGS } from "#/lib/domain/services"

const triggerClass =
  "items-center gap-6 rounded-none py-7 hover:no-underline focus-visible:ring-[var(--lab-orange)]/40 md:gap-10 md:py-9 [&>svg]:size-6 [&>svg]:translate-y-0 [&>svg]:text-[var(--lab-ink-soft)] hover:[&>svg]:text-[var(--lab-orange)]"

const contentClass =
  "grid gap-8 pb-9 pl-[calc(3.5rem+1.5rem)] pr-10 text-[15px] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10 md:pl-[calc(6rem+2.5rem)]"

export function ServicesList() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="dm-section border-t border-[var(--lab-line)]"
    >
      <div className="dm-shell">
        <Reveal>
          <SectionHeader
            headingId="services-heading"
            title="What we build"
            description="Five ways we turn a brief into production software."
            action={
              <Button asChild variant="outline" className={outlinePillClass}>
                <Link to="/" hash="contact">
                  Start a brief
                  <ArrowUpRight aria-hidden />
                </Link>
              </Button>
            }
          />
        </Reveal>

        <Accordion
          type="single"
          collapsible
          defaultValue={SERVICE_OFFERINGS[0]?.key}
          className="mt-12 border-t border-[var(--lab-line)]"
        >
          {SERVICE_OFFERINGS.map((service) => (
            <Reveal key={service.key} className="border-b border-[var(--lab-line)]">
              <AccordionItem value={service.key} className="border-b-0">
                <AccordionTrigger className={triggerClass}>
                  <span className="grid min-w-0 flex-1 grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-6 gap-y-2 md:grid-cols-[6rem_minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-x-10">
                    <span className="font-mono text-3xl tabular-nums leading-none text-[var(--lab-orange)] sm:text-4xl">
                      {service.index}
                    </span>
                    <span className="text-2xl font-medium leading-tight tracking-tight text-[var(--lab-ink)] sm:text-3xl">
                      {service.title}
                    </span>
                    <span className="col-start-2 text-base font-normal leading-relaxed text-[var(--lab-ink-soft)] md:col-start-3 md:row-start-1">
                      {service.tagline}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className={contentClass}>
                  <div>
                    <p className="dm-lede">{service.description}</p>
                    <p className="mt-5 font-mono text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                      {service.stack.join(" · ")}
                    </p>
                  </div>
                  <ul className="space-y-2.5">
                    {service.deliverables.map((item) => (
                      <li
                        key={item}
                        className="border-t border-[var(--lab-line)] pt-2.5 text-[var(--lab-ink)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
