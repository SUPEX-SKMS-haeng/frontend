import { atom } from 'jotai';
import type { MemberRole } from '@/types/admin/member';

// 리스트 선택 상태
export const memberSelectedIdsAtom = atom<Set<number>>(new Set<number>());

// 멤버 목록 조회 파라미터
export const memberListParamsAtom = atom({
  offset: 0,
  limit: 10,
  searchKeyword: '',
  searchCategory: '',
  order: 'asc' as 'asc' | 'desc',
  sort: 'user_id',
  role: '',
});

// AddMemberModal 전용 후보자 검색 파라미터
export const candidateListParamsAtom = atom({
  offset: 0,
  limit: 50,
  searchCategory: '',
  searchKeyword: '',
});

// 권한 편집 모드
export const memberRoleEditModeAtom = atom(false);

// 권한 변경 임시 저장
export const pendingRoleChangesAtom = atom<Record<string, MemberRole>>({});

// 멤버 추가/제거 모달 열림 상태
export const isAddMemberModalOpenAtom = atom(false);
