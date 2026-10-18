import { useRef, type ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import { gsap, prefersReducedMotion, registerGsap } from "#/lib/gsap"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const node = ref.current
      if (!node || prefersReducedMotion()) return
      registerGsap()
      gsap.from(node, {
        opacity: 0,
        y: 28,
        duration: 0.8,
        delay,
        ease: "power3.out",
        clearProps: "opacity,transform",
        scrollTrigger: { trigger: node, start: "top 90%", once: true },
      })
    },
    { scope: ref, dependencies: [delay] },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
