import { atom } from 'jotai';

// 선택된 Assignment ID 목록 (체크박스)
export const assignmentSelectedIdsAtom = atom<Set<number>>(new Set<number>());

// 현재 페이지
export const assignmentCurrentPageAtom = atom(1);

// 정렬 상태
export const assignmentSortStateAtom = atom<{
  field: string | null;
  order: 'asc' | 'desc';
}>({
  field: 'provider',
  order: 'asc',
});

// Assignment 목록 조회 파라미터 atom
export const assignmentListParamsAtom = atom({
  offset: 0,
  limit: 10,
  searchKeyword: '',
  searchCategory: '',
  order: 'asc' as 'asc' | 'desc',
  sort: 'provider',
});

// AddAssignmentModal 전용 후보 검색 파라미터
export const assignmentCandidateParamsAtom = atom({
  searchKeyword: '',
  searchCategory: '',
});

// 모델 추가/제거 모달 열림 상태
export const isAddAssignmentModalOpenAtom = atom(false);
