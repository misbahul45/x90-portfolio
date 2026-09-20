import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { env } from "#/env"
import {
  ASK_LABS_BRAND,
  ASK_LABS_MAX_INPUT,
  ASK_LABS_MAX_HISTORY,
  buildAskLabsSystemPrompt,
  detectIntent,
  evaluatePublicGuard,
  resolveContext,
  retrieveAskLabsContext,
  sanitizeHistory,
} from "#/lib/ask-labs"
import type { AskLabsSource, AskLabsHistoryTurn, AskLabsResolvedContext } from "#/lib/ask-labs"

const chatInputSchema = z.object({
  prompt: z.string().min(1).max(ASK_LABS_MAX_INPUT),
  route: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(200).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .max(ASK_LABS_MAX_HISTORY)
    .optional(),
})

type ChatChunk =
  | { type: "stage"; stage: "analyzing" | "retrieving" | "reasoning" | "responding" }
  | { type: "sources"; sources: AskLabsSource[] }
  | { type: "intent"; intent: string; routeKind: string }
  | { type: "token"; text: string }
  | { type: "done"; ok: true }
  | { type: "error"; message: string }

const rateBuckets = new Map<string, { tokens: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_TOKENS = 20

function consumeRateBudget(clientKey: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const bucket = rateBuckets.get(clientKey)
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(clientKey, { tokens: RATE_LIMIT_TOKENS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_TOKENS - 1 }
  }
  if (bucket.tokens <= 0) {
    return { allowed: false, remaining: 0 }
  }
  bucket.tokens -= 1
  return { allowed: true, remaining: bucket.tokens }
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "anon"
  return request.headers.get("x-real-ip") ?? "anon"
}

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
              message: error instanceof Error ? error.message : "Ask Labs stream failed",
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

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: { message } }), {
    status,
    headers: { "content-type": "application/json" },
  })
}

async function* streamAskLabs(input: {
  prompt: string
  context: AskLabsResolvedContext
  history: AskLabsHistoryTurn[]
}): AsyncIterable<ChatChunk> {
  yield { type: "intent", intent: "analyzing", routeKind: input.context.kind }
  yield { type: "stage", stage: "retrieving" }

  const retrieval = await retrieveAskLabsContext({
    query: input.prompt,
    context: input.context,
    limit: 5,
  })

  if (retrieval.sources.length > 0) {
    yield { type: "sources", sources: retrieval.sources }
  }

  const intent = detectIntent(input.prompt)
  yield { type: "intent", intent: intent.intent, routeKind: input.context.kind }

  const apiKey = env.FLAZZ_API_KEY
  const baseUrl = env.FLAZZ_BASE_URL
  const model = env.FLAZZ_MODEL ?? "qwen3.6-flash"

  if (!apiKey) {
    yield {
      type: "error",
      message: `${ASK_LABS_BRAND.name} is unavailable: server is missing LLM credentials.`,
    }
    return
  }

  yield { type: "stage", stage: "reasoning" }

  const systemPrompt = buildAskLabsSystemPrompt({
    context: input.context,
    sources: retrieval.sources,
    serviceOfferingKeys: ["AUTOMATION", "AI_ASSISTANT", "AGENTIC_SYSTEM", "WEB", "MOBILE", "OTHER"],
  })

  const contextBundle = retrieval.contextBundle
  const chat = new ChatOpenAI({
    apiKey,
    configuration: { baseURL: baseUrl ?? "https://ai.flaz.id/v1" },
    model,
    temperature: 0.3,
    maxTokens: 700,
    streaming: true,
  })

  const messages = [
    new SystemMessage(systemPrompt),
    ...(contextBundle ? [new SystemMessage(`Public context bundle:\n\n${contextBundle}`)] : []),
    ...input.history.slice(-6).map((entry) =>
      entry.role === "assistant" ? new AIMessage(entry.content) : new HumanMessage(entry.content),
    ),
    new HumanMessage(input.prompt),
  ]

  yield { type: "stage", stage: "responding" }

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
      if (text) yield { type: "token", text }
    }
    yield { type: "done", ok: true }
  } catch (error) {
    yield {
      type: "error",
      message: error instanceof Error ? error.message : "Ask Labs could not complete the answer.",
    }
  }
}

export const Route = createFileRoute("/api/ask-labs/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? ""
        if (!contentType.includes("application/json")) {
          return jsonError("Expected JSON body", 415)
        }

        const rate = consumeRateBudget(clientKey(request))
        if (!rate.allowed) {
          return jsonError("Rate limit reached. Try again in a minute.", 429)
        }

        const text = await request.text()
        let body: unknown
        try {
          body = text ? JSON.parse(text) : {}
        } catch {
          return jsonError("Invalid JSON", 400)
        }

        const parsed = chatInputSchema.safeParse(body)
        if (!parsed.success) {
          return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400)
        }

        const guard = evaluatePublicGuard({
          prompt: parsed.data.prompt,
          route: parsed.data.route,
          slug: parsed.data.slug,
        })
        if (!guard.allowed) {
          return jsonError(guard.reason ?? "Request rejected", 400)
        }

        const context = await resolveContext({
          route: parsed.data.route ?? "/",
          slug: parsed.data.slug,
        })

        return sseResponse(
          streamAskLabs({
            prompt: parsed.data.prompt,
            context,
            history: sanitizeHistory(parsed.data.history),
          }),
        )
      },
    },
  },
})
