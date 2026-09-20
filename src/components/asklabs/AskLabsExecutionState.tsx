import type { AskLabsStage } from "#/hooks/useAskLabs"

const STAGE_ORDER: AskLabsStage[] = ["analyzing", "retrieving", "reasoning", "responding"]

function stageIndex(stage: AskLabsStage): number {
  const i = STAGE_ORDER.indexOf(stage)
  return i < 0 ? -1 : i
}

export function AskLabsExecutionState({ stage }: { stage: AskLabsStage }) {
  if (stage === "idle" || stage === "completed" || stage === "error") return null
  const active = stageIndex(stage)
  return (
    <ul className="flex flex-col gap-2">
      {STAGE_ORDER.map((entry, index) => {
        const status = index < active ? "done" : index === active ? "active" : "upcoming"
        return (
          <li
            key={entry}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]"
          >
            <span
              aria-hidden
              className={`size-1.5 rounded-full ${
                status === "done"
                  ? "bg-[var(--lab-orange)]"
                  : status === "active"
                    ? "bg-[var(--lab-orange)]"
                    : "bg-[var(--lab-line-strong)]"
              }`}
              style={
                status === "active"
                  ? { boxShadow: "0 0 0 4px rgba(246,90,11,0.18)" }
                  : undefined
              }
            />
            <span
              className={
                status === "upcoming" ? "text-[var(--lab-ink-soft)]" : "text-[var(--lab-ink)]"
              }
            >
              {entry}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
