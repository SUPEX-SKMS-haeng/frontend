import { useMemo } from 'react';
import { useMemberTableHandler } from '@/hooks/admin/useMemberTableHandler';
import SearchBar from '@/components/ui/SearchBar';
import MemberActionBar from './MemberActionBar';
import AddMemberModal from './AddMemberModal';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { CreateMemberTableColumns } from './MemberTableColumns';
import type { Member } from '@/types/admin/member';
import { useAtomValue } from 'jotai';
import { getMembersByOrgAtom } from '@/hooks/admin/useMemberData';

const MemberTab = ({
  organizationId,
  panelOpenKey,
}: {
  organizationId: string | number | undefined;
  panelOpenKey: number;
}) => {
  // 서버 상태 (atomWithMutation은 첫 번째 요소에 { mutate, mutateAsync } 포함)
  const { data, isLoading, isError } = useAtomValue(getMembersByOrgAtom);

  const members = data?.members ?? [];
  const totalCount = data?.total ?? 0;

  const {
    isRoleEditMode,
    isSuperAdmin,
    currentUserId,
    isAddMemberModalOpen,
    selectedIds,
    currentPage,
    sortState,
    totalPages,
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
    handleOpenAddMemberModal,
    handleCloseAddMemberModal,
    pendingRoleChanges,
  } = useMemberTableHandler(organizationId, totalCount);

  const memberColumns = useMemo(
    () =>
      CreateMemberTableColumns({
        isRoleEditMode,
        isSuperAdmin,
        currentUserId,
        pendingRoleChanges,
        onRoleChange: handleRoleChange,
      }),
    [
      isRoleEditMode,
      isSuperAdmin,
      currentUserId,
      pendingRoleChanges,
      handleRoleChange,
    ]
  );

  const handleRoleEditSaveWithConfirm = () => {
    if (!window.confirm('저장하시겠습니까?')) return;
    void handleRoleEditSave(members);
  };

  const handleMemberSave = async (diff: {
    added: number[];
    removed: number[];
  }) => {
    await handleSaveMembers(diff);
    handleCloseAddMemberModal();
  };

  return (
    <div className='flex flex-col flex-1 p-5 gap-4 min-h-0'>
      <SearchBar
        key={`members-${organizationId ?? 'none'}-${panelOpenKey}`}
        type='members'
        onSearch={handleSearch}
      />

      <MemberActionBar
        totalCount={totalCount}
        selectedCount={selectedIds.size}
        isRoleEditMode={isRoleEditMode}
        onRoleEditStart={handleRoleEditStart}
        onRoleEditCancel={handleRoleEditCancel}
        onRoleEditSave={handleRoleEditSaveWithConfirm}
        onAddRemoveClick={handleOpenAddMemberModal}
      />

      <div className='border border-neutral-200 rounded-lg overflow-hidden'>
        <DataTable<Member>
          data={members}
          columns={memberColumns}
          rowKey={(m) => m.id || m.name}
          selectable={false}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={() => handleToggleSelectAll(members.length)}
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

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={handleCloseAddMemberModal}
        onSave={handleMemberSave}
        organizationId={organizationId}
      />
    </div>
  );
};

export default MemberTab;
