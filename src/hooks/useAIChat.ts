import { useCallback, useEffect, useRef, useState } from "react"
import {
  extractDocument,
  summarizeContext,
} from "#/lib/document-loader"
import {
  clearAttachment,
  loadActiveAttachment,
  saveAttachment,
  type PersistedAttachment,
} from "#/lib/attachment-store"

export type AIExecutionStage =
  | "idle"
  | "analyzing"
  | "retrieving"
  | "reasoning"
  | "responding"
  | "completed"

export type AIQuickAction = {
  id: string
  label: string
  prompt: string
}

export type AIContext = {
  currentPath: string
  pageType: "home" | "research" | "project" | "about"
  articleId?: string
  projectId?: string
  title?: string
}

export type AIAttachment = {
  name: string
  size: number
  mimeType: string
  pageCount?: number
  context: string
}

export type AIRelatedArticle = {
  id: string
  title: string
  slug: string
  url: string
  category: string | null
  score: number
}

export type AIMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  stage?: AIExecutionStage
  related?: AIRelatedArticle[]
  timestamp: number
}

const DEFAULT_QUICK_ACTIONS: Record<AIContext["pageType"], AIQuickAction[]> = {
  home: [
    { id: "what", label: "What does XNINETZY Labs build?", prompt: "What does XNINETZY Labs build?" },
    { id: "research", label: "Show me your research", prompt: "Show me your latest research." },
    { id: "collab", label: "How can we work together?", prompt: "How can we collaborate?" },
    { id: "systems", label: "What AI systems do you build?", prompt: "What kinds of AI systems do you build?" },
  ],
  research: [
    { id: "explain", label: "Explain this research", prompt: "Explain this research in plain English." },
    { id: "findings", label: "Key findings?", prompt: "What are the key findings of this research?" },
    { id: "related", label: "Related research", prompt: "Show me related research." },
    { id: "implement", label: "How could this be implemented?", prompt: "How could this be implemented in production?" },
  ],
  project: [
    { id: "arch", label: "Architecture?", prompt: "What architecture does this project use?" },
    { id: "problem", label: "What problem does it solve?", prompt: "What problem does this project solve?" },
    { id: "similar", label: "Can you build something similar?", prompt: "Can you build something similar for our team?" },
  ],
  about: [
    { id: "team", label: "Who is on the team?", prompt: "Who is on the team?" },
    { id: "stack", label: "Tech stack?", prompt: "What tech stack do you use?" },
    { id: "join", label: "How do I join?", prompt: "How can I work with the team?" },
  ],
}

function detectPageType(path: string): AIContext["pageType"] {
  if (path === "/" || path === "") return "home"
  if (path.startsWith("/research")) return "research"
  if (path.startsWith("/projects")) return "project"
  if (path.startsWith("/about")) return "about"
  return "home"
}

function detectContext(path: string): AIContext {
  return {
    currentPath: path,
    pageType: detectPageType(path),
  }
}

type StreamChunk =
  | { type: "stage"; stage: AIExecutionStage }
  | { type: "token"; text: string }
  | { type: "done"; ok: true }
  | { type: "error"; message: string }

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

export function useAIChat(currentPath: string) {
  const [context] = useState<AIContext>(() => detectContext(currentPath))
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [stage, setStage] = useState<AIExecutionStage>("idle")
  const [isOpen, setIsOpen] = useState(false)
  const [attachment, setAttachment] = useState<AIAttachment | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const quickActions = DEFAULT_QUICK_ACTIONS[context.pageType]

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setAttachment(null)
    setUploadError(null)
    void clearAttachment()
    setStage("idle")
  }, [])

  useEffect(() => {
    let cancelled = false
    void loadActiveAttachment()
      .then((stored) => {
        if (cancelled || !stored) return
        setAttachment({
          name: stored.name,
          size: stored.size,
          mimeType: stored.mimeType,
          pageCount: stored.pageCount,
          context: stored.context,
        })
      })
      .catch(() => {
        // IndexedDB unavailable — operate without persistence.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStage("idle")
  }, [])

  const removeAttachment = useCallback(() => {
    setAttachment(null)
    setUploadError(null)
    void clearAttachment()
  }, [])

  const uploadDocument = useCallback(
    async (file: File) => {
      setUploading(true)
      setUploadError(null)
      try {
        const document = await extractDocument(file)
        const context = summarizeContext(document)
        const record: PersistedAttachment = {
          id: `${Date.now()}-${file.name}`,
          name: document.meta.name,
          size: document.meta.size,
          mimeType: document.meta.mimeType,
          pageCount: document.meta.pages,
          chars: document.meta.chars,
          context,
          storedAt: Date.now(),
        }
        await saveAttachment(record)
        setAttachment({
          name: document.meta.name,
          size: document.meta.size,
          mimeType: document.meta.mimeType,
          pageCount: document.meta.pages,
          context,
        })
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Failed to parse document.")
      } finally {
        setUploading(false)
      }
    },
    [],
  )

  const fetchRelated = useCallback(
    async (assistantId: string, prompt: string, attachmentContext?: string) => {
      const query = attachmentContext ? `${prompt}\n\n${attachmentContext}` : prompt
      try {
        const response = await fetch("/api/ai/related", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query, limit: 3 }),
        })
        if (!response.ok) return
        const data = (await response.json()) as
          | { ok: true; data: { articles: AIRelatedArticle[] } }
          | { ok: false }
        if (!data.ok) return
        const articles = data.data.articles
        if (articles.length === 0) return
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId ? { ...message, related: articles } : message,
          ),
        )
      } catch {
        // Related articles are best-effort; silent failure on transient errors.
      }
    },
    [],
  )

  // Note: document upload via UploadThing is handled inside the AI dialog component
  // (useUploadThing must be called inside the React tree that has the uploadthing context).

  const submit = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const userMessage: AIMessage = {
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
      const attachmentSnapshot = attachment

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            prompt: trimmed,
            pageType: context.pageType,
            title: context.title,
            context: attachmentSnapshot?.context,
            history: historySnapshot,
          }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`Assistant request failed (${response.status})`)
        }

        await consumeSSE(response.body, (chunk) => {
          if (chunk.type === "stage") {
            setStage(chunk.stage)
          } else if (chunk.type === "token") {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId
                  ? { ...message, content: `${message.content}${chunk.text}` }
                  : message,
              ),
            )
          } else if (chunk.type === "done") {
            setStage("completed")
            void fetchRelated(assistantId, trimmed, attachmentSnapshot?.context)
          } else if (chunk.type === "error") {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId && message.content === ""
                  ? {
                      ...message,
                      content: `Sorry — the assistant could not answer right now. (${chunk.message})`,
                    }
                  : message,
              ),
            )
            setStage("idle")
          }
        }, controller.signal)
      } catch (error) {
        if (controller.signal.aborted) {
          setStage("idle")
          return
        }
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId && message.content === ""
              ? {
                  ...message,
                  content: `Sorry — the assistant could not answer right now. (${error instanceof Error ? error.message : "Network error"})`,
                }
              : message,
          ),
        )
        setStage("idle")
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
          if (stage === "completed") {
            setStage("idle")
          }
        }
      }
    },
    [context, stage, attachment, messages],
  )

  return {
    context,
    messages,
    stage,
    isOpen,
    setIsOpen,
    quickActions,
    submit,
    reset,
    stop,
    attachment,
    uploadDocument,
    removeAttachment,
    uploading,
    uploadError,
    fetchRelated,
  }
}
