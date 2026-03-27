import { atom } from 'jotai';
import type { User } from '@/types/user';

// 모달 상태
export const isCreateModalOpenAtom = atom(false);
export const isDetailModalOpenAtom = atom(false);
export const isEditModalOpenAtom = atom(false);

// 선택된 사용자
export const selectedUserAtom = atom<User | null>(null);

// 선택된 ID 목록 (체크박스)
export const selectedIdsAtom = atom<Set<number>>(new Set<number>());

// 현재 페이지
export const currentPageAtom = atom(1);

// 정렬 상태
export const sortStateAtom = atom<{
  field: string | null;
  order: 'asc' | 'desc';
}>({
  field: 'user_id', // 백엔드 API 전송 필드로 snake_case 사용
  order: 'asc',
});

// 목록 조회 파라미터 atom
export const userListParamsAtom = atom({
  offset: 0,
  limit: 10,
  searchKeyword: '',
  searchCategory: '' as string, // 'name' | 'company' | '' (전체)
  order: 'asc' as 'asc' | 'desc',
  sort: 'user_id', // 백엔드 API 전송 필드로 snake_case 사용
  role: '',
  isActive: null as boolean | null,
});
