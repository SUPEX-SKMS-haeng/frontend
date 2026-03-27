import { fetchMyLlmAssignments } from '@/api/llmGateway';
import { LlmAssignment } from '@/types/llmGateway';
import { selectedGroupAtom } from '@shared/store/auth';
import { atomWithQuery } from 'jotai-tanstack-query';

const LLM_ASSIGNMENTS_KEY = ['llm-assignments'];

export const getMyLlmAssignmentsAtom = atomWithQuery((get) => {
  const selectedGroup = get(selectedGroupAtom);
  const orgId = selectedGroup?.orgId;
  const isEnabled = !!orgId && orgId !== -1;

  return {
    queryKey: [...LLM_ASSIGNMENTS_KEY, orgId ?? 'no-group'],
    queryFn: async () => {
      if (!isEnabled || !orgId) return [];
      const response = await fetchMyLlmAssignments(orgId);
      return (
        response.assignmentList?.map(
          (assignment: any) =>
            ({
              assignmentId: assignment.assignmentId,
              deploymentId: assignment.deploymentId,
              provider: assignment.provider,
              modelName: assignment.modelName,
              modelVersion: assignment.modelVersion,
              deploymentName: assignment.deploymentName,
              isActive: assignment.isActive,
              endpoint: assignment.endpoint,
              accessKey: assignment.accessKey,
            }) as LlmAssignment
        ) || []
      );
    },
    enabled: isEnabled,
  };
});
