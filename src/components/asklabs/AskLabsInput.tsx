import { useEffect, useRef, useState } from "react"
import { ArrowUp, RotateCcw, Square } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Textarea } from "#/components/ui/textarea"

export function AskLabsInput({
  onSubmit,
  onClear,
  onStop,
  disabled,
  isStreaming,
  phaseLabel,
}: {
  onSubmit: (value: string) => void
  onClear: () => void
  onStop?: () => void
  disabled: boolean
  isStreaming: boolean
  phaseLabel: string
}) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue("")
  }

  return (
    <div className="border-t border-[var(--lab-line)] bg-[var(--lab-bg-soft)] px-4 py-3 sm:px-6">
      {(isStreaming || phaseLabel) && (
        <div className="mx-auto mb-2 flex max-w-[760px] items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--lab-ink-soft)]">
          <span
            aria-hidden
            className={`size-1.5 rounded-full ${
              isStreaming ? "bg-[var(--lab-orange)]" : "bg-[var(--lab-line-strong)]"
            } ${isStreaming ? "motion-safe:animate-pulse" : ""}`}
          />
          <span className={isStreaming ? "text-[var(--lab-orange)]" : ""}>{phaseLabel || "Ready"}</span>
        </div>
      )}
      <form
        className="mx-auto flex w-full max-w-[760px] items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder={isStreaming ? "Streaming…" : "Ask about a project, research, or what we build…"}
            rows={1}
            disabled={isStreaming}
            aria-label="Ask Labs question"
            className="min-h-[44px] resize-none border-[var(--lab-line)] bg-[var(--lab-card)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)] focus-visible:border-[var(--lab-orange)] focus-visible:ring-[var(--lab-orange)]/30"
          />
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && onStop ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onStop}
              aria-label="Stop generation"
            >
              <Square className="size-3.5" aria-hidden />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!value.trim() || disabled}
              aria-label="Send message"
            >
              <ArrowUp className="size-4" aria-hidden />
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClear}
            disabled={isStreaming}
            aria-label="Clear conversation"
            className="text-[var(--lab-ink-soft)] hover:text-[var(--lab-ink)]"
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </Button>
        </div>
      </form>
    </div>
  )
}
