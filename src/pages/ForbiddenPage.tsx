import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-surface'>
      <h1 className='text-6xl font-bold text-text-primary mb-4'>403</h1>
      <p className='text-text-secondary mb-8'>{t('error.forbidden')}</p>
      <button
        onClick={() => navigate('/')}
        className='px-6 py-3 text-15 font-medium text-white bg-accent rounded-10 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors'
      >
        {t('error.goHome')}
      </button>
    </div>
  );
};

export default ForbiddenPage;
