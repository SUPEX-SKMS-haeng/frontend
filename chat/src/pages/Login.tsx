import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { LoginForm } from '@shared/components/auth';
import { useAuth } from '@shared/hooks/useAuth';
import { getLoginErrorMessage } from '@shared/utils/utils';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data: { id: string; password: string }) => {
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
                  아이디
                </label>
                <input
                  id='id'
                  type='text'
                  value={id}
                  onChange={(e) => handleIdChange(e.target.value)}
                  disabled={isLoading}
                  className='w-full px-4 py-3 text-14 border border-border rounded-10 bg-white text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-surface-secondary disabled:cursor-not-allowed'
                  placeholder='아이디를 입력하세요'
                  autoComplete='username'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-14 font-medium text-text-primary mb-2.5'
                >
                  비밀번호
                </label>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  disabled={isLoading}
                  className='w-full px-4 py-3 text-14 border border-border rounded-10 bg-white text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-surface-secondary disabled:cursor-not-allowed'
                  placeholder='비밀번호를 입력하세요'
                  autoComplete='current-password'
                />
              </div>

              {error && (
                <div className='px-4 py-3 text-14 text-red-600 bg-red-50 border border-red-200 rounded-10'>
                  {getLoginErrorMessage(error)}
                </div>
              )}

              <div className='pt-2'>
                <button
                  type='submit'
                  disabled={isLoading || !id || !password}
                  className='w-full py-3 text-15 font-medium text-white bg-accent rounded-10 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:bg-text-tertiary disabled:cursor-not-allowed transition-colors'
                >
                  {isLoading ? '로그인 중...' : '로그인'}
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
