import { atom } from 'jotai';
import type { Organization } from '@/types/organization';

// 모달 상태
export const isCreateModalOpenAtom = atom(false);
export const isEditModalOpenAtom = atom(false);

// 상세 패널 상태
export const isPanelOpenAtom = atom(false);

// 선택된 Organization
export const selectedOrganizationAtom = atom<Organization | null>(null);

// 현재 선택된 조직 ID (OrganizationDetailPanel에서 조직 선택 시 설정)
export const selectedOrgIdAtom = atom<number | string | null>(null);

// 선택된 ID 목록 (체크박스 - 인덱스 기준)
export const selectedIdsAtom = atom<Set<number>>(new Set<number>());

// 현재 페이지
export const currentPageAtom = atom(1);

// 정렬 상태
export const sortStateAtom = atom<{
  field: string | null;
  order: 'asc' | 'desc';
}>({
  field: null,
  order: 'asc',
});

// 조직 목록 조회 파라미터 atom
export const organizationListParamsAtom = atom({
  offset: 0,
  limit: 10,
  searchKeyword: '',
  searchCategory: 'name',
  order: 'asc' as 'asc' | 'desc',
  sort: 'name',
});
