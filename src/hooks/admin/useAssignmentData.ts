import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import {
  getAssignmentsByOrg,
  createAssignment,
  deleteAssignment,
} from '@/api/admin/assignment';
import { getDeploymentList } from '@/api/admin/deployment';
import type {
  Assignment,
  AssignmentCandidate,
  ILLMAssignment,
} from '@/types/admin/assignment';
import type { ILLMDeploymentItemResponse } from '@/types/admin/deployment';
import { queryClient } from '@/lib/queryClient';
import { selectedOrgIdAtom } from '@/store/admin/organizationUI';
import {
  assignmentCandidateParamsAtom,
  assignmentListParamsAtom,
  isAddAssignmentModalOpenAtom,
} from '@/store/admin/assignmentUI';

const ASSIGNMENT_DATA_KEY = ['assignment'];
const CANDIDATE_LIMIT = 200;

function mapAssignmentData(a: ILLMAssignment): Assignment {
  return {
    assignmentId: a.assignmentId,
    id: a.deploymentId,
    provider: a.provider,
    model: a.modelName,
    version: a.modelVersion,
    deploymentName: a.deploymentName,
    endpoint: a.endpoint ?? '',
    accessKey: a.accessKey ?? '',
    status: a.isActive ? '활성' : '비활성',
  };
}

// 조직에 할당된 LLM 목록
export const getAssignmentsAtom = atomWithQuery((get) => {
  const orgId = get(selectedOrgIdAtom);
  const params = get(assignmentListParamsAtom);
  return {
    queryKey: [...ASSIGNMENT_DATA_KEY, 'list', orgId, params],
    queryFn: async (): Promise<{ assignments: Assignment[]; total: number }> => {
      if (orgId == null) return { assignments: [], total: 0 };
      const res = await getAssignmentsByOrg(orgId, {
        searchKeyword: params.searchKeyword || undefined, // camelCase
        searchCategory: params.searchCategory || undefined, // camelCase
        order: params.order,
        sort: params.sort,
        offset: params.offset,
        limit: params.limit,
      });
      return { assignments: (res.assignmentList ?? []).map(mapAssignmentData), total: res.totalCount };
    },
    staleTime: 0,
    enabled: orgId != null,
  };
});

// 조직에 할당된 LLM 목록
export const getAllAssignmentsByOrgAtom = atomWithQuery((get) => {
  const orgId = get(selectedOrgIdAtom);
  const isAddAssignmentModalOpen = get(isAddAssignmentModalOpenAtom);
  return {
    queryKey: [...ASSIGNMENT_DATA_KEY, 'all', orgId],
    queryFn: async (): Promise<{ assignments: Assignment[]; total: number }> => {
      if (orgId == null) return { assignments: [], total: 0 };
      const res = await getAssignmentsByOrg(orgId, {
        offset: 0,
        limit: CANDIDATE_LIMIT,
      });
      return { assignments: (res.assignmentList ?? []).map(mapAssignmentData), total: res.totalCount };
    },
    staleTime: 0,
    enabled: orgId != null && isAddAssignmentModalOpen,
  };
});

export const getAssignmentCandidatesAtom = atomWithQuery((get) => {
  const { searchCategory, searchKeyword } = get(assignmentCandidateParamsAtom);
  return {
    queryKey: [
      ...ASSIGNMENT_DATA_KEY,
      'candidates',
      searchCategory,
      searchKeyword,
    ],
    queryFn: async (): Promise<{
      candidates: AssignmentCandidate[];
      total: number;
    }> => {
      // API 단에서 직접 필터링
      const res = await getDeploymentList({
        limit: CANDIDATE_LIMIT,
        searchKeyword: searchKeyword || undefined,
        searchCategory: searchCategory || undefined,
      });

      const mapped: AssignmentCandidate[] = (res.deploymentList ?? [])
        .filter((d: ILLMDeploymentItemResponse) => d.id != null)
        .map((d: ILLMDeploymentItemResponse) => ({
          id: d.id!,
          provider: d.provider ?? '',
          model: d.modelName ?? '',
          version: d.modelVersion ?? '',
        }));

      return {
        candidates: mapped,
        total: res.totalCount,
      };
    },
    staleTime: 60_000,
  };
});

// 모델 할당 저장 (추가: createAssignment 반복, 제거: deleteAssignment 반복)
export const saveAssignmentsAtom = atomWithMutation((get) => ({
  mutationKey: [...ASSIGNMENT_DATA_KEY, 'save'],
  mutationFn: async ({
    orgId,
    added,
    removed,
  }: {
    orgId: number;
    added: (number | string)[];
    removed: number[];
  }): Promise<{ id: string | number; reason: string }[]> => {
    const failedItems: { id: string | number; reason: string }[] = [];
    for (const deploymentId of added) {
      try {
        await createAssignment({
          deploymentId: Number(deploymentId),
          orgId: orgId,
        });
      } catch (error: unknown) {
        failedItems.push({
          id: deploymentId,
          reason: `[추가 실패] ${error instanceof Error ? error.message : 'Network error'}`,
        });
      }
    }
    for (const assignmentId of removed) {
      try {
        const res = await deleteAssignment(assignmentId);
        if (res && res.success === false) {
          failedItems.push({
            id: assignmentId,
            reason: `[제거 실패] ${res.message || 'Unknown error'}`,
          });
        }
      } catch (error: unknown) {
        failedItems.push({
          id: assignmentId,
          reason: `[제거 실패] ${error instanceof Error ? error.message : 'Network error'}`,
        });
      }
    }
    return failedItems;
  },
  onSuccess: () => {
    const orgId = get(selectedOrgIdAtom);
    void queryClient.invalidateQueries({
      queryKey: [...ASSIGNMENT_DATA_KEY, 'list', orgId],
    });
  },
  onError: (error: unknown) => {
    console.error('모델 저장 실패:', error);
    alert('모델 저장에 실패했습니다.');
  },
}));
