import { useAtomValue } from 'jotai';
import { Bot } from 'lucide-react';
import { getDeploymentListAtom } from '@/hooks/admin/useDeploymentData';
import { useDeploymentTableHandler } from '@/hooks/admin/useDeploymentTableHandler';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { type Deployment } from '@/types/admin/deployment';
import SearchBar from '@/components/ui/SearchBar';
import DeploymentActionBar from '@/components/features/admin/deployments/DeploymentActionBar';
import { DeploymentTableColumns } from '@/components/features/admin/deployments/DeploymentTableColumns';
import BulkDeleteButton from '@/components/ui/BulkDeleteButton';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import DeploymentFormModal from '@/components/features/admin/deployments/DeploymentFormModal';
import DeploymentDetailModal from '@/components/features/admin/deployments/DeploymentDetailModal';

const DeploymentsPage = () => {
  // 서버 데이터 atom 구독
  const { data, isLoading, isError, error } = useAtomValue(
    getDeploymentListAtom
  );
  const { isSuperAdmin } = useCurrentUser();

  const deployments = data?.deployments ?? [];
  const totalCount = data?.total ?? 0;
  const errorMessage =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 403
      ? '목록을 볼 권한이 없습니다'
      : '데이터를 불러오는데 실패했습니다.';

  const {
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
  } = useDeploymentTableHandler(totalCount);

  return (
    <div className='h-full bg-neutral-50'>
      <div className='bg-white border-b border-neutral-200 px-8 py-6'>
        <div className='flex items-center gap-3'>
          <Bot className='w-6 h-6 text-neutral-700' />
          <h1 className='text-2xl font-bold text-neutral-900'>모델 관리</h1>
        </div>
      </div>

      <div className='p-8'>
        <div className='bg-white rounded-xl border border-neutral-200 p-5 shadow-sm'>
          <SearchBar type='deployments' onSearch={handleSearch} />
        </div>

        <div className='mt-6'>
          <div className='mb-3'>
            <DeploymentActionBar
              totalCount={totalCount}
              selectedCount={selectedIds.size}
              onCreateClick={() => setIsCreateModalOpen(true)}
              showCreateButton={isSuperAdmin}
            />
          </div>

          <div className='flex flex-col'>
            <div className='border border-neutral-200 rounded-lg overflow-hidden'>
              <DataTable<Deployment>
                data={deployments}
                columns={DeploymentTableColumns}
                rowKey={(d) => d.id}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={() =>
                  handleToggleSelectAll(deployments.length)
                }
                sortBy={sortState.field}
                sortOrder={sortState.order}
                onSort={handleSort}
                onRowClick={handleRowClick}
                isLoading={isLoading}
                isError={isError}
                errorMessage={errorMessage}
              />
            </div>

            <div className='mt-4 flex items-center justify-between flex-shrink-0'>
              <BulkDeleteButton
                selectedCount={selectedIds.size}
                onDelete={() => handleBulkDelete(deployments)}
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

      <DeploymentFormModal
        mode='create'
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateDeployment}
      />

      <DeploymentDetailModal
        isOpen={isDetailModalOpen}
        deployment={selectedDeployment}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDeployment(null);
        }}
        onEdit={handleEditClick}
        onDelete={handleDeleteDeployment}
        showEditDelete={isSuperAdmin}
      />

      {isEditModalOpen && (
        <DeploymentFormModal
          mode='edit'
          isOpen={true}
          deployment={selectedDeployment}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDeployment(null);
          }}
          onSave={handleEditDeployment}
        />
      )}
    </div>
  );
};

export default DeploymentsPage;
