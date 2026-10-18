import { AskLabsMessage } from "#/components/asklabs/AskLabsMessage"
import type { AskLabsMessage as AskLabsMessageType, AskLabsPhase } from "#/hooks/useAskLabs"

export function AskLabsMessageList({
  messages,
  phase,
}: {
  messages: AskLabsMessageType[]
  phase: AskLabsPhase
}) {
  const lastId = messages[messages.length - 1]?.id

  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((message) => (
        <AskLabsMessage
          key={message.id}
          message={message}
          phase={message.id === lastId ? phase : undefined}
        />
      ))}
    </div>
  )
}
