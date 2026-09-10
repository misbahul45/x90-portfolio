import { useEffect, useState, type ReactNode } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { Check, Copy } from "lucide-react"
import { cn } from "#/lib/utils"
import { languageFileExtension, languageLabel } from "#/components/editor/CodeBlock/language"

const TOKEN_COLOR: Record<string, string> = {
  keyword: "text-[#FF8C5A]",
  built_in: "text-[#C4A8FF]",
  selector: "text-[#FF8C5A]",
  type: "text-[#C4A8FF]",
  literal: "text-[#F2C76F]",
  number: "text-[#F2C76F]",
  symbol: "text-[#F2C76F]",
  string: "text-[#A8E890]",
  regexp: "text-[#F2C76F]",
  title: "text-[#7FD3F7]",
  attribute: "text-[#FF8C5A]",
  function: "text-[#7FD3F7]",
  class: "text-[#C4A8FF]",
  title_class: "text-[#C4A8FF]",
  params: "text-[#E6EAF2]",
  meta: "text-[#9AAEC8]",
  comment: "text-[#5C6E80] italic",
  doctag: "text-[#5C6E80]",
  variable: "text-[#E6EAF2]",
  attr: "text-[#FF8C5A]",
  tag: "text-[#FF8C5A]",
}

type HlNode = {
  type?: string
  value?: string
  properties?: { className?: string[] }
  children?: Array<HlNode | string>
}

function lowlightToReact(node: HlNode | string, keyPrefix: string): ReactNode {
  if (typeof node === "string") return node
  if (!node || typeof node !== "object") return null
  const className = Array.isArray(node.properties?.className) ? node.properties.className[0] : undefined
  const colorClass = className ? TOKEN_COLOR[className] : undefined
  const children = Array.isArray(node.children)
    ? node.children.map((child, index) => lowlightToReact(child, `${keyPrefix}-${index}`))
    : null
  if (node.type === "text" || node.type === "root") {
    return <>{children}</>
  }
  if (className === "hljs-comment") {
    return (
      <span key={keyPrefix} className={cn("text-[#5C6E80] italic", colorClass)}>
        {children}
      </span>
    )
  }
  if (className === "hljs-string") {
    return (
      <span key={keyPrefix} className={cn("text-[#A8E890]", colorClass)}>
        {children}
      </span>
    )
  }
  if (className === "hljs-number" || className === "hljs-literal") {
    return (
      <span key={keyPrefix} className={cn("text-[#F2C76F]", colorClass)}>
        {children}
      </span>
    )
  }
  if (className === "hljs-keyword" || className === "hljs-built_in" || className === "hljs-selector-tag") {
    return (
      <span key={keyPrefix} className={cn("text-[#FF8C5A]", colorClass)}>
        {children}
      </span>
    )
  }
  if (className === "hljs-title" || className === "hljs-function" || className === "hljs-title.function_") {
    return (
      <span key={keyPrefix} className={cn("text-[#7FD3F7]", colorClass)}>
        {children}
      </span>
    )
  }
  if (className === "hljs-type" || className === "hljs-class" || className === "hljs-title.class_") {
    return (
      <span key={keyPrefix} className={cn("text-[#C4A8FF]", colorClass)}>
        {children}
      </span>
    )
  }
  return (
    <span key={keyPrefix} className={colorClass}>
      {children}
    </span>
  )
}

async function loadLowlight() {
  const mod = await import("lowlight")
  const factory = (mod as { default?: unknown }).default ?? mod
  return factory as {
    highlight: (name: string, value: string) => HlNode
  }
}

function renderFallback(code: string, language: string): ReactNode {
  const langKey = language.toLowerCase()
  const patterns: Array<[RegExp, string]> = []
  const keywordMap: Record<string, RegExp> = {
    python: /\b(?:def|class|import|from|return|if|elif|else|for|while|try|except|with|as|pass|break|continue|in|not|and|or|is|None|True|False|self|async|await|yield|raise|lambda|global|nonlocal|return)\b/g,
    ts: /\b(?:const|let|var|function|class|interface|type|enum|import|export|from|default|extends|implements|public|private|protected|static|readonly|async|await|new|return|if|else|switch|case|break|continue|for|while|do|of|in|typeof|instanceof|as|void|null|undefined|true|false|this|super|try|catch|finally|throw|abstract|namespace|declare|keyof|infer|readonly)\b/g,
    tsx: /\b(?:const|let|var|function|class|interface|type|enum|import|export|from|default|extends|implements|public|private|protected|static|readonly|async|await|new|return|if|else|switch|case|break|continue|for|while|do|of|in|typeof|instanceof|as|void|null|undefined|true|false|this|super|try|catch|finally|throw)\b/g,
    js: /\b(?:const|let|var|function|class|import|export|from|default|extends|async|await|new|return|if|else|switch|case|break|continue|for|while|do|of|in|typeof|instanceof|as|void|null|undefined|true|false|this|super|try|catch|finally|throw)\b/g,
    jsx: /\b(?:const|let|var|function|class|import|export|from|default|extends|async|await|new|return|if|else|switch|case|break|continue|for|while|do|of|in|typeof|instanceof|as|void|null|undefined|true|false|this|super|try|catch|finally|throw)\b/g,
    go: /\b(?:package|import|func|var|const|type|struct|interface|map|chan|go|defer|return|if|else|for|range|switch|case|break|continue|default|fallthrough|panic|recover|select)\b/g,
    rust: /\b(?:fn|let|mut|const|pub|use|mod|crate|struct|enum|impl|trait|for|in|while|loop|match|if|else|return|break|continue|self|Self|as|ref|move|async|await|dyn|where|unsafe|box|extern|false|true|fn|impl|match|pub|ref|self|Self|static|struct|super|trait|type|virtual|yield)\b/g,
    sql: /\b(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|ON|AS|AND|OR|NOT|NULL|IS|IN|BETWEEN|LIKE|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|CHECK|UNIQUE|VALUES|INTO|SET|WITH|CASE|WHEN|THEN|ELSE|END|BEGIN|COMMIT|ROLLBACK|TRANSACTION)\b/gi,
    bash: /\b(?:if|then|else|elif|fi|case|esac|for|in|do|done|while|until|function|select|echo|read|export|local|declare|typeset|unset|readonly|shift|set|alias)\b/g,
    json: /\b(?:true|false|null)\b/g,
  }
  if (keywordMap[langKey]) patterns.push([keywordMap[langKey], "text-[#FF8C5A]"])
  patterns.push([/"[^"\\\n]*(?:\\.[^"\\\n]*)*"|'[^'\\\n]*(?:\\.[^'\\\n]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`/g, "text-[#A8E890]"])
  patterns.push([/\b\d+(?:\.\d+)?\b/g, "text-[#F2C76F]"])
  const commentMap: Record<string, RegExp> = {
    python: /#.*/g,
    bash: /#.*/g,
    sql: /--.*/g,
    yaml: /#.*/g,
  }
  patterns.push([commentMap[langKey] ?? commentMap.yaml ?? /\/\/.*/g, "text-[#5C6E80] italic"])

  const tokens: Array<{ start: number; end: number; className: string }> = []
  for (const [pattern, className] of patterns) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(code)) !== null) {
      const start = match.index
      const end = start + match[0].length
      if (!tokens.some((t) => start < t.end && end > t.start)) {
        tokens.push({ start, end, className })
      }
      if (match[0].length === 0) pattern.lastIndex += 1
    }
  }
  tokens.sort((a, b) => a.start - b.start)
  const out: ReactNode[] = []
  let cursor = 0
  for (const token of tokens) {
    if (cursor < token.start) out.push(code.slice(cursor, token.start))
    out.push(
      <span key={`${token.start}-${token.end}`} className={token.className}>
        {code.slice(token.start, token.end)}
      </span>,
    )
    cursor = token.end
  }
  if (cursor < code.length) out.push(code.slice(cursor))
  return out
}

function countLines(text: string): number {
  if (!text) return 1
  return text.split("\n").length
}

export function CodeBlockFrame({
  code,
  language,
  copyable = true,
}: {
  code: string
  language: string
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState<ReactNode | null>(null)
  const langKey = language.toLowerCase().trim() || "text"

  useEffect(() => {
    let cancelled = false
    if (!code) {
      setHighlighted(null)
      return
    }
    void (async () => {
      try {
        const lowlight = await loadLowlight()
        const result = lowlight.highlight(langKey, code)
        if (!cancelled) {
          const out: ReactNode[] = []
          const children = Array.isArray(result.children) ? result.children : []
          children.forEach((child, index) => out.push(lowlightToReact(child as HlNode, `c-${index}`)))
          setHighlighted(out.length === 1 ? out[0] : <>{out}</>)
        }
      } catch {
        if (!cancelled) setHighlighted(renderFallback(code, langKey))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [code, langKey])

  const handleCopy = () => {
    if (!copyable) return
    if (typeof navigator === "undefined" || !navigator.clipboard) return
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    })
  }

  const label = languageLabel(language)
  const fileExt = languageFileExtension(language)
  const lineCount = countLines(code)
  const displayContent = highlighted ?? renderFallback(code, langKey) ?? code

  return (
    <figure
      data-code-block
      data-language={langKey}
      className="not-prose my-6 overflow-hidden rounded-lg border border-[#1F2C44] bg-[#0B1320] font-mono shadow-[0_10px_32px_-18px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#1E2C44] bg-[#0F1A2C] px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-[#8FA3BD]">
          <span aria-hidden className="flex gap-1">
            <span className="size-2 rounded-full bg-[#FF5F57]" />
            <span className="size-2 rounded-full bg-[#FEBC2E]" />
            <span className="size-2 rounded-full bg-[#28C840]" />
          </span>
          <span className="truncate font-mono normal-case tracking-normal text-[#C8D5E4]">
            main.{fileExt}
          </span>
          <span aria-hidden>·</span>
          <span>{label}</span>
        </div>
        {copyable ? (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label} code`}
            className="inline-flex shrink-0 items-center gap-1 border border-transparent px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#8FA3BD] transition-colors hover:border-[#1E2C44] hover:text-[#C8D5E4] focus-visible:border-[var(--lab-orange)] focus-visible:text-[#C8D5E4] focus-visible:outline-none"
          >
            {copied ? <Check className="size-3 text-[#28C840]" /> : <Copy className="size-3" />}
            {copied ? "copied" : "copy"}
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-[auto_1fr]">
        <div
          aria-hidden
          className="select-none border-r border-[#1E2C44] bg-[#0B1220] px-2 py-3 text-right font-mono text-[10.5px] leading-[1.65] text-[#5C6E80]"
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <div key={index} className="px-1">
              {String(index + 1).padStart(2, "0")}
            </div>
          ))}
        </div>
        <pre className="m-0 overflow-x-auto bg-[#0B1320] py-3 pl-3 pr-4 font-mono text-[12.5px] leading-[1.65] text-[#E6EAF2]">
          <code
            data-language={langKey}
            className="block whitespace-pre"
            onCopy={(event) => {
              if (event.clipboardData) {
                event.clipboardData.setData("text/plain", code)
                event.preventDefault()
              }
            }}
          >
            {displayContent || "\u200B"}
          </code>
        </pre>
      </div>
    </figure>
  )
}

export function CodeBlockNodeView({ node }: NodeViewProps) {
  const language = (node.attrs?.language as string | undefined) ?? ""
  const code = node.textContent
  return <CodeBlockFrame code={code} language={language} copyable />
}

export function extractTextFromChildren(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean" || value == null) return ""
  if (Array.isArray(value)) return value.map(extractTextFromChildren).join("")
  if (typeof value === "object" && value !== null && "text" in value) {
    const candidate = (value as { text?: unknown }).text
    if (typeof candidate === "string") return candidate
  }
  if (typeof value === "object" && value !== null) {
    const content = (value as { content?: unknown }).content
    if (Array.isArray(content)) return content.map(extractTextFromChildren).join("")
  }
  return ""
}
