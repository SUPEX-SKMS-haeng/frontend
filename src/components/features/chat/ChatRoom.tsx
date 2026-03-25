import { useRef, useEffect } from 'react'
import ChatMessage from '@/components/features/chat/ChatMessage'
import ChatInput from '@/components/features/chat/ChatInput'
import LoadingIndicator from '@/components/features/chat/LoadingIndicator'
import { useChat } from '@/hooks/useChat'

const ChatRoom = () => {
  const { currentMessages, isGenerating, isStreaming, sendMessage, stopGeneration } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, isGenerating, isStreaming])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {currentMessages.map((message, index) => {
            const isLastMessage = index === currentMessages.length - 1
            return (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={isStreaming && isLastMessage}
              />
            )
          })}
          {isGenerating && <LoadingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="bg-background px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <ChatInput isGenerating={isGenerating || isStreaming} onStop={stopGeneration} onSubmit={sendMessage} />
        </div>
      </div>
    </div>
  )
}

export default ChatRoom
