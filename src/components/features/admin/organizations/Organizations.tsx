import { useAtomValue } from 'jotai';
import { Boxes } from 'lucide-react';
import { type Organization } from '@/types/admin/organization';
import { getOrganizationListAtom } from '@/hooks/admin/useOrganizationData';
import { useOrganizationTableHandler } from '@/hooks/admin/useOrganizationTableHandler';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import SearchBar from '@/components/ui/SearchBar';
import OrganizationActionBar from '@/components/features/admin/organizations/OrganizationActionBar';
import { OrganizationTableColumns } from '@/components/features/admin/organizations/OrganizationTableColumns';
import BulkDeleteButton from '@/components/ui/BulkDeleteButton';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import OrganizationFormModal from '@/components/features/admin/organizations/OrganizationFormModal';
import OrganizationDetailPanel from '@/components/features/admin/organizations/OrganizationDetailPanel';

const OrganizationsPage = () => {
  // 서버 데이터 atom 구독 (페이지가 직접 구독하는 유일한 atom)
  const { data, isLoading, isError } = useAtomValue(getOrganizationListAtom);
  const { isSuperAdmin } = useCurrentUser();

  const organizations = data?.organizations ?? [];
  const totalCount = data?.total ?? 0;

  // UI 상태 + 핸들러 모두 훅에서 (totalCount를 전달해 totalPages 계산)
  const {
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
  } = useOrganizationTableHandler(totalCount);

  return (
    <div className='h-full bg-neutral-50 relative overflow-hidden'>
      <div className='bg-white border-b border-neutral-200 px-8 py-6'>
        <div className='flex items-center gap-3'>
          <Boxes className='w-6 h-6 text-neutral-700' />
          <h1 className='text-2xl font-bold text-neutral-900'>그룹 관리</h1>
        </div>
      </div>

      <div className='p-8'>
        <div className='bg-white rounded-xl border border-neutral-200 p-5 shadow-sm'>
          <SearchBar type='organizations' onSearch={handleSearch} />
        </div>

        <div className='mt-6'>
          <div className='mb-3'>
            <OrganizationActionBar
              totalCount={totalCount}
              selectedCount={selectedIds.size}
              onCreateClick={() => setIsCreateModalOpen(true)}
              onEditClick={() => handleEditClick(organizations)}
              canEdit={selectedIds.size === 1}
              canCreate={isSuperAdmin}
            />
          </div>

          <div className='flex flex-col'>
            <div className='border border-neutral-200 rounded-lg overflow-hidden'>
              <DataTable<Organization>
                data={organizations}
                columns={OrganizationTableColumns}
                rowKey={(o) => o.id}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={() =>
                  handleToggleSelectAll(organizations.length)
                }
                sortBy={sortState.field}
                sortOrder={sortState.order}
                onSort={handleSort}
                onRowClick={handleRowClick}
                isLoading={isLoading}
                isError={isError}
              />
            </div>

            <div className='mt-4 flex items-center justify-between flex-shrink-0'>
              <BulkDeleteButton
                selectedCount={selectedIds.size}
                onDelete={() => handleBulkDelete(organizations)}
                visible={isSuperAdmin}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>

      <OrganizationFormModal
        mode='create'
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {isEditModalOpen && selectedOrganization && (
        <OrganizationFormModal
          mode='edit'
          isOpen={true}
          organization={selectedOrganization}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOrganization(null);
          }}
          onSave={handleEdit}
        />
      )}

      <OrganizationDetailPanel
        organization={selectedOrganization}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedOrganization(null);
        }}
      />
    </div>
  );
};

export default OrganizationsPage;
