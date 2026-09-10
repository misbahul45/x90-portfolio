import { createFileRoute } from "@tanstack/react-router"
import { prisma } from "#/db"

export const Route = createFileRoute("/api/files/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id
        if (!id) {
          return new Response("Not found", { status: 404 })
        }
        const file = await prisma.uploadedFile.findUnique({ where: { id } })
        if (!file) {
          return new Response("Not found", { status: 404 })
        }
        const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data as ArrayBuffer)
        return new Response(data, {
          status: 200,
          headers: {
            "content-type": file.mimeType,
            "content-length": file.size.toString(),
            "cache-control": "public, max-age=31536000, immutable",
            "content-disposition": `inline; filename="${encodeURIComponent(file.name)}"`,
          },
        })
      },
    },
  },
})
