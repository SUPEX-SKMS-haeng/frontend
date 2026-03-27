import {
  getOrganizationList,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/api/organization';
import type {
  Organization,
  CreateOrganizationForm,
  EditOrganizationForm,
  IOrganizationResponse,
} from '@/types/organization';
import { queryClient } from '@shared/lib/queryClient';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { organizationListParamsAtom } from '@/store/organizationUI';

const ORGANIZATION_DATA_KEY = ['organization'];

const mapOrgResponseToOrganization = (
  res: IOrganizationResponse
): Organization => ({
  id: res.id ?? '',
  name: res.name ?? '',
  description: res.description ?? '',
  status: res.isActive ? '활성' : '비활성',
  createdAt: res.createDt ?? '',
});

export const getOrganizationListAtom = atomWithQuery((get) => {
  const params = get(organizationListParamsAtom);
  return {
    queryKey: [...ORGANIZATION_DATA_KEY, 'list', params],
    queryFn: async (): Promise<{
      organizations: Organization[];
      total: number;
    }> => {
      const res = await getOrganizationList({
        ...params,
        searchCategory: params.searchCategory || undefined,
        searchKeyword: params.searchKeyword || undefined,
      });
      const organizations = (res.organizationList ?? []).map(
        mapOrgResponseToOrganization
      );
      return {
        organizations,
        total: res.totalCount ?? res.organizationList?.length ?? 0,
      };
    },
    staleTime: 0,
  };
});

export const createOrganizationAtom = atomWithMutation(() => ({
  mutationKey: [...ORGANIZATION_DATA_KEY, 'create'],
  mutationFn: async (
    formData: CreateOrganizationForm
  ): Promise<Organization> => {
    const res = await createOrganization({
      name: formData.name,
      description: formData.description,
      isActive: formData.isActive,
    });
    return mapOrgResponseToOrganization(res);
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...ORGANIZATION_DATA_KEY, 'list'],
    });
  },
  onError: (error: unknown) => {
    console.error('그룹 생성 실패:', error);
    alert('그룹 생성에 실패했습니다.');
  },
}));

export const updateOrganizationAtom = atomWithMutation(() => ({
  mutationKey: [...ORGANIZATION_DATA_KEY, 'update'],
  mutationFn: async (formData: EditOrganizationForm): Promise<Organization> => {
    const res = await updateOrganization(Number(formData.id), {
      name: formData.name,
      description: formData.description,
      isActive: formData.isActive,
    });
    return mapOrgResponseToOrganization(res);
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...ORGANIZATION_DATA_KEY, 'list'],
    });
  },
  onError: (error: unknown) => {
    console.error('그룹 수정 실패:', error);
    alert('그룹 수정에 실패했습니다.');
  },
}));

export const deleteOrganizationsAtom = atomWithMutation(() => ({
  mutationKey: [...ORGANIZATION_DATA_KEY, 'delete'],
  mutationFn: async (
    ids: (number | string)[]
  ): Promise<{ id: string | number; reason: string }[]> => {
    const failedItems: { id: string | number; reason: string }[] = [];
    for (const id of ids) {
      try {
        const responseData = await deleteOrganization(id);
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
      queryKey: [...ORGANIZATION_DATA_KEY, 'list'],
    });
  },
  onError: (error: unknown) => {
    console.error('그룹 삭제 실패:', error);
    alert('그룹 삭제에 실패했습니다.');
  },
}));
