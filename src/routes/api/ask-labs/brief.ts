import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { prisma } from "#/db"
import { ARTICLE_STATUS } from "#/lib/domain/article-status"
import { PROJECT_STATUS } from "#/lib/domain/project-status"

const schema = z.object({
  projectSlug: z.string().min(1).max(200).optional(),
  researchSlug: z.string().min(1).max(200).optional(),
  topic: z.string().min(1).max(500).optional(),
  summary: z.string().min(1).max(2000).optional(),
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

export const Route = createFileRoute("/api/ask-labs/brief")({
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

        const [project, article] = await Promise.all([
          parsed.data.projectSlug
            ? prisma.project.findFirst({
                where: { slug: parsed.data.projectSlug, status: PROJECT_STATUS.PUBLISHED },
                select: { id: true, slug: true, title: true, description: true },
              })
            : Promise.resolve(null),
          parsed.data.researchSlug
            ? prisma.article.findFirst({
                where: { slug: parsed.data.researchSlug, status: ARTICLE_STATUS.PUBLISHED },
                select: { id: true, slug: true, title: true, excerpt: true },
              })
            : Promise.resolve(null),
        ])

        return jsonOk({
          project,
          research: article,
          topic: parsed.data.topic ?? null,
          summary: parsed.data.summary ?? null,
          contactHint: "#contact",
        })
      },
    },
  },
})
