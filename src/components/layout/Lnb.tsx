import { useTranslation } from 'react-i18next'
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  MessageSquare,
  User,
} from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useSidebar } from '@/hooks/useSidebar'
import { mockUserProfile } from '@/data/chatData'

const Lnb = () => {
  const { t } = useTranslation()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { conversations, selectedConversationId, selectConversation, startNewChat } = useChat()

  return (
    <aside
      className={`flex flex-col border-r border-border bg-muted/50 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!isCollapsed && (
          <span className="text-lg font-semibold text-foreground">Logo</span>
        )}
        <button
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring active:bg-accent/80"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-3">
        <button
          className={`flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring active:bg-accent/80 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          onClick={startNewChat}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>{t('chat.newChat')}</span>}
        </button>
      </div>

      {/* Conversation List */}
      <nav className="flex-1 overflow-y-auto px-3 pt-1">
        <ul className="space-y-1">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring active:bg-accent/80 ${
                  selectedConversationId === conversation.id
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-muted-foreground'
                } ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => selectConversation(conversation.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  conversation.status === 'generating' ? (
                    <span className="shimmer-text truncate">{t('chat.chatting')}</span>
                  ) : (
                    <span className="truncate">{conversation.title}</span>
                  )
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - User Profile */}
      <div className="border-t border-border px-3 py-3">
        <div
          className={`flex items-center gap-3 rounded-md px-2 py-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {mockUserProfile.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {mockUserProfile.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Lnb
