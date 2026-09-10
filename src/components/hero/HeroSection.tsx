import { motion } from "motion/react"
import { ArrowDown, Github, Zap, ShieldCheck, Activity } from "lucide-react"
import { Button } from "#/components/ui/button"
import { HeroBackground } from "#/components/hero/HeroBackground"
import { WorkflowRail } from "#/components/hero/WorkflowRail"

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] overflow-hidden text-white"
    >
      <HeroBackground />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1100px] flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-8 sm:pt-32 lg:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="relative mx-auto max-w-3xl"
        >
          <h1 className="text-balance text-[44px] font-semibold leading-[1.02] tracking-tight text-white sm:text-[58px] lg:text-[76px]">
            From idea to
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent">
                shipped product.
              </span>
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-white/0 via-white/85 to-white/0"
              />
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-white/82 sm:text-[17px]">
            Me + the team. Automation, AI assistants, agentic systems, full
            web, full mobile. Brief in, working product out —
            production-grade, not prototypes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="font-mono bg-[var(--lab-bg)] !text-white hover:bg-[var(--lab-card-elevated)] border border-white/15"
            >
              <a href="#contact">
                Start a brief
                <ArrowDown className="size-4" aria-hidden />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="font-mono !text-white border border-white/30 bg-white/10 backdrop-blur hover:bg-white/20"
            >
              <a
                href="https://github.com/X90-labs"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="size-4" aria-hidden />
                GitHub
              </a>
            </Button>
          </div>

          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3">
            <Stat icon={Zap} value="< 24h" label="Brief reply" />
            <Stat icon={ShieldCheck} value="Fixed" label="Price scope" />
            <Stat icon={Activity} value="Weekly" label="Demo loop" />
          </div>

          <div className="mx-auto mt-12 max-w-2xl border-t border-white/15 pt-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                Process
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                Brief → Scope → Build → Ship
              </p>
            </div>
            <div className="mt-4 flex justify-center">
              <WorkflowRail />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Zap
  value: string
  label: string
}) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-left backdrop-blur">
      <div className="flex items-center gap-1.5 text-white/75">
        <Icon className="size-3" aria-hidden />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <p className="mt-1 text-[15px] font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  )
}
