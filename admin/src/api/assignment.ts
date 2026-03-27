import type {
  ILLMAssignmentByOrgResponse,
  ILLMAssignment,
} from '@/types/assignment';
import { axiosInstance } from '@shared/lib/axios';

const URL_PREFIX = '/llm-gateway/deployments';

// 조직에 할당된 LLM 목록 조회
export const getAssignmentsByOrg = async (
  orgId: number | string,
  params?: {
    searchKeyword?: string;
    searchCategory?: string;
    order?: 'asc' | 'desc';
    sort?: string;
    offset?: number;
    limit?: number;
  }
) => {
  const url = `${URL_PREFIX}/assignments/org/${orgId}`;
  const { data } = await axiosInstance.get<ILLMAssignmentByOrgResponse>(url, {
    params,
  });
  return data;
};

// 조직에 할당할 모델 추가
export const createAssignment = async (body: {
  deploymentId: number;
  orgId: number;
}) => {
  const { data } = await axiosInstance.post<ILLMAssignment>(
    `${URL_PREFIX}/assignments`,
    body
  );
  return data;
};

// 조직에 할당한 LLM 삭제
export const deleteAssignment = async (assignmentId: number) => {
  const { data } = await axiosInstance.delete(
    `${URL_PREFIX}/assignments/${assignmentId}`
  );
  return data;
};
