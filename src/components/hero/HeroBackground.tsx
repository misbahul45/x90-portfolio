import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"
import { useEffect, useMemo } from "react"

const BLOCK_LAYOUT = [
  { top: "7%", left: "5%", width: 180, height: 120, opacity: 0.06, accent: false },
  { top: "13%", left: "21%", width: 140, height: 84, opacity: 0.08, accent: true },
  { top: "18%", left: "75%", width: 200, height: 110, opacity: 0.05, accent: false },
  { top: "31%", left: "11%", width: 120, height: 60, opacity: 0.07, accent: false },
  { top: "37%", left: "84%", width: 150, height: 90, opacity: 0.06, accent: false },
  { top: "47%", left: "4%", width: 100, height: 140, opacity: 0.08, accent: false },
  { top: "53%", left: "62%", width: 160, height: 70, opacity: 0.07, accent: false },
  { top: "61%", left: "28%", width: 90, height: 60, opacity: 0.05, accent: false },
  { top: "69%", left: "78%", width: 120, height: 80, opacity: 0.08, accent: true },
  { top: "77%", left: "9%", width: 140, height: 70, opacity: 0.06, accent: false },
  { top: "81%", left: "44%", width: 110, height: 60, opacity: 0.05, accent: false },
  { top: "85%", left: "65%", width: 180, height: 60, opacity: 0.07, accent: false },
]

const PARTICLES = Array.from({ length: 34 }, (_, index) => ({
  left: `${(index * 29 + 7) % 100}%`,
  top: `${(index * 47 + 11) % 100}%`,
  size: 1 + (index % 3),
  duration: 3.5 + (index % 5) * 0.8,
  delay: (index % 7) * 0.35,
}))

export function HeroBackground() {
  const reducedMotion = useReducedMotion()

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)

  const smoothX = useSpring(pointerX, {
    stiffness: 55,
    damping: 20,
    mass: 0.7,
  })

  const smoothY = useSpring(pointerY, {
    stiffness: 55,
    damping: 20,
    mass: 0.7,
  })

  const gridX = useTransform(smoothX, [-0.5, 0.5], [-12, 12])
  const gridY = useTransform(smoothY, [-0.5, 0.5], [-8, 8])

  const glowX = useTransform(smoothX, [-0.5, 0.5], ["44%", "56%"])
  const glowY = useTransform(smoothY, [-0.5, 0.5], ["42%", "58%"])

  const orbitX = useTransform(smoothX, [-0.5, 0.5], [-18, 18])
  const orbitY = useTransform(smoothY, [-0.5, 0.5], [-10, 10])

  useEffect(() => {
    if (reducedMotion) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5

      pointerX.set(x)
      pointerY.set(y)
    }

    const handlePointerLeave = () => {
      pointerX.set(0)
      pointerY.set(0)
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    })

    window.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [pointerX, pointerY, reducedMotion])

  const circuitNodes = useMemo(
    () => [
      { x: 140, y: 120 },
      { x: 350, y: 120 },
      { x: 350, y: 220 },
      { x: 560, y: 220 },
      { x: 1060, y: 90 },
      { x: 1230, y: 90 },
      { x: 1230, y: 200 },
      { x: 1360, y: 200 },
      { x: 90, y: 650 },
      { x: 280, y: 650 },
      { x: 280, y: 735 },
      { x: 460, y: 735 },
      { x: 920, y: 610 },
      { x: 1100, y: 610 },
      { x: 1100, y: 710 },
      { x: 1270, y: 710 },
    ],
    [],
  )

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#08172A]" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 8%, rgba(246,90,11,0.34), transparent 70%), radial-gradient(55% 50% at 18% 36%, rgba(255,174,92,0.18), transparent 68%), radial-gradient(45% 45% at 84% 78%, rgba(217,77,8,0.24), transparent 70%)",
        }}
      />

      <motion.div
        className="absolute inset-[-6%] opacity-80"
        style={{
          x: gridX,
          y: gridY,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 78% 72% at 50% 48%, black 18%, transparent 82%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 78% 72% at 50% 48%, black 18%, transparent 82%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            maskImage:
              "radial-gradient(circle at 50% 45%, black, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 45%, black, transparent 72%)",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-[43%] size-[620px] -translate-x-1/2 -translate-y-1/2"
        style={{
          x: glowX,
          y: glowY,
        }}
      >
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  scale: [0.95, 1.05, 0.95],
                  opacity: [0.22, 0.42, 0.22],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(246,90,11,0.38),rgba(246,90,11,0.08)_38%,transparent_70%)] blur-3xl"
        />

        <div className="absolute left-1/2 top-1/2 size-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 24,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
          className="absolute left-1/2 top-1/2 size-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.09]"
        />

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: -360,
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 34,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
          className="absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]"
        />

        <motion.span
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 9,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
          className="absolute left-1/2 top-1/2 size-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 305deg, rgba(246,90,11,0.85) 335deg, rgba(255,190,110,1) 350deg, transparent 360deg)",
            maskImage:
              "linear-gradient(black, black) content-box, linear-gradient(black, black)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-x-[-10%] top-[18%] h-px"
        animate={
          reducedMotion
            ? undefined
            : {
                x: ["-8%", "8%", "-8%"],
                opacity: [0.05, 0.18, 0.05],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), rgba(246,90,11,0.42), rgba(255,255,255,0.16), transparent)",
        }}
      />

      <motion.div
        className="absolute inset-x-[-15%] top-[66%] h-px"
        animate={
          reducedMotion
            ? undefined
            : {
                x: ["10%", "-10%", "10%"],
                opacity: [0.03, 0.13, 0.03],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 11,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(246,90,11,0.4), rgba(255,255,255,0.1), rgba(246,90,11,0.4), transparent)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 1400 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="hero-line-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="45%" stopColor="white" stopOpacity="0.08" />
            <stop offset="55%" stopColor="#F65A0B" stopOpacity="0.42" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g
          fill="none"
          stroke="url(#hero-line-gradient)"
          strokeWidth="1"
        >
          <path d="M140 120H350V220H560" />
          <path d="M1060 90H1230V200H1360" />
          <path d="M90 650H280V735H460" />
          <path d="M920 610H1100V710H1270" />
        </g>

        <g fill="#F65A0B">
          {circuitNodes.map((node, index) => (
            <motion.circle
              key={`${node.x}-${node.y}`}
              cx={node.x}
              cy={node.y}
              r={index % 3 === 0 ? 2.5 : 1.8}
              animate={
                reducedMotion
                  ? undefined
                  : {
                      opacity: [0.25, 1, 0.25],
                    }
              }
              transition={
                reducedMotion
                  ? undefined
                  : {
                      duration: 2.4 + (index % 4) * 0.5,
                      delay: index * 0.12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />
          ))}
        </g>
      </svg>

      {BLOCK_LAYOUT.map((block, index) => (
        <motion.div
          key={`${block.top}-${block.left}`}
          className="absolute rounded-lg border border-white/[0.13] backdrop-blur-[2px]"
          style={{
            top: block.top,
            left: block.left,
            width: block.width,
            height: block.height,
            backgroundColor: block.accent
              ? "rgba(255, 210, 150, 0.08)"
              : `rgba(255,255,255,${block.opacity})`,
            x: useTransform(
              smoothX,
              [-0.5, 0.5],
              [-(index % 3) * 8, (index % 3) * 8],
            ),
            y: useTransform(
              smoothY,
              [-0.5, 0.5],
              [-(index % 4) * 5, (index % 4) * 5],
            ),
          }}
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, index % 2 === 0 ? -8 : 8, 0],
                  opacity: [
                    block.opacity,
                    block.opacity + 0.025,
                    block.opacity,
                  ],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 8 + (index % 5),
                  delay: index * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <div className="absolute inset-x-3 top-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-3 right-3 size-1 rounded-full bg-[var(--lab-orange)]/60" />
        </motion.div>
      ))}

      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: [0.05, 0.5, 0.05],
                  scale: [0.8, 1.4, 0.8],
                  y: [0, -10 - (index % 4) * 5, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 h-[180px] w-[680px] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-full"
        style={{
          x: orbitX,
          y: orbitY,
          background:
            "linear-gradient(90deg, transparent, rgba(246,90,11,0.18), rgba(255,220,180,0.08), transparent)",
          filter: "blur(22px)",
        }}
        animate={
          reducedMotion
            ? undefined
            : {
                rotate: ["-8deg", "-3deg", "-8deg"],
                opacity: [0.25, 0.6, 0.25],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      <div
        className="absolute inset-x-0 bottom-0 h-56"
        style={{
          background:
            "linear-gradient(to top, rgba(5,15,28,0.92), rgba(5,15,28,0.32), transparent)",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(246,90,11,0.22), rgba(255,255,255,0.18), rgba(246,90,11,0.22), transparent)",
        }}
      />
    </div>
  )
}