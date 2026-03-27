import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, userAtom } from '@shared/store/auth';
import { authRefresh } from '@shared/api/auth';
import { hasAdminPageAccess } from '@shared/utils/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          setIsAuthenticated(true);
        }
      }
    };

    const checkUser = async () => {
      if (isAuthenticated && !user) {
        try {
          const res = await authRefresh();
          if (res && res.user) {
            setUser(res.user);
          }
        } catch (error) {
          console.error('Auth refresh failed:', error);
        }
      }
    };

    const initializeAuth = async () => {
      checkAuth();
      await checkUser();
      setIsLoading(false);
    };

    initializeAuth();
  }, [isAuthenticated, setIsAuthenticated, user, setUser]);

  if (isLoading) {
    return null; // 또는 로딩 스피너
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (user && !hasAdminPageAccess(user.role)) {
    return (
      <Navigate
        to='/login'
        state={{ from: location, reason: 'ADMIN_ACCESS_DENIED' }}
        replace
      />
    );
  }

  return <>{children}</>;
};
