import { createFileRoute } from "@tanstack/react-router"
import { prisma } from "#/db"

const MAX_BYTES = 8 * 1024 * 1024

function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
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

type Purpose = "research-cover" | "brief-attachment" | "team-avatar"

const ALLOWED_PURPOSES: ReadonlySet<Purpose> = new Set([
  "research-cover",
  "brief-attachment",
  "team-avatar",
])

const ALLOWED_MIME_TYPES: Record<Purpose, ReadonlySet<string>> = {
  "research-cover": new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
  ]),
  "brief-attachment": new Set([
    "application/pdf",
    "image/png",
    "image/jpeg",
    "text/plain",
  ]),
  "team-avatar": new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
  ]),
}

function inferMime(name: string, declared: string): string {
  if (declared && declared !== "application/octet-stream") return declared
  const lower = name.toLowerCase()
  if (lower.endsWith(".pdf")) return "application/pdf"
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".avif")) return "image/avif"
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return "text/plain"
  return "application/octet-stream"
}

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? ""
        if (!contentType.includes("multipart/form-data")) {
          return fail("Use multipart/form-data with a `file` field.", 415)
        }

        const form = await request.formData()
        const file = form.get("file")
        const purpose = (form.get("purpose") as Purpose | null) ?? "research-cover"
        if (!(file instanceof File)) {
          return fail("Missing `file` field.", 400)
        }
        if (!ALLOWED_PURPOSES.has(purpose)) {
          return fail("Invalid upload purpose.", 400)
        }
        if (file.size > MAX_BYTES) {
          return fail(`File exceeds ${MAX_BYTES / 1024 / 1024} MB limit.`, 413)
        }

        const fileName = file.name || "upload"
        const fileType = inferMime(fileName, file.type)
        if (!ALLOWED_MIME_TYPES[purpose].has(fileType)) {
          return fail(`File type ${fileType} not allowed for ${purpose}.`, 415)
        }

        const buffer = new Uint8Array(await file.arrayBuffer())
        try {
          const created = await prisma.uploadedFile.create({
            data: {
              name: fileName,
              mimeType: fileType,
              size: file.size,
              purpose,
              data: buffer,
            },
          })
          return ok({ ok: true, data: { url: `/api/files/${created.id}` } })
        } catch (error) {
          return fail(
            error instanceof Error ? error.message : "Failed to save uploaded file.",
            500,
          )
        }
      },
    },
  },
})
