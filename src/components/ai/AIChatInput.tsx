import { useEffect, useRef, useState } from "react"
import { ArrowUp, FileText, Paperclip, RotateCcw, Square, X } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Textarea } from "#/components/ui/textarea"

const ACCEPTED_TYPES = "application/pdf,text/markdown,text/x-markdown,text/plain"
const ACCEPTED_EXT = ".pdf,.md,.mdx,.markdown,.txt"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function AIChatInput({
  onSubmit,
  onClear,
  onStop,
  disabled,
  isStreaming,
  attachment,
  onUpload,
  onRemoveAttachment,
  uploading,
  uploadError,
}: {
  onSubmit: (value: string) => void
  onClear: () => void
  onStop?: () => void
  disabled: boolean
  isStreaming?: boolean
  attachment?: { name: string; size: number; mimeType: string } | null
  onUpload?: (file: File) => void
  onRemoveAttachment?: () => void
  uploading?: boolean
  uploadError?: string | null
}) {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue("")
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file && onUpload) {
      onUpload(file)
    }
    event.target.value = ""
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

      {attachment && onRemoveAttachment && (
        <div className="mb-2 flex items-center gap-2 border border-[var(--lab-line)] bg-[var(--lab-bg)] px-2.5 py-1.5 text-[11px]">
          <FileText className="size-3 shrink-0 text-[var(--lab-orange)]" aria-hidden />
          <span className="truncate font-mono text-[var(--lab-ink)]">{attachment.name}</span>
          <span className="shrink-0 text-[var(--lab-ink-soft)]">{formatBytes(attachment.size)}</span>
          <button
            type="button"
            onClick={onRemoveAttachment}
            aria-label="Remove attachment"
            className="ml-auto text-[var(--lab-ink-soft)] transition-colors hover:text-[var(--lab-orange)]"
          >
            <X className="size-3" aria-hidden />
          </button>
        </div>
      )}

      {uploadError && (
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">
          {uploadError}
        </p>
      )}

      <div className="flex items-end gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden
        />
        {onUpload && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={isStreaming || uploading}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach PDF or markdown"
            title="PDF or markdown (max 10 MB)"
            className="text-[var(--lab-ink-soft)] hover:text-[var(--lab-orange)]"
          >
            <Paperclip className="size-4" aria-hidden />
          </Button>
        )}
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
            placeholder={
              isStreaming
                ? "Streaming response…"
                : attachment
                  ? "Ask about the document…"
                  : "Ask anything about the lab…"
            }
            rows={1}
            disabled={isStreaming}
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
              disabled={!value.trim() || disabled || uploading}
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
            disabled={isStreaming || uploading}
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
      {!isStreaming && ACCEPTED_EXT.trim() && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lab-ink-soft)]/60">
          PDF · Markdown supported
        </p>
      )}
    </form>
  )
}
