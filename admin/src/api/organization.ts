import type {
  IOrganizationListResponse,
  IOrganizationResponse,
} from '@/types/organization';
import { axiosInstance } from '@shared/lib/axios';

const URL_PREFIX = '/auth/organization';

// 조직 목록 조회
export const getOrganizationList = async (params: {
  offset: number;
  limit: number;
  searchCategory?: string;
  searchKeyword?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) => {
  const { data } = await axiosInstance.get<IOrganizationListResponse>(
    URL_PREFIX,
    { params }
  );
  return data;
};

// 조직 상세 조회
export const getOrganization = async (
  orgId: number | string,
  includeMembers = false
) => {
  const { data } = await axiosInstance.get<IOrganizationResponse>(
    `${URL_PREFIX}/detail/${orgId}`,
    { params: { includeMembers } }
  );
  return data;
};

// 조직 생성 (멤버 포함 가능)
export const createOrganization = async (body: {
  name: string;
  description: string;
  members?:
    | {
        userId: number;
        role: string;
      }[]
    | null;
  isActive: boolean;
}) => {
  const { data } = await axiosInstance.post<IOrganizationResponse>(
    URL_PREFIX,
    body
  );
  return data;
};

// 조직 수정
export const updateOrganization = async (
  orgId: number | string,
  body: { name?: string; description?: string; isActive?: boolean }
): Promise<IOrganizationResponse> => {
  const { data } = await axiosInstance.patch<IOrganizationResponse>(
    `${URL_PREFIX}/${orgId}`,
    body
  );
  return data;
};

// 조직 삭제
export const deleteOrganization = async (orgId: number | string) => {
  const { data } = await axiosInstance.delete(`${URL_PREFIX}/${orgId}`);
  return data;
};
