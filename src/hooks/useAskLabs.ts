import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { AskLabsSource } from "#/lib/ask-labs"

export type AskLabsPhase =
  | "idle"
  | "submitting"
  | "retrieving"
  | "generating"
  | "complete"
  | "error"
  | "stopped"

export type AskLabsMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: AskLabsSource[]
  intent?: string
  error?: boolean
  timestamp: number
}

export type AskLabsQuickAction = {
  id: string
  label: string
  prompt: string
}

export type AskLabsContextKind =
  | "none"
  | "home"
  | "projects-index"
  | "project"
  | "research-index"
  | "research"
  | "about"
  | "contact"

export type AskLabsContext = {
  route: string
  kind: AskLabsContextKind
  slug?: string
  title?: string
}

export function detectContextFromPath(path: string): AskLabsContext {
  const route = path || "/"
  const cleaned = route.split("?")[0]?.split("#")[0] ?? "/"
  const kind = detectKind(cleaned)
  let slug: string | undefined
  if (kind === "project" || kind === "research") {
    const parts = cleaned.split("/").filter(Boolean)
    slug = parts[1]
  }
  return { route, kind, slug }
}

function detectKind(path: string): AskLabsContextKind {
  if (path === "/" || path === "") return "home"
  if (path === "/projects" || path === "/projects/") return "projects-index"
  if (path.startsWith("/projects/")) return "project"
  if (path === "/research" || path === "/research/") return "research-index"
  if (path.startsWith("/research/")) return "research"
  if (path.startsWith("/about")) return "about"
  if (path.startsWith("/contact") || path === "/#contact") return "contact"
  return "none"
}

const QUICK_ACTIONS: Record<AskLabsContextKind, AskLabsQuickAction[]> = {
  home: [
    { id: "what-builds", label: "What does XNINETZY build?", prompt: "What does XNINETZY Labs actually build?" },
    { id: "research", label: "What research is here?", prompt: "What research has XNINETZY published?" },
    { id: "ai", label: "What AI systems can you build?", prompt: "What kinds of AI systems can XNINETZY build?" },
    { id: "start", label: "Where should I start?", prompt: "If I'm new here, where should I start?" },
  ],
  "projects-index": [
    { id: "find-project", label: "Find a relevant project", prompt: "Help me find a project relevant to what I'm exploring." },
    { id: "ai-projects", label: "Which projects use AI?", prompt: "Which projects use AI agents or RAG?" },
    { id: "explain-stack", label: "How is the stack chosen?", prompt: "How does XNINETZY choose the stack for a project?" },
    { id: "start", label: "Where should I start?", prompt: "Which project should I look at first?" },
  ],
  project: [
    { id: "what-problem", label: "What problem does this solve?", prompt: "What problem does this project solve?" },
    { id: "arch", label: "Architecture & stack", prompt: "What architecture and stack does this project use?" },
    { id: "research", label: "Related research", prompt: "What research is related to this project?" },
    { id: "similar", label: "Can you build something similar?", prompt: "Could XNINETZY build something similar for our team?" },
  ],
  "research-index": [
    { id: "latest", label: "Latest investigations", prompt: "What are the latest investigations in the lab?" },
    { id: "methods", label: "How is research evaluated?", prompt: "How does research at XNINETZY get evaluated?" },
    { id: "themes", label: "Active research themes", prompt: "What research themes is XNINETZY currently exploring?" },
    { id: "apply", label: "Apply research to a system", prompt: "How would I apply this research to a real system?" },
  ],
  research: [
    { id: "question", label: "What was the question?", prompt: "What question was this research trying to answer?" },
    { id: "method", label: "Method & evidence", prompt: "How was this research carried out, and what is the evidence?" },
    { id: "findings", label: "Findings & limits", prompt: "What did they learn, and what are the limitations?" },
    { id: "projects", label: "Which projects apply this?", prompt: "Which projects apply the findings from this research?" },
  ],
  about: [
    { id: "who", label: "Who is behind this?", prompt: "Who is behind XNINETZY Labs?" },
    { id: "stack", label: "Public stack", prompt: "What public stack does XNINETZY work with?" },
    { id: "approach", label: "How do engagements work?", prompt: "How does XNINETZY run an engagement?" },
  ],
  contact: [
    { id: "brief", label: "How do I write a brief?", prompt: "How should I structure a brief before contacting XNINETZY?" },
    { id: "services", label: "Which service fits?", prompt: "Which service should I pick for my situation?" },
  ],
  none: [
    { id: "what-builds", label: "What does XNINETZY build?", prompt: "What does XNINETZY Labs actually build?" },
    { id: "research", label: "What research is here?", prompt: "What research has XNINETZY published?" },
    { id: "ai", label: "What AI systems can you build?", prompt: "What kinds of AI systems can XNINETZY build?" },
  ],
}

const LANDING_QUESTION =
  "Ask about what XNINETZY builds, what it investigates, and how its systems are engineered."

type StreamChunk =
  | { type: "stage"; stage: "analyzing" | "retrieving" | "reasoning" | "responding" }
  | { type: "sources"; sources: AskLabsSource[] }
  | { type: "intent"; intent: string; routeKind: string }
  | { type: "token"; text: string }
  | { type: "done"; ok: true }
  | { type: "error"; message: string }

const STAGE_TO_PHASE: Record<"analyzing" | "retrieving" | "reasoning" | "responding", AskLabsPhase> = {
  analyzing: "submitting",
  retrieving: "retrieving",
  reasoning: "generating",
  responding: "generating",
}

const PHASE_LABEL: Record<AskLabsPhase, string> = {
  idle: "",
  submitting: "Submitting…",
  retrieving: "Finding sources…",
  generating: "Generating answer…",
  complete: "Done",
  error: "Something went wrong.",
  stopped: "Stopped.",
}

async function consumeSSE(
  body: ReadableStream<Uint8Array> | null,
  onChunk: (chunk: StreamChunk) => void,
  signal: AbortSignal,
): Promise<void> {
  if (!body) return
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split("\n\n")
      buffer = events.pop() ?? ""
      for (const event of events) {
        const line = event.trim()
        if (!line.startsWith("data:")) continue
        const payload = line.slice(5).trim()
        if (!payload) continue
        try {
          onChunk(JSON.parse(payload) as StreamChunk)
        } catch {
          continue
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function useAskLabs(currentPath: string) {
  const [context, setContext] = useState<AskLabsContext>(() => detectContextFromPath(currentPath))
  const [messages, setMessages] = useState<AskLabsMessage[]>([])
  const [phase, setPhase] = useState<AskLabsPhase>("idle")
  const [isOpen, setIsOpen] = useState(false)
  const [showTrace, setShowTrace] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const stuckAtBottomRef = useRef(true)

  useEffect(() => {
    setContext(detectContextFromPath(currentPath))
  }, [currentPath])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const quickActions = useMemo(() => QUICK_ACTIONS[context.kind] ?? QUICK_ACTIONS.none, [context.kind])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setPhase("idle")
    setShowTrace(false)
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setPhase("stopped")
  }, [])

  const submit = useCallback(
    async (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return

      const userMessage: AskLabsMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      }
      const assistantId = `assistant-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
      ])

      const controller = new AbortController()
      abortRef.current?.abort()
      abortRef.current = controller

      const historySnapshot = messages.slice(-6).map((entry) => ({
        role: entry.role,
        content: entry.content,
      }))

      setPhase("submitting")

      try {
        const response = await fetch("/api/ask-labs/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            prompt: trimmed,
            route: context.route,
            slug: context.slug,
            history: historySnapshot,
          }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          const message = await response.text().catch(() => "")
          throw new Error(message || `Ask Labs request failed (${response.status})`)
        }

        await consumeSSE(
          response.body,
          (chunk) => {
            if (chunk.type === "stage") {
              setPhase(STAGE_TO_PHASE[chunk.stage] ?? "generating")
            } else if (chunk.type === "intent") {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, intent: chunk.intent } : m)),
              )
            } else if (chunk.type === "sources") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, sources: [...(m.sources ?? []), ...chunk.sources] }
                    : m,
                ),
              )
            } else if (chunk.type === "token") {
              setPhase("generating")
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: `${m.content}${chunk.text}` } : m,
                ),
              )
            } else if (chunk.type === "done") {
              setPhase("complete")
            } else if (chunk.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId && m.content === ""
                    ? {
                        ...m,
                        content: "Ask Labs could not complete this answer. Browse the projects and research pages directly.",
                        error: true,
                      }
                    : m,
                ),
              )
              setPhase("error")
            }
          },
          controller.signal,
        )
      } catch (error) {
        if (controller.signal.aborted) {
          setPhase("stopped")
          return
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.content === ""
              ? {
                  ...m,
                  content:
                    error instanceof Error
                      ? `Ask Labs could not reach the server. (${error.message})`
                      : "Ask Labs could not reach the server.",
                  error: true,
                }
              : m,
          ),
        )
        setPhase("error")
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
        }
      }
    },
    [context, messages],
  )

  const onScrollerScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    stuckAtBottomRef.current = distance < 80
  }, [])

  const phaseLabel = PHASE_LABEL[phase]
  const isStreaming = phase === "submitting" || phase === "retrieving" || phase === "generating"

  return {
    context,
    messages,
    phase,
    isStreaming,
    phaseLabel,
    isOpen,
    setIsOpen,
    showTrace,
    setShowTrace,
    quickActions,
    submit,
    reset,
    stop,
    landingQuestion: LANDING_QUESTION,
    scrollerRef,
    onScrollerScroll,
    stuckAtBottomRef,
  }
}
