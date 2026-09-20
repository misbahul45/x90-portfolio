import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { ASK_LABS_MAX_INPUT, resolveContext, retrieveAskLabsContext } from "#/lib/ask-labs"

const schema = z.object({
  query: z.string().min(1).max(ASK_LABS_MAX_INPUT),
  route: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(200).optional(),
  limit: z.number().int().min(1).max(8).default(4),
})

function jsonOk<T>(data: T): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { "content-type": "application/json" },
  })
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ ok: false, error: { message } }), {
    status,
    headers: { "content-type": "application/json" },
  })
}

export const Route = createFileRoute("/api/ask-labs/sources")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? ""
        if (!contentType.includes("application/json")) return jsonError("Expected JSON body", 415)

        const text = await request.text()
        let body: unknown
        try {
          body = text ? JSON.parse(text) : {}
        } catch {
          return jsonError("Invalid JSON", 400)
        }

        const parsed = schema.safeParse(body)
        if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400)

        const context = await resolveContext({
          route: parsed.data.route ?? "/",
          slug: parsed.data.slug,
        })
        const retrieval = await retrieveAskLabsContext({
          query: parsed.data.query,
          context,
          limit: parsed.data.limit,
        })
        return jsonOk({ sources: retrieval.sources })
      },
    },
  },
})
