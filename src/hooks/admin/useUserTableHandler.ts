import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  createUserAtom,
  updateUserAtom,
  deleteUserAtom,
  deleteBulkUsersAtom,
} from '@/hooks/admin/useUserData';
import {
  isCreateModalOpenAtom,
  isDetailModalOpenAtom,
  isEditModalOpenAtom,
  selectedUserAtom,
  selectedIdsAtom,
  currentPageAtom,
  sortStateAtom,
  userListParamsAtom,
} from '@/store/admin/userUI';
import type { CreateUserForm, EditUserForm, User } from '@/types/admin/user';
import type { SearchBarFilter } from '@/types/admin/search';

// totalCount: 서버 응답에서 오는 전체 건수. 훅이 직접 서버 atom을 구독하지 않으므로
// 페이지 컴포넌트에서 주입받아 totalPages를 계산한다.
export const useUserTableHandler = (totalCount: number) => {
  // 서버 상태
  const [createMutation] = useAtom(createUserAtom);
  const [updateMutation] = useAtom(updateUserAtom);
  const [deleteMutation] = useAtom(deleteUserAtom);
  const [deleteBulkMutation] = useAtom(deleteBulkUsersAtom);
  const [params, setParams] = useAtom(userListParamsAtom);

  // 클라이언트 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(
    isCreateModalOpenAtom
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useAtom(
    isDetailModalOpenAtom
  );
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(isEditModalOpenAtom);
  const [selectedUser, setSelectedUser] = useAtom(selectedUserAtom);
  const [selectedIds, setSelectedIds] = useAtom(selectedIdsAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  const [sortState, setSortState] = useAtom(sortStateAtom);

  const totalPages = Math.max(1, Math.ceil(totalCount / params.limit));

  const resetListState = () => {
    setParams({
      offset: 0,
      limit: 10,
      searchKeyword: '',
      searchCategory: '',
      order: 'asc',
      sort: 'user_id',
      role: '',
      isActive: null,
    });
    setCurrentPage(1);
    setSelectedIds(new Set());
    setSortState({ field: 'user_id', order: 'asc' });
    setIsCreateModalOpen(false);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    return () => resetListState();
  }, []);

  // 검색
  const handleSearch = ({ searchCategory, searchKeyword }: SearchBarFilter) => {
    setParams((prev) => ({
      ...prev,
      searchKeyword,
      searchCategory,
      offset: 0,
    }));
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
    setCurrentPage(page);
    setSelectedIds(new Set());
  };

  // 정렬 (UI 필드명 → API 필드명 매핑)
  const handleSort = (field: string) => {
    const newOrder =
      sortState.field === field && sortState.order === 'asc' ? 'desc' : 'asc';
    setSortState({ field, order: newOrder });

    setParams((prev) => ({
      ...prev,
      sort: field,
      order: newOrder,
      offset: 0,
    }));
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // 체크박스 개별 선택
  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIds(newSelected);
  };

  // 체크박스 전체 선택
  const handleToggleSelectAll = (pageUsersCount: number) => {
    if (selectedIds.size === pageUsersCount) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(Array.from({ length: pageUsersCount }, (_, i) => i))
      );
    }
  };

  // 생성
  const handleCreateUser = async (formData: CreateUserForm) => {
    await createMutation.mutateAsync(formData);
    setIsCreateModalOpen(false);
  };

  // 수정
  const handleEditUser = async (formData: EditUserForm) => {
    await updateMutation.mutateAsync(formData);
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // 단일 삭제
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (confirm(`${selectedUser.name} 사용자를 삭제하시겠습니까?`)) {
      await deleteMutation.mutateAsync(selectedUser.loginId);
      setIsDetailModalOpen(false);
      setSelectedUser(null);
    }
  };

  // 다중 삭제 (1명이면 단일 삭제 API 호출 → Admin 권한으로 가능, 2명 이상이면 bulk → SuperAdmin 전용)
  const handleBulkDelete = async (users: User[]) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}명의 사용자를 삭제하시겠습니까?`)) {
      return;
    }
    const userIds = Array.from(selectedIds).map((idx) => users[idx].loginId);
    if (userIds.length === 1) {
      await deleteMutation.mutateAsync(userIds[0]);
    } else {
      await deleteBulkMutation.mutateAsync(userIds);
    }
    setSelectedIds(new Set());
  };

  // 행 클릭
  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // 수정 모달 열기
  const handleEditClick = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  return {
    // UI 상태 값
    isCreateModalOpen,
    isDetailModalOpen,
    isEditModalOpen,
    selectedUser,
    selectedIds,
    currentPage,
    sortState,
    totalPages,
    setIsCreateModalOpen,
    setIsDetailModalOpen,
    setIsEditModalOpen,
    setSelectedUser,
    // 핸들러
    handleSearch,
    handlePageChange,
    handleSort,
    handleToggleSelect,
    handleToggleSelectAll,
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
    handleBulkDelete,
    handleRowClick,
    handleEditClick,
  };
};
