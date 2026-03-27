import { LlmAssignmentResponse } from '@/types/llmGateway';
import { axiosInstance } from '@shared/lib/axios';

const URL_PREFIX = `/llm-gateway`;

export const fetchMyLlmAssignments = async (
  orgId: number
): Promise<LlmAssignmentResponse> => {
  const { data } = await axiosInstance.get<LlmAssignmentResponse>(
    `${URL_PREFIX}/deployments/assignments/org/${orgId}`
  );
  return data;
};
