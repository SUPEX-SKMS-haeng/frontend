import {
  getDeploymentList,
  createDeployment,
  updateDeployment,
  deleteDeployment,
} from '@/api/admin/deployment';
import { queryClient } from '@/lib/queryClient';
import type {
  Deployment,
  CreateDeploymentForm,
  EditDeploymentForm,
  ILLMDeploymentItemResponse,
} from '@/types/admin/deployment';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { deploymentListParamsAtom } from '@/store/admin/deploymentUI';
import dayjs from 'dayjs';

const DEPLOYMENT_DATA_KEY = ['deployment'];

const mapToDeployment = (res: ILLMDeploymentItemResponse): Deployment => ({
  id: res.id ?? 0,
  provider: res.provider ?? '',
  model: res.modelName ?? '',
  version: res.modelVersion ?? '',
  deploymentName: res.deploymentName ?? '',
  endpoint: res.endpoint ?? '',
  accessKey: res.accessKey ?? '',
  status: res.isActive ? '활성' : '비활성',
  createdAt: res.createDt
    ? dayjs(res.createDt).format('YYYY-MM-DD HH:mm:ss')
    : '-',
});

// 모델 목록 조회
export const getDeploymentListAtom = atomWithQuery((get) => {
  const params = get(deploymentListParamsAtom);
  return {
    queryKey: [...DEPLOYMENT_DATA_KEY, 'list', params],
    queryFn: async (): Promise<{
      deployments: Deployment[];
      total: number;
      nextOffset: number;
    }> => {
      const res = await getDeploymentList({
        offset: params.offset,
        limit: params.limit,
        searchKeyword: params.searchKeyword || undefined, // camelCase
        searchCategory: params.searchCategory || undefined, // camelCase
        order: params.order,
        sort: params.sort,
      });
      return {
        deployments: (res.deploymentList ?? []).map(mapToDeployment),
        total: res.totalCount,
        nextOffset: res.nextOffset,
      };
    },
    staleTime: 0,
  };
});

// 모델 생성
export const createDeploymentAtom = atomWithMutation(() => ({
  mutationKey: [...DEPLOYMENT_DATA_KEY, 'create'],
  mutationFn: async (formData: CreateDeploymentForm): Promise<Deployment> => {
    const res = await createDeployment({
      provider: formData.provider,
      modelName: formData.model,
      modelVersion: formData.version,
      deploymentName: formData.deploymentName,
      endpoint: formData.endpoint,
      accessKey: formData.accessKey,
      isActive: formData.isActive,
    });
    return mapToDeployment(res);
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...DEPLOYMENT_DATA_KEY, 'list'],
    });
  },
  onError: (error: unknown) => {
    console.error('모델 등록 실패:', error);
    alert('모델 등록에 실패했습니다.');
  },
}));

// 모델 수정
export const updateDeploymentAtom = atomWithMutation(() => ({
  mutationKey: [...DEPLOYMENT_DATA_KEY, 'update'],
  mutationFn: async (formData: EditDeploymentForm): Promise<Deployment> => {
    const res = await updateDeployment(formData.id, {
      deploymentName: formData.deploymentName,
      endpoint: formData.endpoint,
      accessKey: formData.accessKey,
      isActive: formData.isActive,
    });
    return mapToDeployment(res);
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...DEPLOYMENT_DATA_KEY, 'list'],
    });
  },
  onError: (error: unknown) => {
    console.error('모델 수정 실패:', error);
    alert('모델 수정에 실패했습니다.');
  },
}));

// 모델 삭제 (단건/일괄 공통 - ids 배열로 처리)
export const deleteDeploymentAtom = atomWithMutation(() => ({
  mutationKey: [...DEPLOYMENT_DATA_KEY, 'delete'],
  mutationFn: async (
    ids: number[]
  ): Promise<{ id: number; reason: string }[]> => {
    const failedItems: { id: number; reason: string }[] = [];
    for (const id of ids) {
      try {
        const responseData = await deleteDeployment(id);
        if (responseData && responseData.success === false) {
          failedItems.push({
            id,
            reason: responseData.message || 'Unknown error',
          });
        }
      } catch (error: unknown) {
        failedItems.push({
          id,
          reason: error instanceof Error ? error.message : 'Network error',
        });
      }
    }
    return failedItems;
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...DEPLOYMENT_DATA_KEY, 'list'],
    });
  },
  onError: (error: unknown) => {
    console.error('모델 삭제 실패:', error);
  },
}));
