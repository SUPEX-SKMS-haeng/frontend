import { type ColumnDef } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { type Deployment } from '@/types/admin/deployment';

export const DeploymentTableColumns: ColumnDef<Deployment>[] = [
  {
    id: 'provider',
    accessorKey: 'provider',
    header: 'Provider',
    enableSorting: true,
    meta: { style: { width: '10%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-700 font-medium'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'model_name',
    accessorKey: 'model',
    header: 'Model',
    enableSorting: true,
    meta: { style: { width: '15%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis block'>
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: 'model_version',
    accessorKey: 'version',
    header: 'Version',
    enableSorting: true,
    meta: { style: { width: '10%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-700'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'deployment_name',
    accessorKey: 'deploymentName',
    header: 'Deployment Name',
    enableSorting: true,
    meta: { style: { width: '15%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-700 overflow-hidden text-ellipsis whitespace-nowrap block'>
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: 'endpoint',
    accessorKey: 'endpoint',
    header: 'Endpoint',
    enableSorting: false,
    meta: { style: { width: '15%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-700 overflow-hidden text-ellipsis whitespace-nowrap block'>
        {getValue<string>() || '-'}
      </span>
    ),
  },
  {
    id: 'access_key',
    accessorKey: 'accessKey',
    header: 'Access Key',
    enableSorting: false,
    meta: { style: { width: '10%' } },
    cell: () => (
      <span className='text-neutral-500 whitespace-nowrap'>******</span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'status',
    header: '상태',
    enableSorting: false,
    meta: { style: { width: '10%' } },
    cell: ({ getValue }) => {
      const status = getValue<Deployment['status']>();
      return (
        <span
          className={clsx(
            'font-medium whitespace-nowrap',
            status === '활성' ? 'text-green-600' : 'text-neutral-500'
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'create_dt',
    accessorKey: 'createdAt',
    header: '생성 일시',
    enableSorting: false,
    meta: { style: { width: '15%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-500 whitespace-nowrap'>
        {getValue<string>()}
      </span>
    ),
  },
];
