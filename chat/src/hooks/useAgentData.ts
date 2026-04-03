import { agentListApi } from '@/api/agent';
import { atomWithQuery } from 'jotai-tanstack-query';

export const getAgentListAtom = atomWithQuery(() => ({
  queryKey: ['agent-list'],
  queryFn: async () => {
    return await agentListApi();
  },
}));
