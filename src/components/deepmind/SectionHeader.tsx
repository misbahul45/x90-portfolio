import { useRef, type ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import { gsap, prefersReducedMotion, registerGsap, SplitText } from "#/lib/gsap"
import { cn } from "#/lib/utils"

type SectionHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
  as?: "h1" | "h2"
  headingId?: string
  className?: string
}

export function SectionHeader({
  title,
  description,
  action,
  as: Heading = "h2",
  headingId,
  className,
}: SectionHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      const heading = headingRef.current
      if (!heading || prefersReducedMotion()) return
      registerGsap()
      SplitText.create(heading, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (split) =>
          gsap.from(split.lines, {
            yPercent: 110,
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: { trigger: heading, start: "top 90%", once: true },
          }),
      })
    },
    { scope: headingRef, dependencies: [title] },
  )

  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        <Heading id={headingId} ref={headingRef} className="dm-title">
          {title}
        </Heading>
        {description ? <p className="dm-subtitle mt-1">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
