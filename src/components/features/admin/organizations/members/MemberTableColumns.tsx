import { type ColumnDef } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { type Member, type MemberRole } from '@/types/admin/member';
import { Select } from '@/components/ui/Select';

interface CreateMemberTableColumnsOptions {
  isRoleEditMode: boolean;
  isSuperAdmin: boolean;
  currentUserId: string;
  pendingRoleChanges: Record<string, MemberRole>;
  onRoleChange: (userId: number, newRole: MemberRole) => void;
}

const canEditRole = (
  member: Member,
  isSuperAdmin: boolean,
  currentUserId: string
): boolean => {
  // SuperAdmin은 본인을 포함한 모든 멤버를 편집 가능
  if (isSuperAdmin) return true;

  // 본인 수정 불가 (SuperAdmin 제외)
  if (member.loginId === currentUserId) return false;

  // Admin은 다른 Admin 제외한 멤버의 역할을 수정 가능
  if (member.role !== 'Admin') return true;

  return false;
};

export const CreateMemberTableColumns = ({
  isRoleEditMode,
  isSuperAdmin,
  currentUserId,
  pendingRoleChanges,
  onRoleChange,
}: CreateMemberTableColumnsOptions): ColumnDef<Member>[] => [
  {
    id: 'user_id',
    accessorKey: 'loginId',
    header: 'ID',
    enableSorting: true,
    meta: { style: { width: '10%' } },
    cell: ({ getValue }) => (
      <span className='block min-w-0 truncate text-neutral-500 font-mono'>
        {getValue<string>() || '-'}
      </span>
    ),
  },
  {
    id: 'username',
    accessorKey: 'name',
    header: '이름',
    enableSorting: true,
    meta: { style: { width: '14%' } },
    cell: ({ getValue }) => (
      <span
        className='block min-w-0 truncate text-neutral-900 font-medium'
        title={getValue<string>()}
      >
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: 'company',
    accessorKey: 'company',
    header: '회사',
    enableSorting: true,
    meta: { style: { width: '18%' } },
    cell: ({ getValue }) => (
      <span
        className='block min-w-0 truncate text-neutral-700'
        title={getValue<string>()}
      >
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: '권한',
    enableSorting: false,
    meta: { style: { width: '18%' } },
    cell: ({ row }) => {
      const member = row.original;
      const role = member.role;

      if (isRoleEditMode && canEditRole(member, isSuperAdmin, currentUserId)) {
        // 백엔드 통신 시 필요한 userId를 기준으로 맵핑합니다.
        const key = String(member.userId);
        const displayRole = pendingRoleChanges[key] ?? role;
        return (
          <Select
            size='sm'
            value={displayRole ?? ''}
            onChange={(e) => {
              if (e.target.value && member.userId) {
                onRoleChange(member.userId, e.target.value as MemberRole);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value='Admin'>Admin</option>
            <option value='Common'>Common</option>
          </Select>
        );
      }

      if (!role) return <span className='text-neutral-300'>-</span>;

      return (
        <span
          className={clsx(
            'block min-w-0 truncate text-sm font-medium',
            role === 'Admin' && 'text-slate-600',
            role === 'Common' && 'text-neutral-500'
          )}
        >
          {role}
        </span>
      );
    },
  },
  {
    id: 'is_active',
    accessorKey: 'status',
    header: '상태',
    enableSorting: false,
    meta: { style: { width: '10%' } },
    cell: ({ getValue }) => {
      const status = getValue<Member['status']>();
      return (
        <span
          className={clsx(
            'block min-w-0 truncate font-medium',
            status === '활성' ? 'text-green-600' : 'text-red-500'
          )}
          title={status}
        >
          {status}
        </span>
      );
    },
  },
];
