import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export function AskLabsFab() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    document.addEventListener("ask-labs:open", handler)
    return () => document.removeEventListener("ask-labs:open", handler)
  }, [])

  function openAskLabs() {
    document.dispatchEvent(new CustomEvent("ask-labs:open"))
  }

  return (
    <>
      <button
        type="button"
        onClick={openAskLabs}
        aria-label="Open Ask Labs"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 border border-[var(--lab-line)] bg-[var(--lab-bg-soft)] px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-[var(--lab-ink)] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] transition-all hover:border-[var(--lab-orange)] hover:text-[var(--lab-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lab-bg)]"
      >
        <Sparkles className="size-3.5 text-[var(--lab-orange)]" aria-hidden />
        Ask Labs
      </button>
      <span aria-live="polite" className="sr-only">
        {open ? "Ask Labs dialog open" : ""}
      </span>
    </>
  )
}
