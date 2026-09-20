import { AskLabsMessage } from "#/components/asklabs/AskLabsMessage"
import type { AskLabsMessage as AskLabsMessageType } from "#/hooks/useAskLabs"

export function AskLabsMessageList({ messages }: { messages: AskLabsMessageType[] }) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((message) => (
        <AskLabsMessage key={message.id} message={message} />
      ))}
    </div>
  )
}
