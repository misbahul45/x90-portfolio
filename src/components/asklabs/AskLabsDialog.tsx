import { useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog"
import { useAskLabs } from "#/hooks/useAskLabs"
import { AskLabsHeader } from "#/components/asklabs/AskLabsHeader"
import { AskLabsStarters } from "#/components/asklabs/AskLabsStarters"
import { AskLabsMessageList } from "#/components/asklabs/AskLabsMessageList"
import { AskLabsInput } from "#/components/asklabs/AskLabsInput"
import { AskLabsSystemTrace } from "#/components/asklabs/AskLabsSystemTrace"

export function AskLabsDialog({ currentPath }: { currentPath: string }) {
  const {
    isOpen,
    setIsOpen,
    context,
    messages,
    phase,
    phaseLabel,
    isStreaming,
    quickActions,
    submit,
    reset,
    stop,
    showTrace,
    setShowTrace,
    landingQuestion,
    scrollerRef,
    onScrollerScroll,
    stuckAtBottomRef,
  } = useAskLabs(currentPath)

  useEffect(() => {
    const handler = () => setIsOpen(true)
    document.addEventListener("ask-labs:open", handler)
    return () => document.removeEventListener("ask-labs:open", handler)
  }, [setIsOpen])

  // Auto-scroll only when user is at bottom (preserve reading position).
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!stuckAtBottomRef.current) return
    sentinelRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [messages, stuckAtBottomRef])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton
        className="flex h-[min(820px,calc(100dvh-2rem))] w-[min(1080px,calc(100vw-2rem))] max-w-[1080px] flex-col gap-0 overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-bg)] p-0 shadow-[0_40px_120px_-24px_rgba(0,0,0,0.7)] sm:!max-w-[1080px]"
      >
        <DialogTitle className="sr-only">Ask Labs — XNINETZY Labs</DialogTitle>
        <AskLabsHeader context={context} showTrace={showTrace} onToggleTrace={() => setShowTrace((v) => !v)} />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            <div
              ref={(node) => {
                scrollerRef.current = node
                onScrollerScroll()
              }}
              onScroll={onScrollerScroll}
              className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8"
            >
              <div className="mx-auto w-full max-w-[760px]">
                {messages.length === 0 ? (
                  <AskLabsStarters
                    context={context}
                    actions={quickActions}
                    landingQuestion={landingQuestion}
                    onSelect={(action) => void submit(action.prompt)}
                  />
                ) : (
                  <AskLabsMessageList messages={messages} />
                )}
                <div ref={sentinelRef} aria-hidden className="h-px w-full" />
              </div>
            </div>
            <AskLabsInput
              onSubmit={(value) => void submit(value)}
              onClear={reset}
              onStop={stop}
              disabled={isStreaming}
              isStreaming={isStreaming}
              phaseLabel={phaseLabel}
            />
          </div>
          {showTrace ? (
            <aside className="hidden w-[260px] shrink-0 border-l border-[var(--lab-line)] bg-[var(--lab-card)]/40 lg:block">
              <AskLabsSystemTrace context={context} messages={messages} phase={phase} />
            </aside>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
