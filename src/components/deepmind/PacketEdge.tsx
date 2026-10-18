import { useRef } from "react"
import { getBezierPath, type Edge, type EdgeProps } from "@xyflow/react"
import { useGSAP } from "@gsap/react"
import { gsap, prefersReducedMotion } from "#/lib/gsap"

export type PacketEdgeData = {
  active: boolean
  duration?: number
  delay?: number
}

export type PacketEdgeType = Edge<PacketEdgeData, "packet">

export function PacketEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps<PacketEdgeType>) {
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const pathRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const active = data?.active ?? false
  const duration = data?.duration ?? 1.3
  const delay = data?.delay ?? 0

  useGSAP(
    () => {
      const pathElement = pathRef.current
      const dot = dotRef.current
      if (!pathElement || !dot) return
      if (!active || prefersReducedMotion()) {
        gsap.set(dot, { opacity: 0 })
        return
      }
      const length = pathElement.getTotalLength()
      const progress = { value: 0 }
      gsap.set(dot, { opacity: 1 })
      gsap.to(progress, {
        value: 1,
        duration,
        delay,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 0.25,
        onUpdate: () => {
          const point = pathElement.getPointAtLength(progress.value * length)
          dot.setAttribute("cx", String(point.x))
          dot.setAttribute("cy", String(point.y))
        },
      })
    },
    { dependencies: [active, path, duration, delay] },
  )

  return (
    <g>
      <path
        ref={pathRef}
        d={path}
        fill="none"
        data-flow-path
        className="react-flow__edge-path"
        style={style}
      />
      <circle ref={dotRef} r={4} opacity={0} fill="var(--lab-orange)" />
    </g>
  )
}
