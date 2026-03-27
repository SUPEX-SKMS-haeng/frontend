import { type ColumnDef } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { ShieldCheck } from 'lucide-react';
import { type User } from '@/types/admin/user';

export const UserTableColumns: ColumnDef<User>[] = [
  {
    id: 'user_id',
    accessorKey: 'loginId',
    header: 'ID',
    enableSorting: false,
    meta: { style: { width: '10%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-500 font-mono'>
        {getValue<string>() || '-'}
      </span>
    ),
  },
  {
    id: 'username',
    accessorKey: 'name',
    header: '이름',
    enableSorting: true,
    meta: { style: { width: '15%' } },
    cell: ({ getValue, row }) => {
      const isSuperAdmin = row.original.role === 'SuperAdmin';
      return (
        <span className='flex items-center gap-1.5'>
          <span className='text-neutral-900 font-medium'>
            {getValue<string>()}
          </span>
          {isSuperAdmin && (
            <span title=':superadmin:' className='inline-flex items-center'>
              <ShieldCheck className='w-4 h-4 text-violet-500 shrink-0' />
            </span>
          )}
        </span>
      );
    },
  },
  {
    id: 'company',
    accessorKey: 'company',
    header: '회사',
    enableSorting: true,
    meta: { style: { width: '20%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-700'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: '상태',
    enableSorting: false,
    meta: { style: { width: '12%' } },
    cell: ({ getValue }) => {
      const status = getValue<User['status']>();
      return (
        <span
          className={clsx(
            'font-medium',
            status === '활성' ? 'text-green-600' : 'text-red-500'
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'last_sign_in',
    accessorKey: 'lastAccessAt',
    header: '마지막 접속일시',
    enableSorting: false,
    meta: { style: { width: '40%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-500'>{getValue<string>()}</span>
    ),
  },
];
