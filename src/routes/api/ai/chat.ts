import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { env } from "#/env"
import { formatHitsForPrompt, searchKnowledgeBase } from "#/lib/vector-store"

const chatInputSchema = z.object({
  prompt: z.string().min(1).max(2000),
  pageType: z.enum(["home", "research", "project", "about"]).default("home"),
  title: z.string().max(200).optional(),
  context: z.string().max(20000).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(10)
    .optional(),
})

type ChatChunk =
  | { type: "stage"; stage: "analyzing" | "retrieving" | "reasoning" | "responding" }
  | { type: "token"; text: string }
  | { type: "done"; ok: true }
  | { type: "error"; message: string }

function sseResponse(chunks: AsyncIterable<ChatChunk>): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : "Stream failed",
            } satisfies ChatChunk)}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
      connection: "keep-alive",
    },
  })
}

function buildSystemPrompt(input: {
  pageType: "home" | "research" | "project" | "about"
  title?: string
  context?: string
}): string {
  const parts: string[] = []
  parts.push(
    "You are the XNINETZY Labs research assistant. You speak on behalf of a small technical AI lab that researches, experiments with, and ships production AI systems.",
  )
  parts.push(
    "Answer concisely (3 to 6 short paragraphs). Reference projects at /projects, research at /research, and contact form at #contact. Never invent team members, partnerships, or metrics. If unsure, say so plainly. Match the user's language (English if unclear).",
  )
  if (input.context && input.context.trim()) {
    parts.push(
      `The user attached a document — treat the following excerpt as the primary reference for this turn:\n\n${input.context.trim().slice(0, 6000)}`,
    )
  }
  if (input.pageType === "research" && input.title) {
    parts.push(`Context: the user is reading the research article "${input.title}".`)
  }
  if (input.pageType === "project") {
    parts.push("Context: the user is viewing a project case study.")
  }
  return parts.join("\n\n")
}

async function* streamFromFlazz(input: {
  prompt: string
  pageType: "home" | "research" | "project" | "about"
  title?: string
  context?: string
  history: Array<{ role: "user" | "assistant"; content: string }>
}): AsyncIterable<ChatChunk> {
  const hits = await searchKnowledgeBase(input.prompt, 5)
  const knowledgeContext = formatHitsForPrompt(hits)
  const apiKey = env.FLAZZ_API_KEY
  const baseUrl = env.FLAZZ_BASE_URL
  const model = env.FLAZZ_MODEL ?? "qwen3.6-flash"

  if (!apiKey) {
    yield { type: "error", message: "FLAZZ_API_KEY is not configured on the server." }
    return
  }

  yield { type: "stage", stage: "retrieving" }
  yield { type: "stage", stage: "reasoning" }
  yield { type: "stage", stage: "responding" }

  const chat = new ChatOpenAI({
    apiKey,
    configuration: {
      baseURL: baseUrl ?? "https://ai.flaz.id/v1",
    },
    model,
    temperature: 0.4,
    maxTokens: 900,
    streaming: true,
  })

  const messages = [
    new SystemMessage(buildSystemPrompt({ ...input, context: [input.context, knowledgeContext].filter(Boolean).join("\n\n") })),
    ...input.history.slice(-6).map((entry) =>
      entry.role === "assistant" ? new AIMessage(entry.content) : new HumanMessage(entry.content),
    ),
    new HumanMessage(input.prompt),
  ]

  try {
    const stream = await chat.stream(messages)
    for await (const chunk of stream) {
      const text =
        typeof chunk.content === "string"
          ? chunk.content
          : Array.isArray(chunk.content)
            ? chunk.content
                .filter((part): part is { type: "text"; text: string } => "text" in part)
                .map((part) => part.text)
                .join("")
            : ""
      if (text) {
        yield { type: "token", text }
      }
    }
    yield { type: "done", ok: true }
  } catch (error) {
    yield {
      type: "error",
      message: error instanceof Error ? error.message : "Assistant request failed.",
    }
  }
}

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? ""
        if (!contentType.includes("application/json")) {
          return new Response(
            JSON.stringify({ ok: false, error: { message: "Expected JSON body" } }),
            { status: 415, headers: { "content-type": "application/json" } },
          )
        }
        const text = await request.text()
        let body: unknown
        try {
          body = text ? JSON.parse(text) : {}
        } catch {
          return new Response(
            JSON.stringify({ ok: false, error: { message: "Invalid JSON" } }),
            { status: 400, headers: { "content-type": "application/json" } },
          )
        }
        const parsed = chatInputSchema.safeParse(body)
        if (!parsed.success) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: { message: parsed.error.issues[0]?.message ?? "Invalid input" },
            }),
            { status: 400, headers: { "content-type": "application/json" } },
          )
        }
        return sseResponse(
          streamFromFlazz({
            prompt: parsed.data.prompt,
            pageType: parsed.data.pageType,
            title: parsed.data.title,
            context: parsed.data.context,
            history: parsed.data.history ?? [],
          }),
        )
      },
    },
  },
})
