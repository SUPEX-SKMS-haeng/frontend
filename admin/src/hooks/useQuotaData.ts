import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { getQuotaUsage, updateQuota } from '@/api/quota';
import type {
  IQuotaUpdateResponse,
  IQuotaUsageResponse,
  IUpdateQuotaRequest,
  QuotaUsage,
} from '@/types/quota';
import { queryClient } from '@shared/lib/queryClient';
import { selectedOrgIdAtom } from '@/store/organizationUI';
import { quotaUsageParamsAtom } from '@/store/quotaUI';

const QUOTA_DATA_KEY = ['quota'];

const mapQuotaUsageResponse = (res: IQuotaUsageResponse): QuotaUsage => ({
  orgId: res.orgId ?? 0,
  monthlyLimit: res.monthlyLimit,
  monthlyUsed: res.monthlyUsed,
  monthlyRemaining: res.monthlyRemaining,
  dailyLimit: res.dailyLimit,
  dailyUsed: res.dailyUsed,
  dailyRemaining: res.dailyRemaining,
  agentList: (res.agentList ?? []).map((agent) => ({
    agentId: agent.agentId ?? 0,
    agentName: agent.agentName ?? '',
    outputMaxTokens: agent.outputMaxTokens ?? 0,
  })),
  totalCount: res.totalCount ?? 0,
  nextOffset: res.nextOffset ?? 0,
});

export const getQuotaUsageAtom = atomWithQuery((get) => {
  const orgId = get(selectedOrgIdAtom);
  const params = get(quotaUsageParamsAtom);
  return {
    queryKey: [...QUOTA_DATA_KEY, 'usage', orgId, params],
    queryFn: async (): Promise<QuotaUsage | null> => {
      if (orgId == null) return null;
      const res = await getQuotaUsage(orgId, params);
      return mapQuotaUsageResponse(res);
    },
    staleTime: 0,
    enabled: orgId != null,
  };
});

export const updateQuotaAtom = atomWithMutation(() => ({
  mutationKey: [...QUOTA_DATA_KEY, 'update'],
  mutationFn: async ({
    orgId,
    payload,
  }: {
    orgId: number | string;
    payload: IUpdateQuotaRequest;
  }): Promise<IQuotaUpdateResponse> => {
    const res = await updateQuota(orgId, payload);
    return res;
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...QUOTA_DATA_KEY, 'usage'],
    });
  },
  onError: (error: unknown) => {
    console.error('쿼터 저장 실패:', error);
  },
}));
