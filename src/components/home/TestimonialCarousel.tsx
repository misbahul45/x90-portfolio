import { Carousel } from "#/components/deepmind/Carousel"
import { Reveal } from "#/components/deepmind/Reveal"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { TESTIMONIALS, type Testimonial } from "#/lib/domain/clients"

function TestimonialSlide({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full min-h-80 flex-col justify-between gap-10 rounded-3xl border border-[var(--lab-line)] bg-[var(--lab-card)] p-8">
      <blockquote className="text-xl font-medium leading-snug tracking-tight text-[var(--lab-ink)]">
        {testimonial.quote}
      </blockquote>
      <figcaption>
        <p className="text-[15px] font-medium text-[var(--lab-ink)]">{testimonial.name}</p>
        <p className="dm-body mt-1">
          {testimonial.role}, {testimonial.company}
        </p>
        <p className="mt-4 text-sm text-[var(--lab-orange)]">{testimonial.service}</p>
      </figcaption>
    </figure>
  )
}

export function TestimonialCarousel() {
  return (
    <section
      id="feedback"
      aria-labelledby="feedback-heading"
      className="dm-section border-t border-[var(--lab-line)]"
    >
      <div className="dm-shell">
        <Reveal>
          <SectionHeader
            headingId="feedback-heading"
            title="What teams say"
            description="Notes from the people who run what we built."
          />
        </Reveal>

        <div className="mt-12">
          <Carousel
            label="Client feedback"
            items={TESTIMONIALS}
            getKey={(testimonial) => testimonial.id}
            renderSlide={(testimonial) => <TestimonialSlide testimonial={testimonial} />}
            slideClassName="basis-[min(88vw,30rem)]"
          />
        </div>
      </div>
    </section>
  )
}
