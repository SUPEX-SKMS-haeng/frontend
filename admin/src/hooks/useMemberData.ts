import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import {
  getMembersByOrg,
  addMember,
  updateMemberRole,
  removeMember,
} from '@/api/member';
import { getUserList } from '@/api/user';
import type { Member, MemberCandidate, IMemberResponse } from '@/types/member';
import type { IUserItemResponse } from '@/types/user';
import { queryClient } from '@shared/lib/queryClient';
import { selectedOrgIdAtom } from '@/store/organizationUI';
import {
  candidateListParamsAtom,
  memberListParamsAtom,
  isAddMemberModalOpenAtom,
} from '@/store/memberUI';

const ALL_MEMBERS_LIMIT = 2000;
const MEMBER_DATA_KEY = ['member'];

// API 응답 → Member 뷰 모델 변환 (userId/userLoginId 누락 레코드는 호출 전 filter 필요)
const mapMemberResponse = (
  m: IMemberResponse & { userId: number; userLoginId: string }
): Member => ({
  id: m.id ?? undefined,
  loginId: m.userLoginId,
  userId: m.userId,
  name: m.username ?? m.userLoginId,
  company: m.company ?? '',
  role: (m.role === 'admin' ? 'Admin' : 'Common') as Member['role'],
  status: (m.isActive ? '활성' : '비활성') as Member['status'],
});

// userId 또는 userLoginId가 없는 레코드 타입 가드 (잘못된 key 방지)
const isValidMemberResponse = (
  m: IMemberResponse
): m is IMemberResponse & { userId: number; userLoginId: string } =>
  m.userId != null && m.userLoginId != null;

// 조직 멤버 목록 (페이징)
export const getMembersByOrgAtom = atomWithQuery((get) => {
  const orgId = get(selectedOrgIdAtom);
  const params = get(memberListParamsAtom);

  return {
    queryKey: [...MEMBER_DATA_KEY, 'list', orgId, params],
    queryFn: async (): Promise<{ members: Member[]; total: number }> => {
      if (orgId == null) return { members: [], total: 0 };
      const memberRes = await getMembersByOrg(orgId, {
        offset: params.offset,
        limit: params.limit,
        role: params.role || undefined,
        searchCategory: params.searchCategory || undefined,
        searchKeyword: params.searchKeyword || undefined,
        sort: params.sort || undefined,
        order: params.order,
      });
      const members = (memberRes.memberList ?? [])
        .filter(isValidMemberResponse)
        .map(mapMemberResponse);
      return { members, total: memberRes.totalCount ?? 0 };
    },
    staleTime: 0,
    enabled: orgId != null,
  };
});

// 전체 멤버 목록 (AddMemberModal용 — 모달이 열렸을 때만 조회, 현재 조직 멤버와의 diff 계산을 위해 limit 2000으로 전체 로드)
export const getAllMembersByOrgAtom = atomWithQuery((get) => {
  const orgId = get(selectedOrgIdAtom);
  const isAddMemberModalOpen = get(isAddMemberModalOpenAtom);
  return {
    queryKey: [...MEMBER_DATA_KEY, 'all', orgId],
    queryFn: async (): Promise<{ members: Member[] }> => {
      if (orgId == null) return { members: [] };
      const memberRes = await getMembersByOrg(orgId, {
        offset: 0,
        limit: ALL_MEMBERS_LIMIT,
      });
      const members = (memberRes.memberList ?? [])
        .filter(isValidMemberResponse)
        .map(mapMemberResponse);
      return { members };
    },
    staleTime: 30_000,
    enabled: orgId != null && isAddMemberModalOpen,
  };
});

// 전체 사용자 목록 (AddMemberModal 좌측 후보 목록용)
export const getMemberCandidatesAtom = atomWithQuery((get) => {
  const params = get(candidateListParamsAtom);
  return {
    queryKey: [...MEMBER_DATA_KEY, 'userCandidates', params],
    queryFn: async (): Promise<{
      candidates: MemberCandidate[];
      total: number;
    }> => {
      const res = await getUserList({
        offset: params.offset,
        limit: params.limit,
        searchCategory: params.searchCategory || undefined,
        searchKeyword: params.searchKeyword || undefined,
      });
      const filtered: MemberCandidate[] = res.userList.map(
        (u: IUserItemResponse) => ({
          loginId: String(u.userId),
          userId: u.id,
          name: u.username,
          company: u.company,
        })
      );
      return {
        candidates: filtered,
        total: res.totalCount,
      };
    },
    staleTime: 30_000,
  };
});

export const saveMembersAtom = atomWithMutation((get) => ({
  mutationKey: [...MEMBER_DATA_KEY, 'save'],
  mutationFn: async ({
    orgId,
    added,
    removed,
  }: {
    orgId: number;
    added: (number | string)[];
    removed: (number | string)[];
  }): Promise<{ id: string | number; reason: string }[]> => {
    const failedItems: { id: string | number; reason: string }[] = [];
    for (const userId of added) {
      try {
        await addMember({
          orgId: orgId,
          userId: Number(userId),
          role: 'common',
        });
      } catch (error: unknown) {
        failedItems.push({
          id: userId,
          reason: `[추가 실패] ${error instanceof Error ? error.message : 'Network error'}`,
        });
      }
    }
    for (const userId of removed) {
      try {
        const res = await removeMember(orgId, userId);
        if (res && res.success === false) {
          failedItems.push({
            id: userId,
            reason: `[제거 실패] ${res.message || 'Unknown error'}`,
          });
        }
      } catch (error: unknown) {
        failedItems.push({
          id: userId,
          reason: `[제거 실패] ${error instanceof Error ? error.message : 'Network error'}`,
        });
      }
    }
    return failedItems;
  },
  onSuccess: () => {
    const orgId = get(selectedOrgIdAtom);
    void queryClient.invalidateQueries({
      queryKey: [...MEMBER_DATA_KEY, 'list', orgId],
    });
    void queryClient.invalidateQueries({
      queryKey: [...MEMBER_DATA_KEY, 'all', orgId],
    });
  },
  onError: (error: unknown) => {
    console.error('멤버 저장 실패:', error);
    alert('멤버 저장에 실패했습니다.');
  },
}));

// 멤버 역할 일괄 수정
export const updateMemberRolesAtom = atomWithMutation((get) => ({
  mutationKey: [...MEMBER_DATA_KEY, 'updateRoles'],
  mutationFn: async (
    changes: { memberId: number; orgId: number; role: string }[]
  ): Promise<boolean> => {
    await Promise.all(
      changes.map(({ memberId, orgId, role }) =>
        updateMemberRole(memberId, { orgId, role })
      )
    );
    return true;
  },
  onSuccess: () => {
    const orgId = get(selectedOrgIdAtom);
    void queryClient.invalidateQueries({
      queryKey: [...MEMBER_DATA_KEY, 'list', orgId],
    });
    void queryClient.invalidateQueries({
      queryKey: [...MEMBER_DATA_KEY, 'all', orgId],
    });
  },
  onError: (error: unknown) => {
    console.error('멤버 역할 수정 실패:', error);
    alert('역할 수정에 실패했습니다.');
  },
}));
