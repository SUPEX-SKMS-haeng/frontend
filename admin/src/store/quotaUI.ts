import { atom } from 'jotai';

export const quotaCurrentPageAtom = atom(1);

export const quotaSortStateAtom = atom<{
  field: 'agentName' | 'outputMaxTokens';
  order: 'asc' | 'desc';
}>({
  field: 'agentName',
  order: 'asc',
});

export const quotaUsageParamsAtom = atom({
  offset: 0,
  limit: 5,
  sortBy: 'agent_name' as 'agent_name' | 'output_max_tokens',
  order: 'asc' as 'asc' | 'desc',
});
