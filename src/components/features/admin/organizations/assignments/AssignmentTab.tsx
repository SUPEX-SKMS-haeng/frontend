import { useAtomValue } from 'jotai';
import { getAssignmentsAtom } from '@/hooks/admin/useAssignmentData';
import { useAssignmentTableHandler } from '@/hooks/admin/useAssignmentTableHandler';
import SearchBar from '@/components/ui/SearchBar';
import AssignmentActionBar from './AssignmentActionBar';
import AddAssignmentModal from './AddAssignmentModal';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { AssignmentTableColumns } from './AssignmentTableColumns';
import type { Assignment } from '@/types/admin/assignment';

const AssignmentTab = ({
  organizationId,
  panelOpenKey,
}: {
  organizationId: string | number | undefined;
  panelOpenKey: number;
}) => {
  const { data, isLoading, isError } = useAtomValue(getAssignmentsAtom);

  const assignments = data?.assignments ?? [];
  const totalCount = data?.total ?? 0;

  const {
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
    handleOpenAddAssignmentModal,
    handleCloseAddAssignmentModal,
  } = useAssignmentTableHandler(organizationId, totalCount);

  const handleAssignmentSave = async (diff: {
    added: number[];
    removed: number[];
  }) => {
    await handleSaveAssignments(diff);
    handleCloseAddAssignmentModal();
  };

  return (
    <div className='flex flex-col flex-1 p-5 gap-4 min-h-0'>
      <SearchBar
        key={`assignments-${organizationId ?? 'none'}-${panelOpenKey}`}
        type='assignments'
        onSearch={handleSearch}
      />

      <AssignmentActionBar
        totalCount={totalCount}
        selectedCount={selectedIds.size}
        onAddRemoveClick={handleOpenAddAssignmentModal}
      />

      <div className='border border-neutral-200 rounded-lg overflow-hidden'>
        <DataTable<Assignment>
          data={assignments}
          columns={AssignmentTableColumns}
          rowKey={(m) => m.id}
          selectable={false}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={() => handleToggleSelectAll(assignments.length)}
          sortBy={sortState.field}
          sortOrder={sortState.order}
          onSort={handleSort}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <div className='mt-4 flex items-center justify-between flex-shrink-0'>
        <div />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <AddAssignmentModal
        isOpen={isAddAssignmentModalOpen}
        onClose={handleCloseAddAssignmentModal}
        onSave={handleAssignmentSave}
        organizationId={organizationId}
      />
    </div>
  );
};

export default AssignmentTab;
