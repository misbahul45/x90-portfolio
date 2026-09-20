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
}: {
  onSubmit: (value: string) => void
  onClear: () => void
  onStop?: () => void
  disabled: boolean
  isStreaming: boolean
}) {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
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
    <form
      className="relative border-t border-[var(--lab-line)] bg-[var(--lab-card)] px-3 py-2.5"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-3 top-0 h-px transition-opacity duration-300 ${
          focused ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(246,90,11,0.6) 50%, transparent 100%)",
        }}
      />
      <div className="flex items-end gap-1.5">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder={isStreaming ? "Streaming response…" : "Ask about a project, research, or what we build…"}
            rows={1}
            disabled={isStreaming}
            aria-label="Ask Labs question"
            className="min-h-9 resize-none border-[var(--lab-line)] bg-[var(--lab-bg)] text-[13.5px] leading-relaxed text-[var(--lab-ink)] placeholder:text-[var(--lab-ink-soft)] focus-visible:border-[var(--lab-orange)] focus-visible:ring-[var(--lab-orange)]/30"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {isStreaming && onStop ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onStop}
              aria-label="Stop streaming"
              className="shadow-[0_0_18px_-6px_rgba(246,90,11,0.6)]"
            >
              <Square className="size-3.5" aria-hidden />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!value.trim() || disabled}
              aria-label="Send message"
              className="shadow-[0_0_18px_-6px_rgba(246,90,11,0.7)]"
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
      </div>
      {isStreaming && (
        <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--lab-orange)] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[var(--lab-orange)]" />
          </span>
          streaming
        </p>
      )}
      {!isStreaming && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]/60">
          Public knowledge only · cite sources when you can
        </p>
      )}
    </form>
  )
}
