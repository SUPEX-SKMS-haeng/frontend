import { atom } from 'jotai';
import type { Prompt } from '@/types/admin/prompt';

// 모달 상태
export const isCreatePromptModalOpenAtom = atom(false);
export const isDetailPromptModalOpenAtom = atom(false);
export const isEditPromptModalOpenAtom = atom(false);

// 선택된 프롬프트
export const selectedPromptAtom = atom<Prompt | null>(null);

// 선택된 ID 목록 (체크박스)
export const promptSelectedIdsAtom = atom<Set<number>>(new Set<number>());

// 현재 페이지
export const promptCurrentPageAtom = atom(1);

// 정렬 상태
export const promptSortStateAtom = atom<{
  field: string | null;
  order: 'asc' | 'desc';
}>({
  field: 'agent_name',
  order: 'asc',
});

// 프롬프트 목록 조회 파라미터 atom
export const promptListParamsAtom = atom({
  orgId: null as number | string | null,
  offset: 0,
  limit: 10,
  searchCategory: '',
  searchKeyword: '',
  order: 'asc' as 'asc' | 'desc',
  sort: 'agent_name',
});
