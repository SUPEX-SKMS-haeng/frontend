import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
  isAuthenticatedAtom,
  userAtom,
  selectedGroupAtom,
  userGroupsAtom,
} from '@/store/auth/auth';
import { authRefresh } from '@/api/auth/auth';
import { hasAdminPageAccess } from '@/utils/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [user, setUser] = useAtom(userAtom);
  const [, setSelectedGroup] = useAtom(selectedGroupAtom);
  const [, setUserGroups] = useAtom(userGroupsAtom);

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
            if (res.user.role.organizations.length > 0) {
              setSelectedGroup({
                orgId: res.user.role.organizations[0].orgId,
                orgName: res.user.role.organizations[0].orgName,
                orgDescription:
                  res.user.role.organizations[0].orgDescription ?? '',
                role: res.user.role.organizations[0].role,
              });
              setUserGroups(
                res.user.role.organizations.map((org) => ({
                  orgId: org.orgId,
                  orgName: org.orgName,
                  orgDescription: org.orgDescription ?? '',
                  role: org.role,
                }))
              );
            }
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
  }, [isAuthenticated, setIsAuthenticated, user, setUser, setSelectedGroup, setUserGroups]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (requireAdmin && user && !hasAdminPageAccess(user.role)) {
    return (
      <Navigate
        to='/403'
        state={{ from: location, reason: 'ADMIN_ACCESS_DENIED' }}
        replace
      />
    );
  }

  return <>{children}</>;
};
