import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMutation } from '@tanstack/react-query';
import { login, logout as logoutApi } from '../api/auth';
import { selectedGroupAtom, userAtom, userGroupsAtom } from '../store/auth';
import type { LoginRequest } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useAtom(userAtom);
  const setSelectedGroup = useSetAtom(selectedGroupAtom);
  const setUserGroups = useSetAtom(userGroupsAtom);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      if (data.user.role.organizations.length > 0) {
        setSelectedGroup({
          orgId: data.user.role.organizations[0].orgId,
          orgName: data.user.role.organizations[0].orgName,
          orgDescription: data.user.role.organizations[0].orgDescription ?? '',
          role: data.user.role.organizations[0].role,
        });
        setUserGroups(
          data.user.role.organizations.map((org) => ({
            orgId: org.orgId,
            orgName: org.orgName,
            orgDescription: org.orgDescription ?? '',
            role: org.role,
          }))
        );
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const handleLogin = async (data: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated: !!user && !!localStorage.getItem('accessToken'),
    login: handleLogin,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};

export const useCurrentUser = () => {
  const user = useAtomValue(userAtom);
  const isSuperAdmin = user?.role?.default?.toLowerCase() === 'superadmin';
  return {
    user,
    userId: user?.userId ?? '',
    isSuperAdmin,
  };
};
