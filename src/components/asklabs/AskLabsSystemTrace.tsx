import type { AskLabsContext, AskLabsMessage, AskLabsPhase } from "#/hooks/useAskLabs"

const PHASE_ORDER: AskLabsPhase[] = ["submitting", "retrieving", "generating", "complete", "stopped", "error"]

export function AskLabsSystemTrace({
  context,
  messages,
  phase,
}: {
  context: AskLabsContext
  messages: AskLabsMessage[]
  phase: AskLabsPhase
}) {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
  const sourceCount = lastAssistant?.sources?.length ?? 0
  const turnCount = messages.filter((m) => m.role === "user").length
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--lab-line)] px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--lab-orange)]">System trace</p>
        <p className="mt-1 text-[11px] leading-snug text-[var(--lab-ink-soft)]">
          Secondary diagnostics. Toggle from the header to hide.
        </p>
      </header>
      <div className="flex-1 overflow-y-auto p-4 text-[12px] leading-relaxed text-[var(--lab-ink-soft)]">
        <Section label="Phase">
          <ul className="space-y-1.5">
            {PHASE_ORDER.map((entry) => (
              <li key={entry} className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em]">
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${
                    phase === entry ? "bg-[var(--lab-orange)]" : "bg-[var(--lab-line-strong)]"
                  }`}
                />
                <span className={phase === entry ? "text-[var(--lab-ink)]" : ""}>{entry}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section label="Context">
          <dl className="space-y-1.5">
            <Row k="route" v={context.route} />
            {context.slug ? <Row k="slug" v={context.slug} /> : null}
            <Row k="kind" v={context.kind} />
          </dl>
        </Section>
        <Section label="Conversation">
          <dl className="space-y-1.5">
            <Row k="turns" v={String(turnCount)} />
            <Row k="sources" v={String(sourceCount)} />
            <Row k="intent" v={lastAssistant?.intent ?? "—"} />
          </dl>
        </Section>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--lab-ink-soft)]/70">
        {label}
      </p>
      {children}
    </section>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]/70">{k}</dt>
      <dd className="font-mono text-[11px] text-[var(--lab-ink)] truncate">{v}</dd>
    </div>
  )
}
