import { useCallback, useMemo, useState } from "react"
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, CornerDownLeft, Sparkles } from "lucide-react"
import { Button } from "#/components/ui/button"
import { BriefNode, type BriefNodeData, type BriefNodeStatus } from "#/components/hero/BriefNode"
import {
  AI_CAPABILITIES,
  AUDIENCE_OPTIONS,
  INTERNAL_USERS,
  MOBILE_PLATFORMS,
  PRIORITY_OPTIONS,
  PROJECT_OPTIONS,
  SUGGESTED_PROMPTS,
  STEPS,
  type BriefState,
  type StepId,
} from "#/components/hero/brief-data"
import { cn } from "#/lib/utils"

const nodeTypes = { brief: BriefNode }

const NODE_POSITIONS: Record<StepId, { x: number; y: number }> = {
  project: { x: 180, y: 0 },
  problem: { x: 30, y: 200 },
  audience: { x: 330, y: 200 },
  priorities: { x: 30, y: 400 },
  success: { x: 330, y: 400 },
}

const EDGE_LIST: ReadonlyArray<{ from: StepId; to: StepId }> = [
  { from: "project", to: "problem" },
  { from: "project", to: "audience" },
  { from: "problem", to: "priorities" },
  { from: "audience", to: "priorities" },
  { from: "priorities", to: "success" },
]

const INITIAL_STATE: BriefState = {
  projectType: null,
  problem: "",
  audience: null,
  priorities: [],
  success: "",
}

type StatusMap = Record<StepId, BriefNodeStatus>

export function BriefBuilder() {
  const [state, setState] = useState<BriefState>(INITIAL_STATE)
  const [submitted, setSubmitted] = useState(false)

  const update = useCallback(
    <K extends keyof BriefState>(key: K, value: BriefState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const submit = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSubmitted(true)
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
    setSubmitted(false)
  }, [])

  const progress = useMemo(() => {
    let filled = 0
    if (state.projectType) filled += 1
    if (state.problem.trim().length > 0) filled += 1
    if (state.audience) filled += 1
    if (state.priorities.length > 0) filled += 1
    if (state.success.trim().length > 0) filled += 1
    return filled
  }, [state])

  const isStepComplete = useCallback(
    (id: StepId): boolean => {
      switch (id) {
        case "project":
          return Boolean(state.projectType)
        case "problem":
          return state.problem.trim().length > 0
        case "audience":
          return Boolean(state.audience)
        case "priorities":
          return state.priorities.length > 0
        case "success":
          return state.success.trim().length > 0
      }
    },
    [state],
  )

  const status: StatusMap = useMemo(() => {
    const next: StatusMap = {
      project: "upcoming",
      problem: "upcoming",
      audience: "upcoming",
      priorities: "upcoming",
      success: "upcoming",
    }
    if (submitted) {
      STEPS.forEach((step) => {
        next[step.id] = "completed"
      })
      return next
    }
    const order: StepId[] = ["project", "problem", "audience", "priorities", "success"]
    let activeFound = false
    for (const id of order) {
      if (isStepComplete(id)) continue
      if (!activeFound) {
        next[id] = "active"
        activeFound = true
      } else {
        next[id] = "upcoming"
      }
    }
    return next
  }, [isStepComplete, submitted])

  const nodes = useMemo<Node<BriefNodeData>[]>(
    () =>
      STEPS.map((step) => ({
        id: step.id,
        type: "brief",
        position: NODE_POSITIONS[step.id],
        data: {
          index: step.index,
          title: step.title,
          prompt: step.prompt,
          hint: step.hint,
          status: status[step.id],
          render: <NodeBody stepId={step.id} state={state} update={update} />,
        },
      })),
    [status, state, update],
  )

  const edges = useMemo<Edge[]>(
    () =>
      EDGE_LIST.map((edge, idx) => {
        const active =
          status[edge.from] === "completed" && status[edge.to] !== "upcoming"
        return {
          id: `e-${idx}`,
          source: edge.from,
          target: edge.to,
          animated: active && !submitted,
          style: {
            stroke: active ? "#F65A0B" : "rgba(15, 23, 42, 0.18)",
            strokeWidth: active ? 1.5 : 1,
            opacity: active ? 0.9 : 0.5,
          },
        }
      }),
    [status, submitted],
  )

  const activeStep = useMemo(
    () => STEPS.find((step) => status[step.id] === "active"),
    [status],
  )

  return (
    <div className="relative w-full overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_40px_100px_-24px_rgba(7,21,38,0.35),0_0_0_1px_rgba(255,255,255,0.6)_inset]">
      <div className="flex items-center justify-between border-b border-slate-100 bg-white/90 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3 text-[10.5px] font-medium uppercase tracking-[0.2em] text-slate-500">
          <span className="text-slate-700">Brief Builder</span>
          <span className="font-mono text-orange-500">{progress}/5</span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400 transition-all hover:text-slate-700"
        >
          Reset
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-2.5">
        {STEPS.map((step, idx) => {
          const stepStatus = status[step.id]
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold transition-all",
                  stepStatus === "completed"
                    ? "border-orange-500 bg-orange-500 text-white"
                    : stepStatus === "active"
                      ? "border-orange-500 bg-orange-500 text-white shadow-[0_0_0_3px_rgba(246,90,10,0.18)]"
                      : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {step.index}
              </div>
              <span
                className={cn(
                  "text-[10.5px] font-medium uppercase tracking-[0.16em]",
                  stepStatus === "active"
                    ? "text-slate-900"
                    : stepStatus === "completed"
                      ? "text-[#D94D08]"
                      : "text-slate-400",
                )}
              >
                {step.title}
              </span>
              {idx < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "ml-2 h-px w-5",
                    stepStatus === "completed"
                      ? "bg-orange-400/60"
                      : "bg-slate-200",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="relative h-[560px] w-full bg-[linear-gradient(180deg,#ffffff_0%,#fafaf7_100%)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 0%, rgba(246,90,10,0.04), transparent 40%), radial-gradient(circle at 80% 100%, rgba(246,90,10,0.05), transparent 40%)",
          }}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.7}
          maxZoom={1.1}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
        >
          <Background gap={28} size={1} color="rgba(15,23,42,0.05)" />
        </ReactFlow>

        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.32 }}
              className="absolute inset-x-6 bottom-6 rounded-2xl border border-[rgba(246,90,11,0.40)] bg-orange-50/95 p-5 shadow-[0_18px_40px_-12px_rgba(246,90,11,0.25)] backdrop-blur"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-orange-500/15 text-[#D94D08]">
                    <Sparkles className="size-3.5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#D94D08]">
                      Brief captured
                    </p>
                    <h4 className="mt-1 text-sm font-semibold leading-tight text-slate-900">
                      Your project direction is clear.
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      We'll turn your brief into a clear scope, technical plan,
                      and the next step.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="font-mono">
                  <a href="#contact">
                    Send to founder
                    <ArrowRight className="size-3.5" aria-hidden />
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!submitted && progress === 0 && (
        <div className="border-t border-slate-100 bg-white/95 px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
            Try a sample
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => {
                    update("projectType", "ai")
                    update("problem", prompt)
                    update("audience", "customers")
                    update("priorities", ["ai", "ux"])
                  }}
                  className="transition-colors hover:text-orange-600"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!submitted && progress > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-white/95 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                animate={{ width: `${(progress / 5) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
              />
            </div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-500">
              {activeStep?.title ?? "Done"}
            </p>
          </div>
          <Button
            type="button"
            disabled={progress < 5}
            onClick={submit}
            size="sm"
            className="font-mono"
          >
            Build the scope
            <CornerDownLeft className="size-3.5" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  )
}

function NodeBody({
  stepId,
  state,
  update,
}: {
  stepId: StepId
  state: BriefState
  update: <K extends keyof BriefState>(key: K, value: BriefState[K]) => void
}) {
  switch (stepId) {
    case "project":
      return (
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_OPTIONS.map((opt) => (
            <Chip
              key={opt.key}
              active={state.projectType === opt.key}
              onClick={() => update("projectType", opt.key)}
            >
              <opt.icon className="size-3" aria-hidden />
              {opt.label}
            </Chip>
          ))}
        </div>
      )
    case "problem":
      return (
        <div className="space-y-2">
          <textarea
            value={state.problem}
            onChange={(event) => update("problem", event.target.value)}
            placeholder="Describe the problem in one or two sentences."
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15"
          />
          {state.projectType === "ai" && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
              {AI_CAPABILITIES.map((cap) => (
                <Chip key={cap.key} muted>
                  <cap.icon className="size-3" aria-hidden />
                  {cap.label}
                </Chip>
              ))}
            </div>
          )}
          {state.projectType === "mobile" && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
              {MOBILE_PLATFORMS.map((opt) => (
                <Chip key={opt.key} muted>
                  {opt.label}
                </Chip>
              ))}
            </div>
          )}
          {state.projectType === "internal" && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
              {INTERNAL_USERS.map((opt) => (
                <Chip key={opt.key} muted>
                  {opt.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )
    case "audience":
      return (
        <div className="flex flex-wrap gap-1.5">
          {AUDIENCE_OPTIONS.map((opt) => (
            <Chip
              key={opt.key}
              active={state.audience === opt.key}
              onClick={() => update("audience", opt.key)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      )
    case "priorities":
      return (
        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_OPTIONS.map((opt) => {
            const active = state.priorities.includes(opt.key)
            return (
              <Chip
                key={opt.key}
                active={active}
                onClick={() => {
                  const next = active
                    ? state.priorities.filter((item) => item !== opt.key)
                    : [...state.priorities, opt.key]
                  update("priorities", next)
                }}
              >
                {opt.label}
              </Chip>
            )
          })}
        </div>
      )
    case "success":
      return (
        <textarea
          value={state.success}
          onChange={(event) => update("success", event.target.value)}
          placeholder="A metric, a moment, or an outcome you'd celebrate."
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15"
        />
      )
  }
}

function Chip({
  active = false,
  muted = false,
  onClick,
  children,
}: {
  active?: boolean
  muted?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium transition-all",
        active
          ? "border-orange-500 bg-orange-50 text-orange-600"
          : muted
            ? "border-slate-200/60 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:border-orange-500/40 hover:text-orange-600",
      )}
    >
      {children}
    </button>
  )
}
