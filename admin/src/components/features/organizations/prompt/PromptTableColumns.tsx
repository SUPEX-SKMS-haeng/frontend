import { type ColumnDef } from '@tanstack/react-table';
import { clsx } from 'clsx';
import type { TFunction } from 'i18next';
import { type Prompt, type PromptStatus } from '@/types/prompt';

export type PromptTableColumnsOptions = {
  t: TFunction;
  onStatusToggle: (prompt: Prompt, isActive: boolean) => void;
};

export const createPromptTableColumns = ({
  t,
  onStatusToggle,
}: PromptTableColumnsOptions): ColumnDef<Prompt>[] => [
  {
    id: 'agent_name',
    accessorKey: 'agentName',
    header: 'Agent',
    enableSorting: true,
    meta: { style: { width: '15%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-900 font-medium'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'prompt_type',
    accessorKey: 'promptType',
    header: 'Type',
    enableSorting: true,
    meta: { style: { width: '12%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-900 font-medium'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'prompt_name',
    accessorKey: 'promptName',
    header: t('prompt.label.name'),
    enableSorting: true,
    meta: { style: { width: '30%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-700'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'prompt_description',
    accessorKey: 'promptDescription',
    header: t('prompt.label.description'),
    enableSorting: false,
    meta: { style: { width: '50%' } },
    cell: ({ getValue }) => (
      <span
        className='block truncate text-neutral-700'
        title={getValue<string>() ?? undefined}
      >
        {getValue<string>() ?? ''}
      </span>
    ),
  },
  {
    id: 'prompt_version',
    accessorKey: 'promptVersion',
    header: 'Version',
    enableSorting: true,
    meta: { style: { width: '12%' } },
    cell: ({ getValue }) => (
      <span className='text-neutral-700'>{getValue<string>()}</span>
    ),
  },
  {
    id: 'is_active',
    accessorKey: 'status',
    header: t('common.status.activeLabel'),
    enableSorting: false,
    meta: { style: { width: '12%' } },
    cell: ({ getValue, row }) => {
      const isActive = getValue<PromptStatus>() === '활성';
      return (
        <div className='flex items-center gap-2'>
          <button
            type='button'
            title={t('common.status.activeLabel')}
            onClick={(e) => {
              e.stopPropagation();
              const messageIsActive = isActive
                ? t('common.status.inactive')
                : t('common.status.active');
              if (
                window.confirm(
                  t('prompt.confirm.updateStatus', {
                    name: row.original.promptName,
                    status: messageIsActive,
                  })
                )
              ) {
                onStatusToggle(row.original, !isActive);
              }
            }}
            className={clsx(
              'relative w-10 h-5 rounded-full transition-colors duration-200',
              isActive ? 'bg-blue-800' : 'bg-neutral-300'
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',
                isActive && 'translate-x-5'
              )}
            />
          </button>
        </div>
      );
    },
  },
];
