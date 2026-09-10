import { useEffect, useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"

type Token =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string }

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function tokenizeInline(raw: string): Token[] {
  const tokens: Token[] = []
  let buffer = ""
  let i = 0

  const flushText = () => {
    if (buffer) {
      tokens.push({ type: "text", text: buffer })
      buffer = ""
    }
  }

  while (i < raw.length) {
    const ch = raw[i]

    if (ch === "`" && raw[i + 1] !== "`") {
      const end = raw.indexOf("`", i + 1)
      if (end > i + 1) {
        flushText()
        tokens.push({ type: "code", text: raw.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }

    if (ch === "[") {
      const close = raw.indexOf("]", i + 1)
      if (close > i) {
        const after = raw.slice(close + 1)
        const linkMatch = /^\(([^)\s]+)(\s+"[^"]*")?\)/.exec(after)
        if (linkMatch) {
          const label = raw.slice(i + 1, close)
          const href = linkMatch[1]
          flushText()
          tokens.push({ type: "link", text: label || href, href })
          i = close + 1 + linkMatch[0].length
          continue
        }
      }
    }

    if (ch === "*" || ch === "_") {
      const marker = ch + ch
      const isBold = raw.startsWith(marker, i)
      const isItalic = !isBold && raw[i + 1] === ch && raw[i + 2] !== ch
      if (isBold || isItalic) {
        const endMarker = isBold ? marker : ch
        const start = i + endMarker.length
        const end = raw.indexOf(endMarker, start)
        if (end > start) {
          flushText()
          const inner = raw.slice(start, end)
          tokens.push(
            isBold
              ? { type: "bold", text: inner }
              : { type: "italic", text: inner },
          )
          i = end + endMarker.length
          continue
        }
      } else if (isItalic === false && ch === "*" && raw[i + 1] !== "*" && raw[i + 1] !== " ") {
        const end = raw.indexOf("*", i + 1)
        if (end > i + 1) {
          flushText()
          tokens.push({ type: "italic", text: raw.slice(i + 1, end) })
          i = end + 1
          continue
        }
      }
    }

    buffer += ch
    i += 1
  }
  flushText()
  return tokens
}

function renderInlineTokens(tokens: Token[], keyPrefix: string): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.type === "bold") {
      return <strong key={key}>{token.text}</strong>
    }
    if (token.type === "italic") {
      return <em key={key}>{token.text}</em>
    }
    if (token.type === "code") {
      return (
        <code
          key={key}
          className="rounded border border-[var(--lab-line)] bg-[var(--lab-bg-soft)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--lab-orange)]"
        >
          {token.text}
        </code>
      )
    }
    if (token.type === "link") {
      const external = /^https?:\/\//.test(token.href)
      return (
        <a
          key={key}
          href={token.href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="text-[var(--lab-orange)] underline-offset-4 transition-colors hover:text-[var(--lab-orange-light)] hover:underline"
        >
          {token.text}
        </a>
      )
    }
    return <span key={key}>{token.text}</span>
  })
}

type BlockKind =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "ul"
  | "ol"
  | "code"

type CodeBlockBlock = { kind: "code"; body: string; language: string }
type TextBlockKind = Exclude<BlockKind, "code">
type TextBlock = { kind: TextBlockKind; body: string }
type Block = CodeBlockBlock | TextBlock

function splitBlocks(text: string): Block[] {
  const lines = text.split("\n")
  const blocks: Block[] = []
  let current: { kind: "paragraph" | "header"; body: string } = { kind: "paragraph", body: "" }
  let listKind: "ul" | "ol" | null = null
  let listBuffer: string[] = []

  const flushList = () => {
    if (listKind && listBuffer.length > 0) {
      blocks.push({ kind: listKind, body: listBuffer.join("\n") })
      listBuffer = []
      listKind = null
    }
  }

  const flushPara = () => {
    if (current.kind === "paragraph" && current.body.trim()) {
      blocks.push({ kind: "paragraph", body: current.body.trim() })
    }
    current = { kind: "paragraph", body: "" }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    const openFence = /^```(\w*)\s*$/.exec(line)
    if (openFence) {
      flushPara()
      flushList()
      const startIdx = lines.indexOf(raw)
      const closeIdx = lines.findIndex((l, idx) => idx > startIdx && /^```\s*$/.test(l.trimEnd()))
      const bodyLines =
        closeIdx === -1 ? lines.slice(startIdx + 1) : lines.slice(startIdx + 1, closeIdx)
      blocks.push({
        kind: "code",
        body: bodyLines.join("\n"),
        language: openFence[1]?.toLowerCase() || "text",
      })
      if (closeIdx !== -1) {
        for (let i = 0; i <= closeIdx - startIdx; i += 1) {
          lines.splice(startIdx + i, 1)
          if (closeIdx === -1) break
        }
      }
      break
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line)
    if (headingMatch) {
      flushPara()
      flushList()
      blocks.push({ kind: `h${headingMatch[1].length}` as TextBlockKind, body: headingMatch[2] })
      continue
    }

    const ulMatch = /^[-*]\s+(.+)$/.exec(line)
    const olMatch = /^\d+\.\s+(.+)$/.exec(line)
    if (ulMatch || olMatch) {
      flushPara()
      const kind: "ul" | "ol" = ulMatch ? "ul" : "ol"
      if (listKind !== kind) {
        flushList()
        listKind = kind
      }
      listBuffer.push((ulMatch?.[1] ?? olMatch?.[1] ?? "").trim())
      continue
    }

    if (listKind && (line === "" || /^\s*[A-Za-z]/.test(line))) {
      flushList()
    }

    if (line === "") {
      flushPara()
      continue
    }
    current.body += (current.body ? "\n" : "") + line
  }

  flushPara()
  flushList()
  return blocks
}

const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  py: "Python",
  python: "Python",
  rb: "Ruby",
  go: "Go",
  rs: "Rust",
  java: "Java",
  kt: "Kotlin",
  swift: "Swift",
  c: "C",
  cpp: "C++",
  cs: "C#",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  jsonc: "JSON",
  md: "Markdown",
  markdown: "Markdown",
  sql: "SQL",
  dockerfile: "Dockerfile",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  less: "Less",
  xml: "XML",
  txt: "Text",
  text: "Plain Text",
}

function languageLabel(lang: string): string {
  if (!lang) return "Plain Text"
  return LANGUAGE_LABELS[lang] ?? lang.toUpperCase()
}

export function MarkdownLite({ source }: { source: string }) {
  if (!source) return null
  const blocks = splitBlocks(source)

  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((block, index) => {
        const key = `b-${index}`
        if (block.kind === "code") {
          return <CodeBlock key={key} block={block} />
        }
        const inline = () => renderInlineTokens(tokenizeInline(escapeHtml(block.body)), key)
        if (block.kind === "h1") {
          return (
            <h1 key={key} className="text-lg font-semibold text-[var(--lab-ink)]">
              {inline()}
            </h1>
          )
        }
        if (block.kind === "h2") {
          return (
            <h2 key={key} className="text-base font-semibold text-[var(--lab-ink)]">
              {inline()}
            </h2>
          )
        }
        if (block.kind === "h3") {
          return (
            <h3 key={key} className="text-[15px] font-semibold text-[var(--lab-ink)]">
              {inline()}
            </h3>
          )
        }
        if (block.kind === "h4" || block.kind === "h5" || block.kind === "h6") {
          return (
            <h4 key={key} className="text-[14.5px] font-semibold text-[var(--lab-ink)]">
              {inline()}
            </h4>
          )
        }
        if (block.kind === "ul") {
          return (
            <ul
              key={key}
              className="list-disc space-y-1 pl-5 text-[var(--lab-ink)] marker:text-[var(--lab-orange)]"
            >
              {block.body.split("\n").map((item, i) => (
                <li key={`${key}-${i}`} className="leading-6">
                  {renderInlineTokens(tokenizeInline(escapeHtml(item)), `${key}-${i}`)}
                </li>
              ))}
            </ul>
          )
        }
        if (block.kind === "ol") {
          return (
            <ol
              key={key}
              className="list-decimal space-y-1 pl-5 text-[var(--lab-ink)] marker:text-[var(--lab-ink-soft)]"
            >
              {block.body.split("\n").map((item, i) => (
                <li key={`${key}-${i}`} className="leading-6">
                  {renderInlineTokens(tokenizeInline(escapeHtml(item)), `${key}-${i}`)}
                </li>
              ))}
            </ol>
          )
        }
        return (
          <p key={key} className="leading-[1.65] text-[var(--lab-ink)]">
            {inline()}
          </p>
        )
      })}
    </div>
  )
}

const TOKEN_COLORS: Record<string, string> = {
  keyword: "text-[#FF8C5A]",
  string: "text-[#A8E890]",
  number: "text-[#F2C76F]",
  comment: "text-[#5C6E80] italic",
  function: "text-[#7FD3F7]",
  title: "text-[#7FD3F7]",
  class: "text-[#F2C76F]",
  attr: "text-[#FF8C5A]",
  meta: "text-[#9AAEC8]",
  tag: "text-[#FF8C5A]",
  built_in: "text-[#C4A8FF]",
  type: "text-[#C4A8FF]",
  literal: "text-[#F2C76F]",
  variable: "text-[#E6EAF2]",
  params: "text-[#E6EAF2]",
}

const REGEX_LANGUAGE_FALLBACK: Record<string, RegExp[]> = {
  python: [
    /\b(?:def|class|import|from|return|if|elif|else|for|while|try|except|with|as|pass|break|continue|in|not|and|or|is|None|True|False|self|async|await|yield|raise|lambda)\b/g,
    /"[^"\\\n]*(?:\\.[^"\\\n]*)*"|'[^'\\\n]*(?:\\.[^'\\\n]*)*'/g,
    /#.*/g,
    /\b\d+(?:\.\d+)?\b/g,
  ],
  ts: [
    /\b(?:const|let|var|function|class|interface|type|enum|import|export|from|default|extends|implements|public|private|protected|static|readonly|async|await|new|return|if|else|switch|case|break|continue|for|while|do|of|in|typeof|instanceof|as|void|null|undefined|true|false|this|super)\b/g,
    /"[^"\\\n]*(?:\\.[^"\\\n]*)*"|'[^'\\\n]*(?:\\.[^'\\\n]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`/g,
    /\b\d+(?:\.\d+)?\b/g,
    /^\s*\/\/.*/gm,
  ],
  tsx: [],
  js: [],
  jsx: [],
  json: [],
}

function highlightWithRegex(code: string, lang: string): ReactNode[] {
  const patterns = REGEX_LANGUAGE_FALLBACK[lang] ?? REGEX_LANGUAGE_FALLBACK.ts
  if (patterns.length === 0) return [code]
  const tokens: Array<{ start: number; end: number; className: string }> = []
  for (const pattern of patterns) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(code)) !== null) {
      const start = match.index
      const end = start + match[0].length
      const overlapping = tokens.some((t) => start < t.end && end > t.start)
      if (!overlapping) {
        const className = match[0].startsWith("#")
          ? "text-[#5C6E80] italic"
          : /^\d/.test(match[0])
            ? "text-[#F2C76F]"
            : match[0].startsWith("\"") || match[0].startsWith("'") || match[0].startsWith("`")
              ? "text-[#A8E890]"
              : "text-[#FF8C5A]"
        tokens.push({ start, end, className })
      }
      if (match[0].length === 0) pattern.lastIndex += 1
    }
  }
  tokens.sort((a, b) => a.start - b.start)
  const result: ReactNode[] = []
  let cursor = 0
  for (const token of tokens) {
    if (cursor < token.start) result.push(code.slice(cursor, token.start))
    result.push(
      <span key={`${token.start}-${token.end}`} className={token.className}>
        {code.slice(token.start, token.end)}
      </span>,
    )
    cursor = token.end
  }
  if (cursor < code.length) result.push(code.slice(cursor))
  return result
}

function CodeBlock({ block }: { block: CodeBlockBlock }) {
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState<ReactNode[] | null>(null)
  const lines = block.body.split("\n")

  useEffect(() => {
    let cancelled = false
    void import("lowlight").then((mod) => {
      if (cancelled) return
      try {
        const lowlight = (mod as { default?: unknown }).default ?? mod
        const inst = lowlight as {
          highlight: (name: string, value: string) => unknown
        }
        const tree = inst.highlight(block.language, block.body)
        const flat = lowlightToReact(tree)
        setHighlighted(flat)
      } catch {
        setHighlighted(highlightWithRegex(block.body, block.language))
      }
    }).catch(() => {
      if (!cancelled) setHighlighted(highlightWithRegex(block.body, block.language))
    })
    return () => {
      cancelled = true
    }
  }, [block.body, block.language])

  const copyToClipboard = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return
    void navigator.clipboard.writeText(block.body).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }

  const linesForRender = highlighted ?? lines.map((line, i) => (
    <span key={`l-${i}`}>{line || "\u200B"}</span>
  ))

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-[var(--lab-line)] bg-[#0B1320] font-mono shadow-[0_8px_28px_-12px_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#1E2C44] bg-[#0F1A2C] px-3 py-1.5">
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-[#8FA3BD]">
          <span className="flex gap-1">
            <span aria-hidden className="size-2 rounded-full bg-[#FF5F57]" />
            <span aria-hidden className="size-2 rounded-full bg-[#FEBC2E]" />
            <span aria-hidden className="size-2 rounded-full bg-[#28C840]" />
          </span>
          <span className="font-mono normal-case tracking-normal text-[#C8D5E4]">
            main.{block.language === "python" ? "py" : block.language === "ts" || block.language === "tsx" ? "ts" : block.language === "js" || block.language === "jsx" ? "js" : block.language || "txt"}
          </span>
          <span>·</span>
          <span>{languageLabel(block.language)}</span>
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          aria-label="Copy code"
          className="inline-flex items-center gap-1 border border-transparent px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#8FA3BD] transition-colors hover:border-[#1E2C44] hover:text-[#C8D5E4]"
        >
          {copied ? <Check className="size-3 text-[#28C840]" /> : <Copy className="size-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>

      <div className="grid grid-cols-[auto_1fr] text-[12.5px] leading-[1.65]">
        <div className="select-none border-r border-[#1E2C44] bg-[#0B1220] px-2 py-3 text-right font-mono text-[10.5px] leading-[1.65] text-[#5C6E80]">
          {lines.map((_, index) => (
            <div key={index} className="px-1">
              {index + 1}
            </div>
          ))}
        </div>
        <pre className="m-0 overflow-x-auto bg-[#0B1320] py-3 pl-3 pr-4 font-mono text-[#E6EAF2]">
          <code className="block whitespace-pre">
            {lines.length === 0
              ? "\u200B"
              : linesForRender.map((segment, i) => (
                  <div key={i} className="min-h-[1.65em]">
                    {segment}
                  </div>
                ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

function lowlightToReact(
  node: unknown,
  keyPrefix = "h",
): ReactNode[] {
  if (typeof node === "string") return [node]
  if (!node || typeof node !== "object") return []
  const element = node as { type?: string; value?: string; children?: unknown[] }
  if (element.type === "text") return [element.value ?? ""]
  if (!element.type) return []
  const children = Array.isArray(element.children) ? element.children : []
  const inner = children.flatMap((child, index) =>
    lowlightToReact(child, `${keyPrefix}-${index}`),
  )
  const className =
    element.type in TOKEN_COLORS
      ? `${TOKEN_COLORS[element.type] ?? ""} whitespace-pre-wrap`
      : "whitespace-pre-wrap"
  return [
    <span key={keyPrefix} className={className}>
      {inner}
    </span>,
  ]
}
