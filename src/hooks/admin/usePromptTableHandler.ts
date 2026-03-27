import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import {
  createPromptAtom,
  updatePromptAtom,
  updateIsActiveAtom,
  deletePromptsAtom,
} from '@/hooks/admin/usePromptData';
import {
  promptSelectedIdsAtom,
  promptCurrentPageAtom,
  promptSortStateAtom,
  selectedPromptAtom,
  isEditPromptModalOpenAtom,
  isDetailPromptModalOpenAtom,
  isCreatePromptModalOpenAtom,
  promptListParamsAtom,
} from '@/store/admin/promptUI';
import type { CreatePromptForm, EditPromptForm, Prompt } from '@/types/admin/prompt';
import type { SearchBarFilter } from '@/types/admin/search';

// Axios 에러 객체에서 API 에러 메시지 문자열만 추출
function getPromptApiErrorMessage(error: unknown): string | null {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response;
    return res?.data?.error?.message ?? null;
  }
  return null;
}

// organizationId: 상단 조직 탭에서 선택된 조직 ID. 조직 전환 시 목록·페이지·검색·정렬·선택 상태를 초기화하고,
// 생성·수정·상태 변경·삭제 API 호출 시 orgId로 사용된다.
export const usePromptTableHandler = (
  organizationId: string | number | undefined,
  totalCount: number
) => {
  const { t } = useTranslation();

  // 서버 상태
  const [createMutation] = useAtom(createPromptAtom);
  const [updateMutation] = useAtom(updatePromptAtom);
  const [updateIsActiveMutation] = useAtom(updateIsActiveAtom);
  const [deleteMutation] = useAtom(deletePromptsAtom);
  const [params, setParams] = useAtom(promptListParamsAtom);

  // 클라이언트 상태
  const [isCreatePromptModalOpen, setIsCreatePromptModalOpen] = useAtom(
    isCreatePromptModalOpenAtom
  );
  const [isEditPromptModalOpen, setIsEditPromptModalOpen] = useAtom(
    isEditPromptModalOpenAtom
  );
  const [isDetailPromptModalOpen, setIsDetailPromptModalOpen] = useAtom(
    isDetailPromptModalOpenAtom
  );
  const [selectedPrompt, setSelectedPrompt] = useAtom(selectedPromptAtom);
  const [selectedIds, setSelectedIds] = useAtom(promptSelectedIdsAtom);
  const [currentPage, setCurrentPage] = useAtom(promptCurrentPageAtom);
  const [sortState, setSortState] = useAtom(promptSortStateAtom);

  const totalPages = Math.max(1, Math.ceil(totalCount / params.limit));

  const resetListState = () => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      searchCategory: '',
      searchKeyword: '',
      sort: 'agent_name',
      order: 'asc',
    }));
    setCurrentPage(1);
    setSelectedIds(new Set());
    setSortState({ field: 'agent_name', order: 'asc' });
    setSelectedPrompt(null);
    setIsCreatePromptModalOpen(false);
    setIsDetailPromptModalOpen(false);
    setIsEditPromptModalOpen(false);
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

  // 검색
  const handleSearch = ({ searchCategory, searchKeyword }: SearchBarFilter) => {
    setParams((prev) => ({
      ...prev,
      searchCategory: searchCategory,
      searchKeyword: searchKeyword,
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
    const next = new Set(selectedIds);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIds(next);
  };

  // 체크박스 전체 선택
  const handleToggleSelectAll = (pagedPromptsCount: number) => {
    if (selectedIds.size === pagedPromptsCount) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(Array.from({ length: pagedPromptsCount }, (_, i) => i))
      );
    }
  };

  // 생성
  const handleCreatePromptSave = async (formData: CreatePromptForm) => {
    if (organizationId == null) return;
    const orgId = Number(organizationId);
    try {
      await createMutation.mutateAsync({
        orgId,
        formData: formData,
      });
      setIsCreatePromptModalOpen(false);
    } catch (error) {
      const apiMessage = getPromptApiErrorMessage(error);
      alert(
        `${t('prompt.error.createFailed')}\n\n${apiMessage ? `${apiMessage}` : ''}`
      );
    }
  };

  // 수정
  const handleEditPromptSave = async (formData: EditPromptForm) => {
    const promptId = Number(formData.promptId);
    if (Number.isNaN(promptId)) return;
    if (organizationId == null) return;
    const orgId = Number(organizationId);
    try {
      await updateMutation.mutateAsync({
        promptId,
        orgId,
        formData,
      });
      setIsEditPromptModalOpen(false);
    } catch (error) {
      const apiMessage = getPromptApiErrorMessage(error);
      alert(
        `${t('prompt.error.updateFailed')}\n\n${apiMessage ? `${apiMessage}` : ''}`
      );
    }
  };

  // 활성화 토글
  const handlePromptStatusToggle = async (
    prompt: Prompt,
    isActive: boolean
  ) => {
    try {
      if (organizationId == null) return;
      const orgId = Number(organizationId);
      await updateIsActiveMutation.mutateAsync({
        promptId: prompt.promptId,
        orgId,
        isActive,
      });
    } catch (error) {
      const apiMessage = getPromptApiErrorMessage(error);
      alert(
        `${t('prompt.error.updateStatusFailed')}\n\n${apiMessage ? `${apiMessage}` : ''}`
      );
    }
  };

  // 행 클릭 시 상세 모달 열기
  const handlePromptRowClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDetailPromptModalOpen(true);
  };

  // 상세 모달에서 수정 모달 열기
  const handleEditPromptClick = () => {
    setIsDetailPromptModalOpen(false);
    setIsEditPromptModalOpen(true);
  };

  // 단일 삭제 (호출부: 상세 모달 '삭제' 버튼 클릭 시)
  const handleDeletePromptClick = async () => {
    if (!selectedPrompt) return;
    if (
      confirm(
        t('prompt.confirm.deleteOne', { name: selectedPrompt.promptName })
      )
    ) {
      await deleteMutation.mutateAsync({
        promptIds: [selectedPrompt.promptId],
        organizationId,
      });
      setIsDetailPromptModalOpen(false);
      setSelectedPrompt(null);
    }
  };

  // 다중 삭제 (호출부: 테이블 하단 '휴지통' 다중 선택 삭제 아이콘 클릭 시)
  const handlePromptBulkDelete = async (prompt: Prompt[]) => {
    if (selectedIds.size === 0) return;
    if (!confirm(t('prompt.confirm.deleteBulk', { count: selectedIds.size }))) {
      return;
    }
    const promptIds = Array.from(selectedIds).map(
      (idx) => prompt[idx].promptId
    );
    const failedItems = await deleteMutation.mutateAsync({
      promptIds,
      organizationId,
    });
    if (failedItems.length > 0) {
      const details = failedItems
        .map((f) => `ID: ${f.promptId} - ${f.reason}`)
        .join('\n');
      alert(`${t('prompt.error.deleteSomeFailed')}\n\n${details}`);
    }
    setSelectedIds(new Set());
  };

  // 생성 모달 열기
  const handleOpenCreatePromptModal = () => setIsCreatePromptModalOpen(true);

  // 생성 모달 닫기
  const handleCloseCreatePromptModal = () => setIsCreatePromptModalOpen(false);

  // 상세 모달 닫기 및 선택 프롬프트 해제
  const handleCloseDetailPromptModal = () => {
    setIsDetailPromptModalOpen(false);
    setSelectedPrompt(null);
  };
  // 수정 모달 닫기 및 선택 프롬프트 해제
  const handleCloseEditPromptModal = () => {
    setIsEditPromptModalOpen(false);
    setSelectedPrompt(null);
  };

  return {
    // UI 상태 값
    isCreatePromptModalOpen,
    isEditPromptModalOpen,
    isDetailPromptModalOpen,
    selectedPrompt,
    selectedIds,
    currentPage,
    sortState,
    totalPages,
    setIsCreatePromptModalOpen,
    setIsEditPromptModalOpen,
    setIsDetailPromptModalOpen,
    setSelectedPrompt,
    // 핸들러
    handleSearch,
    handlePageChange,
    handleSort,
    handleToggleSelect,
    handleToggleSelectAll,
    handleCreatePromptSave,
    handleEditPromptSave,
    handlePromptRowClick,
    handleEditPromptClick,
    handleDeletePromptClick,
    handlePromptStatusToggle,
    handlePromptBulkDelete,
    handleOpenCreatePromptModal,
    handleCloseCreatePromptModal,
    handleCloseDetailPromptModal,
    handleCloseEditPromptModal,
  };
};
