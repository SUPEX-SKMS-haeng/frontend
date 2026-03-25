import { Streamdown } from 'streamdown'
import type { Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const isUser = message.role === 'user'
  const isCurrentlyStreaming = isStreaming && !isUser

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} py-2`}>
      <div
        className={`max-w-[70%] ${
          isUser
            ? 'rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground'
            : 'text-foreground'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <Streamdown
            mode={isCurrentlyStreaming ? 'streaming' : 'static'}
            animated={isCurrentlyStreaming}
            isAnimating={isCurrentlyStreaming}
          >
            {message.content}
          </Streamdown>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
