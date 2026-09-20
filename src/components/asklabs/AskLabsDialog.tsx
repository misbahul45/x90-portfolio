import { useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog"
import { ScrollArea } from "#/components/ui/scroll-area"
import { useAskLabs } from "#/hooks/useAskLabs"
import { AskLabsHeader } from "#/components/asklabs/AskLabsHeader"
import { AskLabsStarters } from "#/components/asklabs/AskLabsStarters"
import { AskLabsMessageList } from "#/components/asklabs/AskLabsMessageList"
import { AskLabsExecutionState } from "#/components/asklabs/AskLabsExecutionState"
import { AskLabsInput } from "#/components/asklabs/AskLabsInput"

export function AskLabsDialog({ currentPath }: { currentPath: string }) {
  const {
    isOpen,
    setIsOpen,
    context,
    messages,
    stage,
    quickActions,
    submit,
    reset,
    stop,
    landingQuestion,
  } = useAskLabs(currentPath)

  useEffect(() => {
    const handler = () => setIsOpen(true)
    document.addEventListener("ask-labs:open", handler)
    return () => document.removeEventListener("ask-labs:open", handler)
  }, [setIsOpen])

  const isStreaming = stage !== "idle" && stage !== "completed" && stage !== "error"
  const title = context.kind === "project" || context.kind === "research" ? context.slug ?? null : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton
        className="flex h-[min(820px,calc(100vh-2rem))] w-[min(1240px,calc(100vw-2rem))] max-w-[1240px] flex-col gap-0 overflow-hidden border border-[var(--lab-line)] bg-[var(--lab-bg)] p-0 shadow-[0_40px_120px_-24px_rgba(0,0,0,0.75)] sm:!max-w-[1240px]"
      >
        <DialogTitle className="sr-only">Ask Labs · XNINETZY Labs</DialogTitle>
        <AskLabsHeader title={title} />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            <ScrollArea className="flex-1 px-5 py-5 sm:px-7 sm:py-6">
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
            </ScrollArea>
            <AskLabsInput
              onSubmit={(value) => void submit(value)}
              onClear={reset}
              onStop={stop}
              disabled={isStreaming}
              isStreaming={isStreaming}
            />
          </div>
          {isStreaming && (
            <aside className="hidden w-[220px] shrink-0 flex-col border-l border-[var(--lab-line)] bg-[var(--lab-card)]/40 lg:flex">
              <div className="flex items-center gap-2 border-b border-[var(--lab-line)] px-3 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--lab-orange)]">
                  Pipeline
                </p>
                <span className="ml-auto inline-flex size-1.5 rounded-full bg-[var(--lab-orange)]">
                  <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-[var(--lab-orange)] opacity-75" />
                </span>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <AskLabsExecutionState stage={stage} />
              </div>
            </aside>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
