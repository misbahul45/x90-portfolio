import { motion } from "motion/react"
import { Bot, User } from "lucide-react"
import type { AskLabsMessage as AskLabsMessageType } from "#/hooks/useAskLabs"
import { MarkdownLite } from "#/components/ai/MarkdownLite"
import { AskLabsSources } from "#/components/asklabs/AskLabsSources"
import { cn } from "#/lib/utils"

export function AskLabsMessage({ message }: { message: AskLabsMessageType }) {
  const isUser = message.role === "user"
  const sources = isUser ? null : message.sources

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
            message.error
              ? "border-destructive/40 bg-destructive/5 text-[var(--lab-ink)]"
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
        {sources && sources.length > 0 ? <AskLabsSources sources={sources} /> : null}
      </div>
    </motion.div>
  )
}
