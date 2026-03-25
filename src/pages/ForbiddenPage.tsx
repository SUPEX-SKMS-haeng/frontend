import { useTranslation } from 'react-i18next'

const ForbiddenPage = () => {
  const { t } = useTranslation()

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">403</h1>
        <p className="mt-4 text-gray-500">{t('common.forbidden')}</p>
      </div>
    </div>
  )
}

export default ForbiddenPage
