import { type ColumnDef } from '@tanstack/react-table';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { type Organization } from '@/types/organization';

export const OrganizationTableColumns: ColumnDef<Organization>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: '이름',
    enableSorting: true,
    meta: { style: { width: '20%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-900 font-medium'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: '설명',
    enableSorting: false,
    meta: { style: { width: '37%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-600'>{getValue<string>() || '-'}</span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: '상태',
    enableSorting: false,
    meta: { style: { width: '12%' } },
    cell: ({ getValue }) => {
      const status = getValue<Organization['status']>();
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
    id: 'created_dt',
    accessorKey: 'createdAt',
    header: '생성일시',
    enableSorting: false,
    meta: { style: { width: '28%' } },
    cell: ({ getValue }) => {
      const raw = getValue<string>();
      const formatted = raw ? dayjs(raw).format('YYYY-MM-DD HH:mm:ss') : '-';
      return <span className='text-neutral-500'>{formatted}</span>;
    },
  },
];
