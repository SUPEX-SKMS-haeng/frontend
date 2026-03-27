import { atom } from 'jotai';
import type { Deployment } from '@/types/deployment';

// 모달 상태
export const isCreateModalOpenAtom = atom(false);
export const isDetailModalOpenAtom = atom(false);
export const isEditModalOpenAtom = atom(false);

// 선택된 Deployment 항목
export const selectedDeploymentAtom = atom<Deployment | null>(null);

// 선택된 ID 목록 (체크박스)
export const selectedIdsAtom = atom<Set<number>>(new Set<number>());

// 현재 페이지
export const currentPageAtom = atom(1);

// 정렬 상태
export const sortStateAtom = atom<{
  field: string | null;
  order: 'asc' | 'desc';
}>({
  field: 'provider',
  order: 'asc',
});

// 목록 조회 파라미터 atom
export const deploymentListParamsAtom = atom({
  offset: 0,
  limit: 10,
  searchKeyword: '',
  searchCategory: '',
  order: 'asc' as 'asc' | 'desc',
  sort: 'provider',
});
