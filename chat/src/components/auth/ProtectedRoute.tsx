import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import {
  isAuthenticatedAtom,
  selectedGroupAtom,
  userGroupsAtom,
} from '@shared/store/auth';
import { userAtom } from '@shared/store/auth';
import { authRefresh } from '@shared/api/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [user, setUser] = useAtom(userAtom);
  const [selectedGroup, setSelectedGroup] = useAtom(selectedGroupAtom);
  const [userGroups, setUserGroups] = useAtom(userGroupsAtom);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    };
    const checkUser = async () => {
      console.log('checkUser', isAuthenticated, user);
      if (isAuthenticated && !user) {
        try {
          const res = await authRefresh();
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
        } catch (error) {
          console.error('Auth refresh failed:', error);
        }
      }
    };

    checkAuth();
    checkUser();
  }, [isAuthenticated, setIsAuthenticated, user, setUser]);

  if (isLoading) {
    return null; // 또는 로딩 스피너
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
