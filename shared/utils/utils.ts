import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';
import type { UserRole } from '../types/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clearLocalStorageAuthData = () => {
  localStorage.clear();
};

interface ApiErrorPayload {
  error?: {
    code?: number;
    name?: string;
    message?: string;
  };
}

const DEFAULT_LOGIN_ERROR_MESSAGE =
  '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
const INACTIVE_USER_ERROR_MESSAGE =
  '현재 비활성화된 계정입니다. 관리자에게 문의해주세요.';
export const ADMIN_ACCESS_DENIED_MESSAGE =
  '접근 권한이 없는 계정입니다. 관리자에게 문의해주세요.';

export const getLoginErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return DEFAULT_LOGIN_ERROR_MESSAGE;
  }

  const axiosError = error as { response?: { data?: ApiErrorPayload } };
  const errorName = axiosError.response?.data?.error?.name;
  const errorCode = axiosError.response?.data?.error?.code;

  if (errorName === 'INACTIVE_USER' || errorCode === 12001) {
    return INACTIVE_USER_ERROR_MESSAGE;
  }

  return DEFAULT_LOGIN_ERROR_MESSAGE;
};

export const hasAdminPageAccess = (
  role: UserRole | null | undefined
): boolean => {
  if (!role) {
    return false;
  }

  const defaultRole = role.default?.toLowerCase();
  if (defaultRole === 'superadmin' || defaultRole === 'admin') {
    return true;
  }

  if (defaultRole === 'common') {
    return role.organizations.some(
      (organization) => organization.role?.toLowerCase() === 'admin'
    );
  }

  return false;
};
