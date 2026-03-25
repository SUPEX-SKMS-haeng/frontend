import { useTranslation } from 'react-i18next'
import ChatInput from '@/components/features/chat/ChatInput'
import ChatRoom from '@/components/features/chat/ChatRoom'
import { useChat } from '@/hooks/useChat'

const Chat = () => {
  const { t } = useTranslation()
  const { selectedConversationId, createNewChat } = useChat()

  if (selectedConversationId) {
    return <ChatRoom />
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <h1 className="mb-8 text-4xl font-semibold text-foreground">
        {t('chat.welcome')}
      </h1>
      <div className="w-full max-w-2xl">
        <ChatInput onSubmit={createNewChat} />
      </div>
    </div>
  )
}

export default Chat
