import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  createOrganizationAtom,
  updateOrganizationAtom,
  deleteOrganizationsAtom,
} from './useOrganizationData';
import {
  isCreateModalOpenAtom,
  isEditModalOpenAtom,
  isPanelOpenAtom,
  selectedOrganizationAtom,
  selectedIdsAtom,
  currentPageAtom,
  sortStateAtom,
  organizationListParamsAtom,
} from '@/store/organizationUI';
import type {
  CreateOrganizationForm,
  EditOrganizationForm,
  Organization,
} from '@/types/organization';
import type { SearchBarFilter } from '@/types/search';

// totalCount: 서버 응답에서 오는 전체 건수. 훅이 직접 서버 atom을 구독하지 않으므로
// 페이지 컴포넌트에서 주입받아 totalPages를 계산한다.
export const useOrganizationTableHandler = (totalCount: number) => {
  // 서버 상태 (atomWithMutation은 첫 번째 요소에 { mutate, mutateAsync } 포함)
  const [createMutation] = useAtom(createOrganizationAtom);
  const [updateMutation] = useAtom(updateOrganizationAtom);
  const [deleteMutation] = useAtom(deleteOrganizationsAtom);
  const [params, setParams] = useAtom(organizationListParamsAtom);

  // 클라이언트 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(
    isCreateModalOpenAtom
  );
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(isEditModalOpenAtom);
  const [isPanelOpen, setIsPanelOpen] = useAtom(isPanelOpenAtom);
  const [selectedOrganization, setSelectedOrganization] = useAtom(
    selectedOrganizationAtom
  );
  const [selectedIds, setSelectedIds] = useAtom(selectedIdsAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  const [sortState, setSortState] = useAtom(sortStateAtom);

  const totalPages = Math.max(1, Math.ceil(totalCount / params.limit));

  const resetListState = () => {
    setParams({
      offset: 0,
      limit: 10,
      searchKeyword: '',
      searchCategory: 'name',
      order: 'asc',
      sort: 'name',
    });
    setCurrentPage(1);
    setSelectedIds(new Set());
    setSortState({ field: 'name', order: 'asc' });
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsPanelOpen(false);
    setSelectedOrganization(null);
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
  const handleToggleSelectAll = (pageCount: number) => {
    if (selectedIds.size === pageCount) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(Array.from({ length: pageCount }, (_, i) => i)));
    }
  };

  // 생성
  const handleCreate = async (formData: CreateOrganizationForm) => {
    await createMutation.mutateAsync(formData);
    setIsCreateModalOpen(false);
  };

  // 수정
  const handleEdit = async (formData: EditOrganizationForm) => {
    await updateMutation.mutateAsync(formData);
    setIsEditModalOpen(false);
    setSelectedOrganization(null);
  };

  // 다중 삭제
  const handleBulkDelete = async (organizations: Organization[]) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개의 그룹을 삭제하시겠습니까?`)) {
      return;
    }
    const ids = Array.from(selectedIds).map((idx) => organizations[idx].id);
    const failedItems = await deleteMutation.mutateAsync(ids);
    if (failedItems.length > 0) {
      const details = failedItems
        .map((f) => `ID: ${f.id} - ${f.reason}`)
        .join('\n');
      alert(`일부 그룹 삭제에 실패했습니다:\n${details}`);
    }
    setSelectedIds(new Set());
  };

  // 행 클릭
  const handleRowClick = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsPanelOpen(true);
  };

  // 수정 모달 열기 (선택된 항목이 정확히 1개일 때만 동작)
  const handleEditClick = (organizations: Organization[]) => {
    if (selectedIds.size === 1) {
      const idx = Array.from(selectedIds)[0];
      setSelectedOrganization(organizations[idx]);
      setIsEditModalOpen(true);
    }
  };

  return {
    // UI 상태 값
    isCreateModalOpen,
    isEditModalOpen,
    isPanelOpen,
    selectedOrganization,
    selectedIds,
    currentPage,
    sortState,
    totalPages,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setIsPanelOpen,
    setSelectedOrganization,
    // 핸들러
    handleSearch,
    handlePageChange,
    handleSort,
    handleToggleSelect,
    handleToggleSelectAll,
    handleCreate,
    handleEdit,
    handleBulkDelete,
    handleRowClick,
    handleEditClick,
  };
};
