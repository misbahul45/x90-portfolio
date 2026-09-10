import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { findRelatedArticles } from "#/lib/vector-store"

const querySchema = z.object({
  query: z.string().min(1).max(2000),
  limit: z.number().int().min(1).max(10).default(3),
  excludeId: z.string().optional(),
})

function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function fail(message: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, error: { message } }), {
    status,
    headers: { "content-type": "application/json" },
  })
}

export const Route = createFileRoute("/api/ai/related")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? ""
        if (!contentType.includes("application/json")) {
          return fail("Expected JSON body.", 415)
        }

        const text = await request.text()
        let body: unknown
        try {
          body = text ? JSON.parse(text) : {}
        } catch {
          return fail("Invalid JSON.", 400)
        }

        const parsed = querySchema.safeParse(body)
        if (!parsed.success) {
          return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400)
        }

        const hits = await findRelatedArticles(
          parsed.data.query,
          parsed.data.limit,
          parsed.data.excludeId,
        )
        return ok({ articles: hits })
      },
    },
  },
})
