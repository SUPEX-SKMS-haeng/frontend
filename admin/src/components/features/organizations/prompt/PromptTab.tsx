import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { getPromptListAtom, getPromptTypesAtom } from '@/hooks/usePromptData';
import { usePromptTableHandler } from '@/hooks/usePromptTableHandler';
import SearchBar from '@/components/ui/SearchBar';
import PromptActionBar from './PromptActionBar';
import PromptFormModal from './PromptFormModal';
import PromptDetailModal from './PromptDetailModal';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import BulkDeleteButton from '@/components/ui/BulkDeleteButton';
import { createPromptTableColumns } from './PromptTableColumns';
import type { Prompt } from '@/types/prompt';

const PromptTab = ({
  organizationId,
  panelOpenKey,
}: {
  organizationId: string | number | undefined;
  panelOpenKey: number;
}) => {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useAtomValue(getPromptListAtom);
  const { data: promptTypesData } = useAtomValue(getPromptTypesAtom);

  const promptTypes = promptTypesData ?? [];
  const prompts = data?.prompts ?? [];
  const totalCount = data?.total ?? 0;

  const {
    isCreatePromptModalOpen,
    isEditPromptModalOpen,
    isDetailPromptModalOpen,
    selectedPrompt,
    selectedIds,
    currentPage,
    sortState,
    totalPages,
    handleSearch,
    handlePageChange,
    handleSort,
    handlePromptRowClick,
    handlePromptStatusToggle,
    handlePromptBulkDelete,
    handleToggleSelect,
    handleToggleSelectAll,
    handleCreatePromptSave,
    handleEditPromptSave,
    handleEditPromptClick,
    handleDeletePromptClick,
    handleOpenCreatePromptModal,
    handleCloseDetailPromptModal,
    handleCloseEditPromptModal,
    handleCloseCreatePromptModal,
  } = usePromptTableHandler(organizationId, totalCount);

  const promptTableColumns = useMemo(
    () =>
      createPromptTableColumns({
        onStatusToggle: handlePromptStatusToggle,
        t,
      }),
    [handlePromptStatusToggle, t]
  );

  return (
    <div className='flex flex-col flex-1 p-5 gap-4 min-h-0'>
      <SearchBar
        key={`prompts-${organizationId ?? 'none'}-${panelOpenKey}`}
        type='prompts'
        onSearch={handleSearch}
      />

      <PromptActionBar
        totalCount={totalCount}
        selectedCount={selectedIds.size}
        onCreateClick={handleOpenCreatePromptModal}
      />

      <div className='border border-neutral-200 rounded-lg overflow-hidden'>
        <DataTable<Prompt>
          data={prompts}
          columns={promptTableColumns}
          rowKey={(m) => m.assignmentId}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={() => handleToggleSelectAll(prompts.length)}
          sortBy={sortState.field}
          sortOrder={sortState.order}
          onSort={handleSort}
          onRowClick={handlePromptRowClick}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <div className='mt-4 flex items-center justify-between flex-shrink-0'>
        <BulkDeleteButton
          selectedCount={selectedIds.size}
          onDelete={() => handlePromptBulkDelete(prompts)}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <PromptFormModal
        mode='create'
        isOpen={isCreatePromptModalOpen}
        promptTypes={promptTypes}
        onClose={handleCloseCreatePromptModal}
        onSave={handleCreatePromptSave}
      />

      <PromptDetailModal
        isOpen={isDetailPromptModalOpen}
        prompt={selectedPrompt}
        onClose={handleCloseDetailPromptModal}
        onEdit={handleEditPromptClick}
        onDelete={handleDeletePromptClick}
      />

      {isEditPromptModalOpen && (
        <PromptFormModal
          mode='edit'
          isOpen={isEditPromptModalOpen}
          prompt={selectedPrompt}
          promptTypes={promptTypes}
          onClose={handleCloseEditPromptModal}
          onSave={handleEditPromptSave}
        />
      )}
    </div>
  );
};

export default PromptTab;
