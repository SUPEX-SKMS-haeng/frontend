import {
  createPrompt,
  getPromptListByOrg,
  getPromptTypes,
  updatePrompt,
  deletePrompt,
  updateIsActive,
} from '@/api/prompt';
import { promptListParamsAtom } from '@/store/promptUI';
import {
  type CreatePromptForm,
  type EditPromptForm,
  type IPromptItemResponse,
  type Prompt,
} from '@/types/prompt';
import { queryClient } from '@shared/lib/queryClient';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { selectedOrgIdAtom } from '@/store/organizationUI';

const PROMPT_DATA_KEY = ['prompt'];

export const getPromptListAtom = atomWithQuery((get) => {
  const baseParams = get(promptListParamsAtom);
  const orgId = get(selectedOrgIdAtom);
  const params = { ...baseParams, orgId };
  return {
    queryKey: [...PROMPT_DATA_KEY, 'list', params],
    queryFn: async (): Promise<{
      prompts: Prompt[];
      total: number;
      nextOffset: number;
    }> => {
      if (orgId == null) {
        return { prompts: [], total: 0, nextOffset: 0 };
      }
      const res = await getPromptListByOrg({
        orgId: orgId,
        offset: params.offset,
        limit: params.limit,
        searchCategory: params.searchCategory || undefined,
        searchKeyword: params.searchKeyword || undefined,
        sort: params.sort,
        order: params.order,
      });

      const rawItems = res?.items ?? [];
      const prompts: Prompt[] = rawItems.map((item: IPromptItemResponse) => ({
        assignmentId: item.assignmentId,
        promptId: item.promptId,
        agentName: item.agentName ?? '',
        promptType: item.promptType ?? '',
        promptName: item.promptName ?? '',
        promptDescription: item.promptDescription ?? null,
        promptContent: item.promptContent ?? '',
        promptVersion: item.promptVersion ?? '',
        status: item.isActive ? '활성' : '비활성',
      }));

      return {
        prompts,
        total: res?.totalCount ?? 0,
        nextOffset: res?.nextOffset ?? 0,
      };
    },
    staleTime: 0,
    enabled: orgId != null,
  };
});

/** 프롬프트 Type 목록 (드롭다운 옵션) */
export const getPromptTypesAtom = atomWithQuery(() => ({
  queryKey: [...PROMPT_DATA_KEY, 'types'],
  queryFn: getPromptTypes,
  staleTime: 5 * 60 * 1000,
}));

/** 프롬프트 추가(생성) mutation – 여러 건 한 번에 생성 후 목록 refetch */
export const createPromptAtom = atomWithMutation(() => ({
  mutationKey: [...PROMPT_DATA_KEY, 'create'],
  mutationFn: async ({
    orgId,
    formData,
  }: {
    orgId: number;
    formData: CreatePromptForm;
  }): Promise<void> => {
    await createPrompt({
      orgId: orgId,
      agentName: formData.agentName,
      name: formData.promptName,
      type: formData.promptType,
      description: formData.promptDescription ?? null,
      content: formData.promptContent ?? null,
      version: formData.promptVersion,
      isActive: formData.isActive,
    });
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...PROMPT_DATA_KEY, 'list'],
    });
  },
  onError: () => {
    console.error('프롬프트 추가 실패');
  },
}));

/** 프롬프트 수정 mutation – PATCH 후 목록 refetch */
export const updatePromptAtom = atomWithMutation(() => ({
  mutationKey: [...PROMPT_DATA_KEY, 'update'],
  mutationFn: async (vars: {
    promptId: number;
    orgId: number;
    formData: EditPromptForm;
  }): Promise<void> => {
    await updatePrompt(vars.promptId, {
      orgId: vars.orgId,
      agentName: vars.formData.agentName,
      name: vars.formData.promptName,
      type: vars.formData.promptType,
      description: vars.formData.promptDescription ?? null,
      content: vars.formData.promptContent ?? null,
      version: vars.formData.promptVersion,
      isActive: vars.formData.isActive,
    });
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...PROMPT_DATA_KEY, 'list'],
    });
  },
  onError: () => {
    console.error('프롬프트 수정 실패');
  },
}));

export const updateIsActiveAtom = atomWithMutation(() => ({
  mutationKey: [...PROMPT_DATA_KEY, 'updateIsActive'],
  mutationFn: async (vars: {
    promptId: number;
    orgId: number;
    isActive: boolean;
  }): Promise<void> => {
    await updateIsActive(vars.promptId, {
      orgId: vars.orgId,
      isActive: vars.isActive,
    });
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...PROMPT_DATA_KEY, 'list'],
    });
  },
  onError: () => {
    console.error('프롬프트 활성화 수정 실패');
  },
}));

export const deletePromptsAtom = atomWithMutation(() => ({
  mutationKey: [...PROMPT_DATA_KEY, 'delete'],
  mutationFn: async (vars: {
    promptIds: number[];
    organizationId: string | number | undefined;
  }): Promise<{ promptId: string | number; reason: string }[]> => {
    const failedItems: { promptId: string | number; reason: string }[] = [];
    for (const promptId of vars.promptIds) {
      try {
        const responseData = await deletePrompt(promptId, vars.organizationId);
        if (responseData && responseData.success === false) {
          failedItems.push({
            promptId,
            reason: responseData.message || 'Unknown error',
          });
        }
      } catch (error: unknown) {
        failedItems.push({
          promptId,
          reason: error instanceof Error ? error.message : 'Network error',
        });
      }
    }
    return failedItems;
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...PROMPT_DATA_KEY, 'list'],
    });
  },
  onError: () => {
    console.error('프롬프트 삭제 실패');
  },
}));
