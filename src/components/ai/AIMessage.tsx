import { motion } from "motion/react"
import { ArrowUpRight, BookOpen, Bot, User } from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { AIMessage as AIMessageType } from "#/hooks/useAIChat"
import { MarkdownLite } from "#/components/ai/MarkdownLite"
import { cn } from "#/lib/utils"

export function AIMessage({ message }: { message: AIMessageType }) {
  const isUser = message.role === "user"
  const related = isUser ? null : message.related

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex items-start gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border",
          isUser
            ? "border-[var(--lab-line)] bg-[var(--lab-card-elevated)] text-[var(--lab-ink-soft)]"
            : "border-[var(--lab-orange)]/40 bg-[var(--lab-orange-soft)] text-[var(--lab-orange)]",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div className="flex max-w-[min(640px,72%)] flex-col gap-2">
        <div
          className={cn(
            "rounded-lg border px-4 py-3 tracking-[-0.005em]",
            isUser
              ? "border-[var(--lab-line)] bg-[var(--lab-card)] text-[var(--lab-ink)]"
              : "border-[var(--lab-line)] bg-[var(--lab-card-elevated)] text-[var(--lab-ink)]",
          )}
        >
          {message.content ? (
            <MarkdownLite source={message.content} />
          ) : (
            !isUser && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
                <span className="size-1 animate-pulse rounded-full bg-[var(--lab-orange)]" />
                composing
              </span>
            )
          )}
        </div>
        {related && related.length > 0 && (
          <motion.aside
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.1 }}
            className="border-l border-[var(--lab-orange)]/40 bg-[var(--lab-card)]/60 pl-3"
          >
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
              <BookOpen className="size-3" aria-hidden />
              Related research
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {related.map((article) => (
                <li key={article.id}>
                  <Link
                    to="/research/$slug"
                    params={{ slug: article.slug }}
                    className="group flex items-center justify-between gap-2 text-[12.5px] leading-snug text-[var(--lab-ink-soft)] no-underline transition-colors hover:text-[var(--lab-orange)]"
                  >
                    <span className="truncate">{article.title}</span>
                    <ArrowUpRight
                      className="size-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.aside>
        )}
      </div>
    </motion.div>
  )
}

void escapeHtml

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      case "'":
        return "&#39;"
      default:
        return ch
    }
  })
}
