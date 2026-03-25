import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SendHorizontal, Square } from 'lucide-react'

interface ChatInputProps {
  isGenerating?: boolean
  onStop?: () => void
  onSubmit?: (value: string) => void
}

const ChatInput = ({ isGenerating = false, onStop, onSubmit }: ChatInputProps) => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim() && !isGenerating) {
      onSubmit?.(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex w-full items-end gap-2 rounded-xl border border-border bg-background p-3 shadow-sm transition-colors focus-within:border-ring">
      <textarea
        className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        rows={2}
        placeholder={t('chat.inputPlaceholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {isGenerating ? (
        <button
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-sm text-destructive-foreground transition-colors hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring active:bg-destructive/80"
          onClick={onStop}
        >
          <Square className="h-4 w-4" />
          <span>{t('chat.stop')}</span>
        </button>
      ) : (
        <button
          className={`shrink-0 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
            value.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80'
              : 'cursor-not-allowed bg-muted text-muted-foreground'
          }`}
          disabled={!value.trim()}
          onClick={handleSubmit}
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default ChatInput
