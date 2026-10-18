import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "#/components/ui/button"
import {
  clamp,
  computeSnapPlan,
  computeStops,
  formatSlideLabel,
  nearestIndex,
  scrollProgress,
  slideDepth,
  stepIndex,
  stopForItem,
  type SnapPlan,
} from "#/lib/carousel-math"
import { Draggable, gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "#/lib/gsap"
import { cn } from "#/lib/utils"

const PARALLAX_DISTANCE = 36
const PARALLAX_SCALE = 1.14
const TRAVEL_SECONDS = 0.9
const MIN_STOP_RATIO = 0.4

export type CarouselProps<T> = {
  label: string
  items: ReadonlyArray<T>
  getKey: (item: T) => string
  renderSlide: (item: T, index: number) => ReactNode
  activeIndex?: number
  onActiveChange?: (index: number) => void
  className?: string
  slideClassName?: string
}

type GoToOptions = {
  immediate?: boolean
  silent?: boolean
}

export function Carousel<T>({
  label,
  items,
  getKey,
  renderSlide,
  activeIndex,
  onActiveChange,
  className,
  slideClassName,
}: CarouselProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const planRef = useRef<SnapPlan>({ offsets: [0], maxOffset: 0 })
  const stopsRef = useRef<number[]>([0])
  const currentRef = useRef(0)
  const movedRef = useRef(false)
  const changeRef = useRef(onActiveChange)
  const goToRef = useRef<(index: number, options?: GoToOptions) => void>(() => undefined)
  const [current, setCurrent] = useState(0)
  const [stopCount, setStopCount] = useState(items.length)

  useEffect(() => {
    changeRef.current = onActiveChange
  })

  useGSAP(
    () => {
      registerGsap()
      const track = trackRef.current
      const viewport = viewportRef.current
      const root = rootRef.current
      if (!track || !viewport || !root) return

      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]", track)
      const parallax = slides.map((slide) =>
        slide.querySelector<HTMLElement>("[data-slide-parallax]"),
      )
      const reduced = prefersReducedMotion()
      const setProgress = progressRef.current
        ? (gsap.quickSetter(progressRef.current, "scaleX") as (value: number) => void)
        : null

      let plan = planRef.current
      let stopOffsets: number[] = [0]
      let draggable: Draggable | undefined

      const offsetNow = (): number => -(gsap.getProperty(track, "x") as number)

      const syncIndex = (): void => {
        const stop = nearestIndex(offsetNow(), stopOffsets)
        if (stop === currentRef.current) return
        currentRef.current = stop
        setCurrent(stop)
        changeRef.current?.(stopsRef.current[stop] ?? stop)
      }

      const applyEffects = (): void => {
        const offset = offsetNow()
        setProgress?.(scrollProgress(offset, plan.maxOffset))
        if (reduced) return
        const width = viewport.clientWidth
        slides.forEach((slide, index) => {
          const target = parallax[index]
          if (!target) return
          const center = slide.offsetLeft - offset + slide.offsetWidth / 2
          const depth = slideDepth(center, width / 2, width)
          gsap.set(target, { x: depth * -PARALLAX_DISTANCE, scale: PARALLAX_SCALE })
        })
      }

      const measure = (): void => {
        plan = computeSnapPlan(
          slides.map((slide) => slide.offsetLeft),
          track.scrollWidth,
          viewport.clientWidth,
        )
        planRef.current = plan
        const step = (slides[1]?.offsetLeft ?? 0) - (slides[0]?.offsetLeft ?? 0)
        stopsRef.current = computeStops(plan.offsets, step * MIN_STOP_RATIO)
        stopOffsets = stopsRef.current.map((index) => plan.offsets[index] ?? 0)
        setStopCount(stopOffsets.length)
        draggable?.applyBounds({ minX: -plan.maxOffset, maxX: 0 })
      }

      const goTo = (stop: number, options: GoToOptions = {}): void => {
        const next = stepIndex(stop, 0, stopOffsets.length)
        const changed = next !== currentRef.current
        currentRef.current = next
        setCurrent(next)
        if (changed && !options.silent) changeRef.current?.(stopsRef.current[next] ?? next)
        gsap.to(track, {
          x: -(stopOffsets[next] ?? 0),
          duration: options.immediate || reduced ? 0 : TRAVEL_SECONDS,
          ease: "power3.out",
          overwrite: true,
          onUpdate: applyEffects,
          onComplete: applyEffects,
        })
      }
      goToRef.current = goTo

      measure()
      draggable = Draggable.create(track, {
        type: "x",
        trigger: viewport,
        bounds: { minX: -plan.maxOffset, maxX: 0 },
        inertia: true,
        edgeResistance: 0.85,
        minimumMovement: 6,
        allowContextMenu: true,
        snap: {
          x: (value: number) => -(stopOffsets[nearestIndex(-value, stopOffsets)] ?? 0),
        },
        onPress: () => {
          movedRef.current = false
          gsap.killTweensOf(track)
        },
        onDragStart: () => {
          movedRef.current = true
        },
        onDrag: () => {
          applyEffects()
          syncIndex()
        },
        onThrowUpdate: applyEffects,
        onThrowComplete: () => {
          applyEffects()
          syncIndex()
        },
        onRelease: () => {
          gsap.delayedCall(0.06, () => {
            movedRef.current = false
          })
        },
      })[0]

      const swallowClickAfterDrag = (event: Event): void => {
        if (!movedRef.current) return
        event.preventDefault()
        event.stopPropagation()
      }
      viewport.addEventListener("click", swallowClickAfterDrag, true)

      const settleAfterWheel = gsap.delayedCall(0.16, () => {
        goTo(nearestIndex(offsetNow(), stopOffsets))
      })
      settleAfterWheel.pause()

      const onWheel = (event: WheelEvent): void => {
        const sideways = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        const shifted = event.shiftKey && event.deltaY !== 0
        if (!sideways && !shifted) return
        event.preventDefault()
        const delta = sideways ? event.deltaX : event.deltaY
        gsap.killTweensOf(track)
        gsap.set(track, { x: -clamp(offsetNow() + delta, 0, plan.maxOffset) })
        applyEffects()
        syncIndex()
        settleAfterWheel.restart(true)
      }
      viewport.addEventListener("wheel", onWheel, { passive: false })

      const resizeObserver = new ResizeObserver(() => {
        measure()
        goTo(currentRef.current, { immediate: true, silent: true })
      })
      resizeObserver.observe(viewport)

      applyEffects()

      if (!reduced) {
        gsap.from(slides, {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: "top 88%", once: true },
        })
      }

      return () => {
        viewport.removeEventListener("click", swallowClickAfterDrag, true)
        viewport.removeEventListener("wheel", onWheel)
        settleAfterWheel.kill()
        resizeObserver.disconnect()
        draggable?.kill()
        ScrollTrigger.getAll()
          .filter((trigger) => trigger.trigger === root)
          .forEach((trigger) => trigger.kill())
      }
    },
    { scope: rootRef, dependencies: [items.length] },
  )

  useEffect(() => {
    if (activeIndex === undefined) return
    const stop = stopForItem(activeIndex, stopsRef.current, planRef.current.offsets)
    if (stop === currentRef.current) return
    goToRef.current(stop, { silent: true })
  }, [activeIndex, stopCount])

  const total = stopCount
  const atStart = current <= 0
  const atEnd = current >= total - 1

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      goToRef.current(stepIndex(currentRef.current, 1, total))
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      goToRef.current(stepIndex(currentRef.current, -1, total))
    } else if (event.key === "Home") {
      event.preventDefault()
      goToRef.current(0)
    } else if (event.key === "End") {
      event.preventDefault()
      goToRef.current(total - 1)
    }
  }

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
    >
      <p className="sr-only" aria-live="polite">
        {formatSlideLabel(current, total)}
      </p>

      <div
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="cursor-grab overflow-hidden outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] active:cursor-grabbing"
      >
        <ul ref={trackRef} className="flex w-max gap-4 sm:gap-6">
          {items.map((item, index) => (
            <li
              key={getKey(item)}
              data-slide
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${total}`}
              className={cn("shrink-0 basis-[min(84vw,26rem)]", slideClassName)}
            >
              {renderSlide(item, index)}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <div aria-hidden className="relative h-0.5 flex-1 overflow-hidden bg-[var(--lab-line)]">
          <span
            ref={progressRef}
            className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-[var(--lab-orange)]"
          />
        </div>
        <p className="font-mono text-xs tabular-nums text-[var(--lab-ink-soft)]" aria-hidden>
          {String(Math.min(current + 1, total)).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous slide"
            disabled={atStart}
            onClick={() => goToRef.current(stepIndex(currentRef.current, -1, total))}
            className="size-11 rounded-full border-[var(--lab-line-strong)] bg-transparent text-[var(--lab-ink)] hover:border-[var(--lab-orange)] hover:bg-[var(--lab-orange-soft)] hover:text-[var(--lab-orange)]"
          >
            <ArrowLeft aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next slide"
            disabled={atEnd}
            onClick={() => goToRef.current(stepIndex(currentRef.current, 1, total))}
            className="size-11 rounded-full border-[var(--lab-line-strong)] bg-transparent text-[var(--lab-ink)] hover:border-[var(--lab-orange)] hover:bg-[var(--lab-orange-soft)] hover:text-[var(--lab-orange)]"
          >
            <ArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  )
}
