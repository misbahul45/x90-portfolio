import { useMemo, useState, type ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowUpRight, LayoutGrid } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Skeleton } from "#/components/ui/skeleton"
import { Carousel } from "#/components/deepmind/Carousel"
import { NodeArt } from "#/components/deepmind/NodeArt"
import { SectionHeader } from "#/components/deepmind/SectionHeader"
import { WorkGraph } from "#/components/deepmind/WorkGraph"
import { outlinePillClass } from "#/components/deepmind/styles"
import { useProjects } from "#/hooks/useProjects"
import { buildWorkSlides, type WorkSlide } from "#/lib/domain/work-slides"

const cardLinkClass =
  "group block rounded-[1.5rem] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--lab-bg)]"

function SlideLink({ slide, children }: { slide: WorkSlide; children: ReactNode }) {
  const { target } = slide
  if (target.kind === "project") {
    return (
      <Link to="/projects/$slug" params={{ slug: target.slug }} draggable={false} className={cardLinkClass}>
        {children}
      </Link>
    )
  }
  if (target.kind === "section") {
    return (
      <Link to="/" hash={target.hash} draggable={false} className={cardLinkClass}>
        {children}
      </Link>
    )
  }
  return (
    <Link to={target.to} draggable={false} className={cardLinkClass}>
      {children}
    </Link>
  )
}

function WorkSlideCard({ slide }: { slide: WorkSlide }) {
  return (
    <SlideLink slide={slide}>
      <div className="dm-media aspect-[16/9] transition-colors duration-300 group-hover:border-[var(--lab-line-strong)]">
        <div data-slide-parallax className="absolute inset-0">
          {slide.coverImage ? (
            <img
              src={slide.coverImage}
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : (
            <NodeArt seed={slide.id} />
          )}
        </div>
        {slide.kind === "more" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--lab-card)]/70">
            <LayoutGrid className="size-10 text-[var(--lab-ink)]" aria-hidden />
          </div>
        ) : null}
      </div>
      <div className="mt-5">
        <h3 className="dm-card-title">{slide.title}</h3>
        <p className="dm-body mt-2 line-clamp-3">{slide.description}</p>
      </div>
      <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--lab-ink)] transition-colors group-hover:text-[var(--lab-orange)]">
        Learn more
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </p>
    </SlideLink>
  )
}

function CarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden sm:gap-6" aria-hidden>
      {[0, 1, 2].map((index) => (
        <div key={index} className="shrink-0 basis-[min(84vw,26rem)]">
          <Skeleton className="aspect-[16/9] w-full rounded-[1.5rem]" />
          <Skeleton className="mt-5 h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

export function WorkCarouselSection() {
  const { data, isPending } = useProjects({ featuredOnly: true, pageSize: 8, page: 1 })
  const slides = useMemo(() => buildWorkSlides(data?.items ?? []), [data])
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="work" aria-labelledby="work-heading" className="dm-section">
      <div className="dm-shell">
        <SectionHeader
          headingId="work-heading"
          title="Selected work"
          description="Systems we have shipped, and the research and stack behind each one."
          action={
            <Button asChild variant="outline" className={outlinePillClass}>
              <Link to="/projects">View all work</Link>
            </Button>
          }
        />

        <div className="mt-12">
          {isPending ? (
            <CarouselSkeleton />
          ) : (
            <Carousel
              label="Selected work"
              items={slides}
              getKey={(slide) => slide.id}
              renderSlide={(slide) => <WorkSlideCard slide={slide} />}
              activeIndex={activeIndex}
              onActiveChange={setActiveIndex}
            />
          )}
        </div>

        {!isPending && slides.length > 1 ? (
          <div className="mt-16">
            <h3 className="dm-card-title">How the work connects</h3>
            <p className="dm-body mt-2 max-w-2xl">
              Choose a system to follow its thread: the research behind it, flowing into the system, and out to the stack it runs on.
            </p>
            <WorkGraph
              className="mt-6"
              slides={slides}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
