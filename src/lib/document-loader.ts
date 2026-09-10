import * as pdfjsLib from "pdfjs-dist"
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const MAX_BYTES = 10 * 1024 * 1024
const MARKDOWN_MAX_CHARS = 20_000

export type ExtractedDocumentMeta = {
  name: string
  size: number
  mimeType: string
  pages?: number
  chars: number
}

export type ExtractedDocument = {
  pageContent: string
  metadata: { source: string; type: "pdf" | "markdown" | "text"; pages?: number }
  meta: ExtractedDocumentMeta
}

function detectKind(name: string, mimeType: string): "pdf" | "markdown" | "text" | null {
  const lower = name.toLowerCase()
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf"
  if (
    mimeType === "text/markdown" ||
    mimeType === "text/x-markdown" ||
    lower.endsWith(".md") ||
    lower.endsWith(".mdx") ||
    lower.endsWith(".markdown")
  ) {
    return "markdown"
  }
  if (mimeType.startsWith("text/") || lower.endsWith(".txt")) return "text"
  return null
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function readPdfText(arrayBuffer: ArrayBuffer): Promise<{ text: string; pages: number }> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
  const doc = await loadingTask.promise
  try {
    const pageTexts: string[] = []
    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i)
      try {
        const content = await page.getTextContent()
        const strings = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .filter(Boolean)
        pageTexts.push(strings.join(" "))
      } finally {
        await page.cleanup()
      }
    }
    return {
      text: pageTexts.join("\n\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""),
      pages: doc.numPages,
    }
  } finally {
    await doc.cleanup()
    await loadingTask.destroy()
  }
}

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  if (file.size > MAX_BYTES) {
    throw new Error(`File exceeds ${MAX_BYTES / 1024 / 1024} MB limit.`)
  }

  const kind = detectKind(file.name, file.type)
  if (!kind) {
    throw new Error("Unsupported file type. Please upload a PDF or markdown file.")
  }

  const arrayBuffer = await file.arrayBuffer()

  if (kind === "markdown" || kind === "text") {
    const raw = new TextDecoder("utf-8").decode(arrayBuffer)
    const text = (kind === "markdown" ? stripMarkdown(raw) : raw).slice(0, MARKDOWN_MAX_CHARS)
    return {
      pageContent: text,
      metadata: { source: file.name, type: kind },
      meta: {
        name: file.name,
        size: file.size,
        mimeType: file.type || (kind === "markdown" ? "text/markdown" : "text/plain"),
        chars: text.length,
      },
    }
  }

  const { text, pages } = await readPdfText(arrayBuffer)
  const trimmed = text.length > MARKDOWN_MAX_CHARS ? text.slice(0, MARKDOWN_MAX_CHARS) : text
  return {
    pageContent: trimmed,
    metadata: { source: file.name, type: "pdf", pages },
    meta: {
      name: file.name,
      size: file.size,
      mimeType: "application/pdf",
      pages,
      chars: trimmed.length,
    },
  }
}

export function summarizeContext(document: ExtractedDocument, maxChars = 5000): string {
  const head = document.pageContent.slice(0, maxChars)
  return `Document "${document.meta.name}" (${document.meta.mimeType}, ${document.meta.chars} chars${document.meta.pages ? `, ${document.meta.pages} pages` : ""}):\n\n${head}`
}
