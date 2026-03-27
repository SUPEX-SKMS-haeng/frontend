import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { saveAssignmentsAtom } from '@/hooks/useAssignmentData';
import {
  assignmentSelectedIdsAtom,
  assignmentListParamsAtom,
  assignmentCurrentPageAtom,
  assignmentSortStateAtom,
  isAddAssignmentModalOpenAtom,
} from '@/store/assignmentUI';
import type { SearchBarFilter } from '@/types/search';


export const useAssignmentTableHandler = (
  organizationId: string | number | undefined,
  totalCount: number
) => {
  const [saveAssignmentsMutation] = useAtom(saveAssignmentsAtom);

  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useAtom(
    isAddAssignmentModalOpenAtom
  );
  const [selectedIds, setSelectedIds] = useAtom(assignmentSelectedIdsAtom);
  const [params, setParams] = useAtom(assignmentListParamsAtom);
  const [currentPage, setCurrentPage] = useAtom(assignmentCurrentPageAtom);
  const [sortState, setSortState] = useAtom(assignmentSortStateAtom);
  
  const resetListState = () => {
    setParams({
      searchCategory: '',
      searchKeyword: '',
      sort: 'provider',
      order: 'asc',
      offset: 0,
      limit: 10,
    });
    setSortState({ field: 'provider', order: 'asc' });
    setCurrentPage(1);
    setSelectedIds(new Set());
    setIsAddAssignmentModalOpen(false);
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

  const totalPages = Math.max(1, Math.ceil(totalCount / params.limit));

  const handleSearch = ({ searchCategory, searchKeyword }: SearchBarFilter) => {
    setParams((prev) => ({
      ...prev,
      searchCategory,
      searchKeyword,
    }));
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
    setCurrentPage(page);
    setSelectedIds(new Set());
  };

  const handleSort = (field: string) => {
    const newOrder =
      sortState.field === field && sortState.order === 'asc' ? 'desc' : 'asc';
    setSortState({ field, order: newOrder });

    setParams((prev) => ({
      ...prev,
      sort: field,
      order: newOrder,
    }));
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (index: number) => {
    const next = new Set(selectedIds);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIds(next);
  };

  const handleToggleSelectAll = (pageAssignmentsCount: number) => {
    if (selectedIds.size === pageAssignmentsCount) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(Array.from({ length: pageAssignmentsCount }, (_, i) => i))
      );
    }
  };

  // AddAssignmentModal 저장: 원하는 최종 모델 목록 전달
  const handleSaveAssignments = async ({
    added,
    removed,
  }: {
    added: number[];
    removed: number[];
  }) => {
    if (organizationId == null) return;
    const orgId = Number(organizationId);

    if (added.length === 0 && removed.length === 0) return;

    const failedItems = await saveAssignmentsMutation.mutateAsync({
      orgId,
      added,
      removed,
    });
    if (failedItems.length > 0) {
      const details = failedItems
        .map((f) => `ID: ${f.id} - ${f.reason}`)
        .join('\n');
      alert(`일부 모델 처리에 실패했습니다:\n${details}`);
    }
    setSelectedIds(new Set());
  };

  return {
    totalPages,
    currentPage,
    selectedIds,
    sortState,
    isAddAssignmentModalOpen,
    handleSearch,
    handlePageChange,
    handleSort,
    handleToggleSelect,
    handleToggleSelectAll,
    handleSaveAssignments,
    handleOpenAddAssignmentModal: () => setIsAddAssignmentModalOpen(true),
    handleCloseAddAssignmentModal: () => setIsAddAssignmentModalOpen(false),
  };
};
