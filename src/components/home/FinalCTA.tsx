import { ArrowUpRight, Mail } from "lucide-react"
import { FieldCanvas } from "#/components/deepmind/FieldCanvas"
import { Reveal } from "#/components/deepmind/Reveal"
import { outlinePillClass, primaryPillClass } from "#/components/deepmind/styles"
import { Button } from "#/components/ui/button"
import { CONTACT_INFO, buildWhatsappUrl } from "#/lib/domain/services"

export function FinalCTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="dm-section relative overflow-hidden border-t border-[var(--lab-line)]"
    >
      <div aria-hidden className="dm-field-fade pointer-events-none absolute inset-0">
        <FieldCanvas seed="x90-cta" pointCount={240} scrollLinked={false} />
      </div>
      <div className="dm-shell relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="cta-heading" className="dm-title">
            Have a problem worth engineering?
          </h2>
          <p className="dm-subtitle mt-1">
            Send the problem, the constraints or a rough brief. We reply within {CONTACT_INFO.responseTime}.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className={primaryPillClass}>
              <a
                href={buildWhatsappUrl("Hi X90 Labs, I would like to discuss a project.")}
                target="_blank"
                rel="noreferrer"
              >
                Chat on WhatsApp
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
            <Button asChild variant="outline" className={outlinePillClass}>
              <a href={`mailto:${CONTACT_INFO.email}`}>
                <Mail aria-hidden />
                {CONTACT_INFO.email}
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
