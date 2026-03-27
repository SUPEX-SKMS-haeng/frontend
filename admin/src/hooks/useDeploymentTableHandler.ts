import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  createDeploymentAtom,
  updateDeploymentAtom,
  deleteDeploymentAtom,
} from './useDeploymentData';
import {
  isCreateModalOpenAtom,
  isDetailModalOpenAtom,
  isEditModalOpenAtom,
  selectedDeploymentAtom,
  selectedIdsAtom,
  currentPageAtom,
  sortStateAtom,
  deploymentListParamsAtom,
} from '@/store/deploymentUI';
import type {
  CreateDeploymentForm,
  EditDeploymentForm,
  Deployment,
} from '@/types/deployment';
import type { SearchBarFilter } from '@/types/search';

// totalCount: 서버 응답에서 오는 전체 건수. 훅이 직접 서버 atom을 구독하지 않으므로
// 페이지 컴포넌트에서 주입받아 totalPages를 계산한다.
export const useDeploymentTableHandler = (totalCount: number) => {
  // 서버 상태
  const [createMutation] = useAtom(createDeploymentAtom);
  const [updateMutation] = useAtom(updateDeploymentAtom);
  const [deleteMutation] = useAtom(deleteDeploymentAtom);
  const [params, setParams] = useAtom(deploymentListParamsAtom);

  // 클라이언트 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(
    isCreateModalOpenAtom
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useAtom(
    isDetailModalOpenAtom
  );
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(isEditModalOpenAtom);
  const [selectedDeployment, setSelectedDeployment] = useAtom(
    selectedDeploymentAtom
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
      searchCategory: '',
      order: 'asc',
      sort: 'provider',
    });
    setCurrentPage(1);
    setSelectedIds(new Set());
    setSortState({ field: 'provider', order: 'asc' });
    setIsCreateModalOpen(false);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedDeployment(null);
  };

  useEffect(() => {
    return () => resetListState();
  }, []);

  // 검색
  const handleSearch = ({ searchCategory, searchKeyword }: SearchBarFilter) => {
    setParams((prev) => ({
      ...prev,
      searchCategory,
      searchKeyword,
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
  const handleToggleSelectAll = (pageDeploymentsCount: number) => {
    if (selectedIds.size === pageDeploymentsCount) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(Array.from({ length: pageDeploymentsCount }, (_, i) => i))
      );
    }
  };

  // 생성
  const handleCreateDeployment = async (formData: CreateDeploymentForm) => {
    await createMutation.mutateAsync(formData);
    setIsCreateModalOpen(false);
  };

  // 수정
  const handleEditDeployment = async (formData: EditDeploymentForm) => {
    await updateMutation.mutateAsync(formData);
    setIsEditModalOpen(false);
    setSelectedDeployment(null);
  };

  // 단일 삭제 (호출부: 상세 모달 '삭제' 버튼 클릭 시)
  const handleDeleteDeployment = async () => {
    if (!selectedDeployment) return;
    if (
      confirm(`'${selectedDeployment.deploymentName}' 모델을 삭제하시겠습니까?`)
    ) {
      const failed = await deleteMutation.mutateAsync([selectedDeployment.id]);
      if (failed.length === 0) {
        setIsDetailModalOpen(false);
        setSelectedDeployment(null);
      } else {
        alert(failed[0].reason);
      }
    }
  };

  // 다중 삭제 (호출부: 테이블 하단 '휴지통' 다중 선택 삭제 아이콘 클릭 시)
  const handleBulkDelete = async (deployments: Deployment[]) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개의 모델을 삭제하시겠습니까?`)) {
      return;
    }
    const deploymentIds = Array.from(selectedIds).map(
      (idx) => deployments[idx].id
    );
    const failedItems = await deleteMutation.mutateAsync(deploymentIds);
    if (failedItems.length > 0) {
      alert(
        `일부 항목 삭제 실패:\n${failedItems.map((f) => f.reason).join('\n')}`
      );
    } else {
      setSelectedIds(new Set());
    }
  };

  // 행 클릭
  const handleRowClick = (deployment: Deployment) => {
    setSelectedDeployment(deployment);
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
    selectedDeployment,
    selectedIds,
    currentPage,
    sortState,
    totalPages,
    setIsCreateModalOpen,
    setIsDetailModalOpen,
    setIsEditModalOpen,
    setSelectedDeployment,
    // 핸들러
    handleSearch,
    handlePageChange,
    handleSort,
    handleToggleSelect,
    handleToggleSelectAll,
    handleCreateDeployment,
    handleEditDeployment,
    handleDeleteDeployment,
    handleBulkDelete,
    handleRowClick,
    handleEditClick,
  };
};
