import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { saveMembersAtom, updateMemberRolesAtom } from '@/hooks/admin/useMemberData';
import {
  memberSelectedIdsAtom,
  memberRoleEditModeAtom,
  pendingRoleChangesAtom,
  memberListParamsAtom,
  isAddMemberModalOpenAtom,
} from '@/store/admin/memberUI';
import type { Member, MemberRole } from '@/types/admin/member';
import type { SearchBarFilter } from '@/types/admin/search';
import { useCurrentUser } from '@/hooks/auth/useAuth';

export const useMemberTableHandler = (
  organizationId: string | number | undefined,
  totalCount: number
) => {
  const [saveMembersMutation] = useAtom(saveMembersAtom);
  const [updateRolesMutation] = useAtom(updateMemberRolesAtom);

  // 클라이언트
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useAtom(
    isAddMemberModalOpenAtom
  );
  const [selectedIds, setSelectedIds] = useAtom(memberSelectedIdsAtom);
  const [params, setParams] = useAtom(memberListParamsAtom);
  const [isRoleEditMode, setIsRoleEditMode] = useAtom(memberRoleEditModeAtom);
  const [pendingRoleChanges, setPendingRoleChanges] = useAtom(
    pendingRoleChangesAtom
  );
  const { isSuperAdmin, userId: currentUserId } = useCurrentUser();

  const currentPage = Math.floor(params.offset / params.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / params.limit));

  const resetListState = () => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      searchCategory: '',
      searchKeyword: '',
    }));
    setSelectedIds(new Set());
    setIsAddMemberModalOpen(false);
    setIsRoleEditMode(false);
    setPendingRoleChanges({});
  };

  // 조직(탭) 전환 시 offset·페이지·검색·정렬·선택 초기화
  useEffect(() => {
    resetListState();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetListState는 jotai setter를 캡처하며, org 변경 시 초기화만 보장
  }, [organizationId]);

  // 탭을 떠나면(언마운트) 검색조건/페이지/정렬/선택/모달 상태를 초기화해,
  // 재진입 시 "이전 검색조건으로 1회 호출"이 발생하지 않도록 합니다.
  useEffect(() => {
    return () => {
      resetListState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 언마운트 시 초기화만 보장
  }, []);

  const handleSearch = ({ searchCategory, searchKeyword }: SearchBarFilter) => {
    setParams((prev) => ({
      ...prev,
      searchCategory,
      searchKeyword,
      offset: 0,
    }));
    setSelectedIds(new Set());
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, offset: (page - 1) * prev.limit }));
    setSelectedIds(new Set());
  };

  const handleSort = (field: string) => {
    const newOrder =
      params.sort === field && params.order === 'asc' ? 'desc' : 'asc';
    setParams((prev) => ({ ...prev, sort: field, order: newOrder, offset: 0 }));
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (index: number) => {
    const next = new Set(selectedIds);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIds(next);
  };

  const handleToggleSelectAll = (pageCount: number) => {
    if (selectedIds.size === pageCount) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(Array.from({ length: pageCount }, (_, i) => i)));
    }
  };

  const handleRoleEditStart = () => {
    setPendingRoleChanges({});
    setIsRoleEditMode(true);
  };

  const handleRoleEditCancel = () => {
    setPendingRoleChanges({});
    setIsRoleEditMode(false);
  };

  const handleRoleChange = (userId: number, newRole: MemberRole) => {
    setPendingRoleChanges((prev) => ({ ...prev, [String(userId)]: newRole }));
  };

  const handleRoleEditSave = async (pagedMembers: Member[]) => {
    const orgId = organizationId != null ? Number(organizationId) : null;
    if (orgId == null) return;

    const changes = Object.entries(pendingRoleChanges)
      .map(([targetUserIdStr, newRole]) => {
        const member = pagedMembers.find(
          (m) => String(m.userId) === targetUserIdStr
        );
        if (!member?.id) return null;
        return { memberId: member.id, orgId, role: newRole.toLowerCase() };
      })
      .filter(
        (c): c is { memberId: number; orgId: number; role: string } =>
          c !== null
      );

    if (changes.length === 0) {
      setIsRoleEditMode(false);
      return;
    }

    await updateRolesMutation.mutateAsync(changes);
    setPendingRoleChanges({});
    setIsRoleEditMode(false);
  };

  const handleSaveMembers = async ({
    added,
    removed,
  }: {
    added: number[];
    removed: number[];
  }) => {
    if (organizationId == null) return;
    const orgId = Number(organizationId);

    if (added.length === 0 && removed.length === 0) return;

    const failedItems = await saveMembersMutation.mutateAsync({
      orgId,
      added,
      removed,
    });
    if (failedItems.length > 0) {
      const details = failedItems
        .map((f) => `ID: ${f.id} - ${f.reason}`)
        .join('\n');
      alert(`일부 멤버 처리에 실패했습니다:\n${details}`);
    }
  };

  return {
    totalPages,
    currentPage,
    selectedIds,
    sortState: { field: params.sort, order: params.order },
    isRoleEditMode,
    pendingRoleChanges,
    isSuperAdmin,
    currentUserId,
    isAddMemberModalOpen,
    handleSearch,
    handlePageChange,
    handleSort,
    handleToggleSelect,
    handleToggleSelectAll,
    handleRoleEditStart,
    handleRoleEditCancel,
    handleRoleChange,
    handleRoleEditSave,
    handleSaveMembers,
    handleOpenAddMemberModal: () => setIsAddMemberModalOpen(true),
    handleCloseAddMemberModal: () => setIsAddMemberModalOpen(false),
  };
};
