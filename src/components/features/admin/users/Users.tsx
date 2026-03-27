import { useAtomValue } from 'jotai';
import { Users } from 'lucide-react';
import { getUserListAtom } from '@/hooks/admin/useUserData';
import { useUserTableHandler } from '@/hooks/admin/useUserTableHandler';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { type User } from '@/types/admin/user';
import SearchBar from '@/components/ui/SearchBar';
import UserActionBar from '@/components/features/admin/users/UserActionBar';
import { UserTableColumns } from '@/components/features/admin/users/UserTableColumns';
import BulkDeleteButton from '@/components/ui/BulkDeleteButton';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import UserFormModal from '@/components/features/admin/users/UserFormModal';
import UserDetailModal from '@/components/features/admin/users/UserDetailModal';

const UsersPage = () => {
  // 서버 데이터 atom 구독
  const { data, isLoading, isError, error } = useAtomValue(getUserListAtom);
  const { isSuperAdmin } = useCurrentUser();

  const users = data?.users ?? [];
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
    selectedUser,
    selectedIds,
    currentPage,
    sortState,
    totalPages,
    setIsCreateModalOpen,
    setIsDetailModalOpen,
    setIsEditModalOpen,
    setSelectedUser,
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
  } = useUserTableHandler(totalCount);

  return (
    <div className='h-full bg-neutral-50'>
      <div className='bg-white border-b border-neutral-200 px-8 py-6'>
        <div className='flex items-center gap-3'>
          <Users className='w-6 h-6 text-neutral-700' />
          <h1 className='text-2xl font-bold text-neutral-900'>사용자 관리</h1>
        </div>
      </div>

      <div className='p-8'>
        <div className='bg-white rounded-xl border border-neutral-200 p-5 shadow-sm'>
          <SearchBar type='users' onSearch={handleSearch} />
        </div>

        <div className='mt-6'>
          <div className='mb-3'>
            <UserActionBar
              totalCount={totalCount}
              selectedCount={selectedIds.size}
              onCreateClick={() => setIsCreateModalOpen(true)}
              showCreateButton={isSuperAdmin}
            />
          </div>

          <div className='flex flex-col'>
            <div className='border border-neutral-200 rounded-lg overflow-hidden'>
              <DataTable<User>
                data={users}
                columns={UserTableColumns}
                rowKey={(u) => u.loginId}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={() => handleToggleSelectAll(users.length)}
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
                onDelete={() => handleBulkDelete(users)}
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

      <UserFormModal
        mode='create'
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={handleEditClick}
        onDelete={handleDeleteUser}
        showEditDelete={isSuperAdmin}
      />

      {isEditModalOpen && (
        <UserFormModal
          mode='edit'
          isOpen={true}
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleEditUser}
        />
      )}
    </div>
  );
};

export default UsersPage;
