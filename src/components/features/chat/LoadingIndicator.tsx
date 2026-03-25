import { useTranslation } from 'react-i18next'

const LoadingIndicator = () => {
  const { t } = useTranslation()

  return (
    <div className="flex items-start gap-3 py-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <div className="loading-dot h-2 w-2 rounded-full bg-foreground" />
          <div className="loading-dot h-2 w-2 rounded-full bg-foreground" />
          <div className="loading-dot h-2 w-2 rounded-full bg-foreground" />
        </div>
        <span className="shimmer-text text-sm font-medium">
          {t('chat.generating')}
        </span>
      </div>
    </div>
  )
}

export default LoadingIndicator
