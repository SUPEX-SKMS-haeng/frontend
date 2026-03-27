import type { IMemberListResponse, IMemberResponse } from '@/types/member';
import { axiosInstance } from '@shared/lib/axios';

const URL_PREFIX = '/auth/organization';

// 조직 멤버 목록 조회
export const getMembersByOrg = async (
  orgId: number | string,
  params: {
    offset?: number;
    limit?: number;
    role?: string;
    searchCategory?: string;
    searchKeyword?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}
) => {
  const { data } = await axiosInstance.get<IMemberListResponse>(
    `${URL_PREFIX}/${orgId}/members`,
    { params }
  );
  return data;
};

// 멤버 추가
export const addMember = async (body: {
  orgId: number;
  userId: number;
  role: string;
}) => {
  const { data } = await axiosInstance.post<IMemberResponse>(
    `${URL_PREFIX}/members`,
    body
  );
  return data;
};

// 멤버 역할 수정
export const updateMemberRole = async (
  memberId: number,
  body: {
    orgId: number;
    role: string;
  }
) => {
  const { data } = await axiosInstance.patch<IMemberResponse>(
    `${URL_PREFIX}/members/${memberId}`,
    body
  );
  return data;
};

// 멤버 제거
export const removeMember = async (
  orgId: number | string,
  userId: number | string
) => {
  const { data } = await axiosInstance.delete(
    `${URL_PREFIX}/${orgId}/member/${userId}`
  );
  return data;
};
