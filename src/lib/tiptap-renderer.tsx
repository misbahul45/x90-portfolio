import type { ReactNode } from "react"
import { CodeBlockFrame, extractTextFromChildren } from "#/components/editor/CodeBlock"

export type TiptapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

export type TiptapDoc = {
  type?: string
  content?: TiptapNode[]
}

export function parseTiptapContent(content: string): TiptapDoc | null {
  if (!content) return null
  try {
    return JSON.parse(content) as TiptapDoc
  } catch {
    return null
  }
}

type RendererProps = {
  content: string
  fallbackClassName?: string
}

export function TiptapContent({ content, fallbackClassName }: RendererProps): ReactNode {
  const parsed = parseTiptapContent(content)
  if (!parsed || !Array.isArray(parsed.content)) {
    return <p className={fallbackClassName}>{content}</p>
  }
  return (
    <>
      {parsed.content.map((node, index) => (
        <RenderNode key={index} node={node} />
      ))}
    </>
  )
}

function RenderNode({ node }: { node: TiptapNode }): ReactNode {
  const children = node.content?.map((child, index) => (
    <RenderNode key={index} node={child} />
  ))

  if (node.type === "paragraph") {
    return <p className="my-4 leading-7 text-[var(--lab-ink)]">{children}</p>
  }
  if (node.type === "heading") {
    const level = (node.attrs?.level as number) ?? 2
    if (level === 1) {
      return (
        <h1 className="mt-12 mb-4 text-3xl font-semibold leading-tight tracking-tight text-[var(--lab-ink)]">
          {children}
        </h1>
      )
    }
    if (level === 2) {
      return (
        <h2 className="mt-12 mb-3 text-2xl font-semibold leading-snug tracking-tight text-[var(--lab-ink)]">
          {children}
        </h2>
      )
    }
    if (level === 3) {
      return (
        <h3 className="mt-8 mb-2 text-xl font-semibold leading-snug tracking-tight text-[var(--lab-ink)]">
          {children}
        </h3>
      )
    }
    return (
      <h4 className="mt-6 mb-2 text-lg font-semibold leading-snug tracking-tight text-[var(--lab-ink)]">
        {children}
      </h4>
    )
  }
  if (node.type === "bulletList") {
    return (
      <ul className="my-4 space-y-1.5 pl-6 text-[var(--lab-ink)] marker:text-[var(--lab-orange)]" style={{ listStyle: "disc" }}>
        {children}
      </ul>
    )
  }
  if (node.type === "orderedList") {
    return (
      <ol className="my-4 list-decimal space-y-1.5 pl-6 text-[var(--lab-ink)] marker:text-[var(--lab-ink-soft)]">
        {children}
      </ol>
    )
  }
  if (node.type === "listItem") {
    return <li className="leading-7">{children}</li>
  }
  if (node.type === "blockquote") {
    return (
      <blockquote className="my-6 border-l-2 border-[var(--lab-orange)] pl-4 italic text-[var(--lab-ink-soft)]">
        {children}
      </blockquote>
    )
  }
  if (node.type === "codeBlock") {
    const language = (node.attrs?.language as string | undefined) ?? "text"
    const code = extractTextFromChildren(node.content ?? [])
    return <CodeBlockFrame code={code} language={language} copyable />
  }
  if (node.type === "horizontalRule") {
    return <hr className="my-10 border-[var(--lab-line)]" />
  }
  if (node.type === "hardBreak") {
    return <br />
  }
  if (node.type === "image") {
    const src = typeof node.attrs?.src === "string" ? node.attrs.src : ""
    const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : ""
    if (!src) return null
    return (
      <figure className="my-8 overflow-hidden rounded-xl border border-[var(--lab-line)] bg-[var(--lab-card)]">
        <img src={src} alt={alt} className="w-full" loading="lazy" />
        {alt && (
          <figcaption className="border-t border-[var(--lab-line)] px-4 py-2 text-xs text-[var(--lab-ink-soft)]">
            {alt}
          </figcaption>
        )}
      </figure>
    )
  }
  if (node.type === "text") {
    const isCode = node.marks?.some((mark) => mark.type === "code")
    if (isCode) {
      return (
        <code className="rounded border border-[var(--lab-line)] bg-[var(--lab-bg-soft)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--lab-ink)]">
          {node.text}
        </code>
      )
    }
    const isBold = node.marks?.some((mark) => mark.type === "bold")
    const isItalic = node.marks?.some((mark) => mark.type === "italic")
    let element: ReactNode = node.text ?? ""
    if (isBold && isItalic) element = <strong><em>{element}</em></strong>
    else if (isBold) element = <strong>{element}</strong>
    else if (isItalic) element = <em>{element}</em>
    const isLink = node.marks?.find((mark) => mark.type === "link")
    if (isLink) {
      const href = typeof isLink.attrs?.href === "string" ? isLink.attrs.href : "#"
      const target = typeof isLink.attrs?.target === "string" ? isLink.attrs.target : undefined
      return (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noreferrer" : undefined}
          className="text-[var(--lab-orange)] underline-offset-4 transition-colors hover:text-[var(--lab-orange-light)] hover:underline"
        >
          {element}
        </a>
      )
    }
    return element
  }
  return <>{children}</>
}
