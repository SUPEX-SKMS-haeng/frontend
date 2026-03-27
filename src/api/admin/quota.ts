import type {
  IQuotaUpdateResponse,
  IQuotaUsageResponse,
  IUpdateQuotaRequest,
} from '@/types/admin/quota';
import { axiosInstance } from '@/lib/axios';

const URL_PREFIX = '/llm-gateway/quotas';

export const getQuotaUsage = async (
  orgId: number | string,
  params: {
    offset: number;
    limit: number;
    sortBy: 'agent_name' | 'output_max_tokens';
    order: 'asc' | 'desc';
  }
) => {
  const { data } = await axiosInstance.get<IQuotaUsageResponse>(
    `${URL_PREFIX}/${orgId}/usage`,
    { params }
  );
  return data;
};

export const updateQuota = async (
  orgId: number | string,
  body: IUpdateQuotaRequest
) => {
  const { data } = await axiosInstance.patch<IQuotaUpdateResponse>(
    `${URL_PREFIX}/${orgId}`,
    body
  );
  return data;
};
