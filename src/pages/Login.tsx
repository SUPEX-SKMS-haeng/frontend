import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { LoginForm } from '@/components/features/auth';
import { useAuth } from '@/hooks/auth/useAuth';
import { getLoginErrorMessage } from '@/utils/utils';

interface LoginLocationState {
  reason?: string;
}

const Login = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const isAdminAccessDenied =
    (location.state as LoginLocationState | null)?.reason ===
    'ADMIN_ACCESS_DENIED';

  useEffect(() => {
    if (isAuthenticated && !isAdminAccessDenied) {
      navigate('/');
    }
  }, [isAuthenticated, isAdminAccessDenied, navigate]);

  const handleLogin = async (data: {
    id: string;
    password: string;
  }): Promise<void> => {
    const success = await login(data);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-surface'>
      <div className='w-full max-w-md px-6 py-8 bg-white rounded-12 shadow-card'>
        <div className='mb-8 text-center'>
          <div className='flex justify-center mb-8'>
            <div className='w-16 h-16 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center shadow-sm'>
              <Zap className='w-8 h-8 text-white' />
            </div>
          </div>
        </div>

        <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error}>
          {({
            id,
            password,
            isLoading,
            error,
            handleIdChange,
            handlePasswordChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div>
                <label
                  htmlFor='id'
                  className='block text-14 font-medium text-text-primary mb-2.5'
                >
                  {t('login.id')}
                </label>
                <input
                  id='id'
                  type='text'
                  value={id}
                  onChange={(e) => handleIdChange(e.target.value)}
                  disabled={isLoading}
                  className='w-full px-4 py-3 text-14 border border-border rounded-10 bg-white text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-surface-secondary disabled:cursor-not-allowed'
                  placeholder={t('login.idPlaceholder')}
                  autoComplete='username'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-14 font-medium text-text-primary mb-2.5'
                >
                  {t('login.password')}
                </label>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  disabled={isLoading}
                  className='w-full px-4 py-3 text-14 border border-border rounded-10 bg-white text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-surface-secondary disabled:cursor-not-allowed'
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete='current-password'
                />
              </div>

              {(isAdminAccessDenied || error) && (
                <div className='px-4 py-3 text-14 text-red-600 bg-red-50 border border-red-200 rounded-10'>
                  {isAdminAccessDenied
                    ? t('login.adminAccessDenied')
                    : getLoginErrorMessage(error)}
                </div>
              )}

              <div className='pt-2'>
                <button
                  type='submit'
                  disabled={isLoading || !id || !password}
                  className='w-full py-3 text-15 font-medium text-white bg-accent rounded-10 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:bg-text-tertiary disabled:cursor-not-allowed transition-colors'
                >
                  {isLoading ? t('login.loggingIn') : t('login.submit')}
                </button>
              </div>
            </form>
          )}
        </LoginForm>
      </div>
    </div>
  );
};

export default Login;
