import type {
  ILLMDeploymentListResponse,
  ILLMDeploymentItemResponse,
} from '@/types/deployment';
import { axiosInstance } from '@shared/lib/axios';

const URL_PREFIX = '/llm-gateway/deployments';

// LLM 목록 조회
export const getDeploymentList = async (params: {
  offset?: number;
  limit?: number;
  searchKeyword?: string;
  searchCategory?: string;
  order?: 'asc' | 'desc';
  sort?: string;
}) => {
  const { data } = await axiosInstance.get<ILLMDeploymentListResponse>(
    URL_PREFIX,
    { params }
  );
  return data;
};

// LLM 추가
export const createDeployment = async (body: {
  provider: string;
  modelName: string;
  modelVersion: string;
  deploymentName: string;
  endpoint: string;
  accessKey: string;
  isActive: boolean;
}) => {
  const { data } = await axiosInstance.post<ILLMDeploymentItemResponse>(
    URL_PREFIX,
    body
  );
  return data;
};

// LLM 수정
export const updateDeployment = async (
  deploymentId: number,
  body: Partial<{
    deploymentName: string;
    endpoint: string;
    accessKey: string;
    isActive: boolean;
  }>
) => {
  const { data } = await axiosInstance.patch<ILLMDeploymentItemResponse>(
    `${URL_PREFIX}/${deploymentId}`,
    body
  );
  return data;
};

// LLM 삭제
export const deleteDeployment = async (deploymentId: number): Promise<any> => {
  const { data } = await axiosInstance.delete(`${URL_PREFIX}/${deploymentId}`);
  return data;
};
