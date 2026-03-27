import type {
  IUserListResponse,
  IUserItemResponse,
  IUserBulkDeleteResponse,
} from '@/types/admin/user';
import { axiosInstance } from '@/lib/axios';

const URL_PREFIX = '/auth/user';

// 사용자 목록 조회
export const getUserList = async (params: {
  offset: number;
  limit: number;
  searchCategory?: string;
  searchKeyword?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  role?: string;
  isActive?: boolean | null;
}) => {
  const { data } = await axiosInstance.get<IUserListResponse>(URL_PREFIX, {
    params,
  });
  return data;
};

// 사용자 생성
export const createUser = async (body: {
  userId: string;
  email: string | null;
  username: string;
  department: string | null;
  company: string;
  password: string;
  role: string;
  isActive: boolean;
}) => {
  const { data } = await axiosInstance.post<IUserItemResponse>(
    URL_PREFIX,
    body
  );
  return data;
};

// 사용자 수정
export const updateUser = async (body: {
  userId: string;
  username: string;
  company: string;
  role: string;
  isActive: boolean;
}) => {
  const { data } = await axiosInstance.patch<IUserItemResponse>(
    URL_PREFIX,
    body
  );
  return data;
};

// 단일 삭제
export const deleteUser = async (userId: string) => {
  const response: boolean = await axiosInstance.delete(
    `${URL_PREFIX}/${userId}`
  );
  return response;
};

// 다중 삭제
export const deleteBulkUsers = async (userIds: string[]) => {
  const { data } = await axiosInstance.delete<IUserBulkDeleteResponse>(
    `${URL_PREFIX}/bulk`,
    {
      data: { userIds },
    }
  );
  return data;
};
