import { motion, useReducedMotion, type Variants } from "motion/react"
import { Button } from "#/components/ui/button"
import { HeroBackground } from "#/components/hero/HeroBackground"
import { WorkflowRail } from "#/components/hero/WorkflowRail"

const reveal: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    filter: "blur(12px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
}

const sequence: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

export function HeroSection() {
  const reducedMotion = useReducedMotion()

  return (
    <section
      id="top"
      className="relative isolate min-h-svh overflow-hidden text-white"
    >
      <HeroBackground />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-40 bg-linear-to-b from-[#071426]/35 via-transparent to-transparent" />

      <motion.div
        variants={sequence}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex min-h-svh w-full max-w-295 flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-8 sm:pt-32 lg:pt-36"
      >
        <motion.div
          variants={reveal}
          className="mb-8 flex items-center gap-4"
        >
          <span className="h-px w-10 bg-linear-to-r from-transparent to-white/30 sm:w-16" />
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/45 sm:text-[10px]">
            Intelligent Systems
          </span>
          <span className="h-px w-10 bg-linear-to-l from-transparent to-white/30 sm:w-16" />
        </motion.div>

        <motion.div
          variants={reveal}
          className="relative mx-auto max-w-240"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[35%] h-75 w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(246,90,11,0.1),transparent_68%)] blur-[80px]"
          />

          <h1 className="relative text-balance text-[44px] font-semibold leading-[0.98] tracking-[-0.05em] text-white sm:text-[60px] lg:text-[84px]">
            From idea to
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-white via-white to-white/75 bg-clip-text text-transparent">
                shipped product.
              </span>

              <motion.span
                aria-hidden
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: "100%",
                  opacity: 1,
                }}
                transition={{
                  duration: 1,
                  delay: 0.65,
                  ease: "easeOut",
                }}
                className="absolute -bottom-2.25 left-0 h-0.5 overflow-hidden bg-linear-to-r from-transparent via-white/90 to-transparent sm:-bottom-2.75"
              >
                <motion.span
                  className="absolute inset-y-0 left-0 w-1/3 bg-white blur-[3px]"
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          x: ["-120%", "380%"],
                        }
                  }
                  transition={
                    reducedMotion
                      ? undefined
                      : {
                          duration: 2.6,
                          repeat: Infinity,
                          ease: "linear",
                          repeatDelay: 0.8,
                        }
                  }
                />
              </motion.span>
            </span>
          </h1>

          <motion.div
            aria-hidden
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              duration: 1,
              delay: 0.95,
              ease: "easeOut",
            }}
            className="mx-auto mt-8 h-px max-w-140 origin-center bg-linear-to-r from-transparent via-white/20 to-transparent"
          />

          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-[1.85] text-white/72 sm:text-[17px]">
            Me + the team. Automation, AI assistants, agentic systems, full
            web, full mobile. Brief in, working product out —
            production-grade, not prototypes.
          </p>

          <motion.div
            variants={reveal}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="group h-11 rounded-lg border border-white/15 bg-[#071426]/85 px-5 font-mono text-sm text-white! shadow-[0_14px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-[#0b1a30]"
            >
              <a href="#contact">
                Start a brief
                <span className="ml-2 inline-block h-px w-4 bg-white/45 align-middle transition-all duration-300 group-hover:w-7 group-hover:bg-white/80" />
              </a>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="group h-11 rounded-lg border border-white/20 bg-white/6 px-5 font-mono text-sm text-white! backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10"
            >
              <a
                href="https://github.com/misbahul45"
                target="_blank"
                rel="noreferrer"
              >
                Founder
                <span className="ml-2 inline-block h-px w-4 bg-white/30 align-middle transition-all duration-300 group-hover:w-7 group-hover:bg-white/75" />
              </a>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="group h-11 rounded-lg border border-white/20 bg-white/6 px-5 font-mono text-sm text-white! backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10"
            >
              <a
                href="https://github.com/X90-labs"
                target="_blank"
                rel="noreferrer"
              >
                X90 Labs
                <span className="ml-2 inline-block h-px w-4 bg-white/30 align-middle transition-all duration-300 group-hover:w-7 group-hover:bg-white/75" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={sequence}
            className="mx-auto mt-10 grid max-w-155 grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3"
          >
            <Stat value="< 24h" label="Brief reply" />
            <Stat value="Fixed" label="Price scope" />
            <Stat value="Weekly" label="Demo loop" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={reveal}
          className="mx-auto mt-12 w-full max-w-3xl border-t border-white/12 pt-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
              Delivery loop
            </p>

            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 sm:text-[10px]">
              Brief → Scope → Build → Ship
            </p>
          </div>

          <div className="mx-auto mt-4 max-w-2xl">
            <WorkflowRail />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-5 left-1/2 z-30 -translate-x-1/2"
        animate={
          reducedMotion
            ? undefined
            : {
                y: [0, 5, 0],
                opacity: [0.25, 0.65, 0.25],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30">
            Scroll
          </span>
          <div className="h-7 w-px bg-linear-to-b from-white/35 to-transparent" />
        </div>
      </motion.div>
    </section>
  )
}

function Stat({
  value,
  label,
}: {
  value: string
  label: string
}) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      variants={reveal}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -4,
            }
      }
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="group relative overflow-hidden bg-black/12 px-4 py-3 text-left backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
          {label}
        </p>

        <p className="mt-2 text-[16px] font-semibold tracking-tight text-white">
          {value}
        </p>
      </div>
    </motion.div>
  )
}