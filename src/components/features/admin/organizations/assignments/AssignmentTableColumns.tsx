import { type ColumnDef } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { type Assignment } from '@/types/admin/assignment';

const maskAccessKey = (key: string): string => {
  if (!key) return '-';
  if (key.includes('•')) return key;
  if (key.length <= 4) return key;
  return key.slice(0, 4) + '••••••••••';
};

const truncateEndpoint = (endpoint: string): string => {
  if (!endpoint) return '-';
  if (endpoint.length <= 20) return endpoint;
  const url = endpoint.replace(/^https?:\/\//, '');
  return 'https://' + url.slice(0, 10) + '/…';
};

export const AssignmentTableColumns: ColumnDef<Assignment>[] = [
  {
    id: 'provider',
    accessorKey: 'provider',
    header: 'Provider',
    enableSorting: true,
    meta: { style: { width: '12%' } },
    cell: ({ getValue }) => {
      const provider = getValue<string>();
      return (
        <span
          className='block min-w-0 truncate text-neutral-800 font-medium'
          title={provider}
        >
          {provider}
        </span>
      );
    },
  },
  {
    id: 'model_name',
    accessorKey: 'model',
    header: 'Model',
    enableSorting: true,
    meta: { style: { width: '14%' } },
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
    id: 'model_version',
    accessorKey: 'version',
    header: 'Version',
    enableSorting: true,
    meta: { style: { width: '12%' } },
    cell: ({ getValue }) => {
      const version = getValue<string>();
      return (
        <span
          className='block min-w-0 truncate text-neutral-600 font-mono text-xs'
          title={version}
        >
          {version}
        </span>
      );
    },
  },
  {
    id: 'deployment_name',
    accessorKey: 'deploymentName',
    header: 'Deployment Name',
    enableSorting: true,
    meta: { style: { width: '18%' } },
    cell: ({ getValue }) => (
      <span
        className='block min-w-0 truncate text-neutral-700 text-xs'
        title={getValue<string>()}
      >
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: 'endpoint',
    accessorKey: 'endpoint',
    header: 'Endpoint',
    enableSorting: false,
    meta: { style: { width: '16%' } },
    cell: ({ getValue }) => {
      const raw = getValue<string>();
      return (
        <span
          className='block min-w-0 truncate text-neutral-500 text-xs font-mono'
          title={raw}
        >
          {truncateEndpoint(raw)}
        </span>
      );
    },
  },
  {
    id: 'access_key',
    accessorKey: 'accessKey',
    header: 'Access Key',
    enableSorting: false,
    meta: { style: { width: '14%' } },
    cell: ({ getValue }) => (
      <span
        className='block min-w-0 truncate text-neutral-500 text-xs font-mono'
        title={getValue<string>()}
      >
        {maskAccessKey(getValue<string>())}
      </span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'status',
    header: '상태',
    enableSorting: false,
    meta: { style: { width: '8%' } },
    cell: ({ getValue }) => {
      const status = getValue<Assignment['status']>();
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
