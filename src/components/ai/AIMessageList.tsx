import { AIMessage } from "#/components/ai/AIMessage"
import type { AIMessage as AIMessageType } from "#/hooks/useAIChat"

export function AIMessageList({ messages }: { messages: AIMessageType[] }) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((message) => (
        <AIMessage key={message.id} message={message} />
      ))}
    </div>
  )
}
