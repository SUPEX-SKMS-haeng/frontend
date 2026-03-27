import { axiosInstance } from '@/lib/axios';
import type { LoginRequest, LoginResponse } from '@/types/auth/auth';

const URL_PREFIX = `/auth`;

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    `${URL_PREFIX}/login`,
    data
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post(`${URL_PREFIX}/logout`);
};

export const verifyToken = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get<boolean>(`${URL_PREFIX}/verify`);
    return response.data;
  } catch {
    return false;
  }
};

// 사용자 정보 갱신 (토큰으로 사용자 정보 다시 가져오기)
export const authRefresh = async (): Promise<LoginResponse> => {
  const accessToken = localStorage.getItem('accessToken');
  const res = await axiosInstance.get<LoginResponse['user']>(
    `${URL_PREFIX}/user/me`
  );

  return {
    accessToken: accessToken ?? '',
    user: res.data,
  };
};
