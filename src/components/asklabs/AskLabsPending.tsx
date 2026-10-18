import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { Check } from "lucide-react"
import type { AskLabsPhase } from "#/hooks/useAskLabs"
import { gsap, prefersReducedMotion } from "#/lib/gsap"
import { cn } from "#/lib/utils"

type StepState = "done" | "active" | "waiting"

const STEPS = [
  { id: "read", label: "Reading your question" },
  { id: "search", label: "Searching projects and research" },
  { id: "write", label: "Writing the answer" },
] as const

const PHASE_STEP: Partial<Record<AskLabsPhase, number>> = {
  submitting: 0,
  retrieving: 1,
  generating: 2,
}

const SKELETON_WIDTHS = ["w-full", "w-[88%]", "w-[64%]"] as const

function stepState(index: number, active: number): StepState {
  if (index < active) return "done"
  return index === active ? "active" : "waiting"
}

function StepMarker({ state }: { state: StepState }) {
  if (state === "done") {
    return <Check className="size-3.5 text-[var(--lab-orange)]" strokeWidth={2.5} aria-hidden />
  }
  if (state === "active") {
    return (
      <span aria-hidden className="relative flex size-2.5">
        <span className="absolute inset-0 rounded-full bg-[var(--lab-orange)] motion-safe:animate-ping" />
        <span className="relative size-2.5 rounded-full bg-[var(--lab-orange)]" />
      </span>
    )
  }
  return <span aria-hidden className="size-1.5 rounded-full border border-[var(--lab-line-strong)]" />
}

export function AskLabsPending({ phase }: { phase?: AskLabsPhase }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const active = phase ? PHASE_STEP[phase] : undefined

  useGSAP(
    () => {
      if (active === undefined || prefersReducedMotion()) return
      gsap.fromTo(
        "[data-step-state='active'] [data-step-label]",
        { x: -8, opacity: 0.3 },
        { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      )
    },
    { scope: rootRef, dependencies: [active] },
  )

  useGSAP(
    () => {
      if (active === undefined || prefersReducedMotion()) return
      gsap.from("[data-skeleton-line]", {
        scaleX: 0.35,
        opacity: 0,
        transformOrigin: "left center",
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
      })
    },
    { scope: rootRef, dependencies: [active === undefined] },
  )

  if (active === undefined) {
    return <p className="text-sm text-[var(--lab-ink-soft)]">Stopped before an answer was written.</p>
  }

  return (
    <div ref={rootRef} role="status" aria-live="polite" className="w-80 max-w-full space-y-5">
      <ol className="space-y-2.5">
        {STEPS.map((step, index) => {
          const state = stepState(index, active)
          return (
            <li
              key={step.id}
              data-step-state={state}
              className="flex items-center gap-3 text-sm"
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                <StepMarker state={state} />
              </span>
              <span
                data-step-label
                className={cn(
                  "transition-colors duration-300",
                  state === "active" && "text-[var(--lab-ink)]",
                  state === "done" && "text-[var(--lab-ink-soft)]",
                  state === "waiting" && "text-[var(--lab-ink-soft)]/50",
                )}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
      <div aria-hidden className="space-y-2.5">
        {SKELETON_WIDTHS.map((width) => (
          <span
            key={width}
            data-skeleton-line
            className={cn(
              "block h-2.5 rounded-full bg-[linear-gradient(90deg,var(--lab-line)_0%,var(--lab-line-strong)_50%,var(--lab-line)_100%)] bg-[length:200%_100%] motion-safe:animate-[lab-shimmer_1.8s_ease-in-out_infinite]",
              width,
            )}
          />
        ))}
      </div>
    </div>
  )
}
