// --- 의존성 및 TanStack Table 컬럼 meta 타입 확장
import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    style?: React.CSSProperties;
  }
}
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { clsx } from 'clsx';
import { cn } from '@shared/utils/utils';

// --- 테이블 마크업용 프리미티브 (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className='relative w-full overflow-auto'>
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b border-neutral-200 transition-colors', className)}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'px-4 py-2.5 text-left text-xs font-semibold text-neutral-600 align-middle',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-2.5 text-sm align-middle', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

// --- DataTable props 및 정렬 아이콘
interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  rowKey: (row: TData) => string | number;
  /** false면 체크박스 컬럼 미표시 (멤버/모델 테이블 등) */
  selectable?: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (index: number) => void;
  onToggleSelectAll: () => void;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const SortIcon = ({
  columnId,
  sortBy,
  sortOrder,
}: {
  columnId: string;
  sortBy: string | null | undefined;
  sortOrder: 'asc' | 'desc' | undefined;
}) => {
  if (sortBy !== columnId) return <ArrowUpDown className='w-3 h-3' />;
  return sortOrder === 'asc' ? (
    <ArrowUp className='w-3 h-3' />
  ) : (
    <ArrowDown className='w-3 h-3' />
  );
};

// --- DataTable 메인 컴포넌트 (체크박스 컬럼 + useReactTable + 렌더)
function DataTable<TData>({
  data,
  columns,
  rowKey,
  selectable = true,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sortBy = null,
  sortOrder = 'asc',
  onSort,
  onRowClick,
  isLoading = false,
  isError = false,
  errorMessage = '데이터를 불러오는데 실패했습니다.',
}: DataTableProps<TData>) {
  const allSelected = data.length > 0 && selectedIds.size === data.length;

  const checkboxColumn: ColumnDef<TData> = {
    id: '__select__',
    header: () => (
      <input
        type='checkbox'
        checked={allSelected}
        onChange={onToggleSelectAll}
        className='w-4 h-4 rounded border-neutral-300 cursor-pointer accent-neutral-800 mt-0.5'
      />
    ),
    cell: ({ row }) => (
      <input
        type='checkbox'
        checked={selectedIds.has(row.index)}
        onChange={() => onToggleSelect(row.index)}
        className='w-4 h-4 rounded border-neutral-300 cursor-pointer accent-neutral-800 mt-0.5'
      />
    ),
    enableSorting: false,
  };

  const tableColumns: ColumnDef<TData>[] = selectable
    ? [checkboxColumn, ...columns]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <div className='min-h-0 flex flex-col'>
      <Table className='table-fixed'>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className='bg-neutral-300/80 border-b border-neutral-200'
            >
              {headerGroup.headers.map((header) => {
                const isCheckbox = header.column.id === '__select__';
                const isSortable =
                  header.column.columnDef.enableSorting === true;

                return (
                  <TableHead
                    key={header.id}
                    style={header.column.columnDef.meta?.style}
                    className={clsx(
                      isCheckbox && 'w-10 px-3 pt-2.5 pb-1.5',
                      !isCheckbox && 'whitespace-nowrap'
                    )}
                  >
                    {isCheckbox ? (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    ) : isSortable ? (
                      <button
                        type='button'
                        onClick={() => onSort?.(header.column.id)}
                        className='flex items-center gap-1 hover:text-neutral-900 transition-colors cursor-pointer'
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <SortIcon
                          columnId={header.column.id}
                          sortBy={sortBy}
                          sortOrder={sortOrder}
                        />
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                );
              })}
            </tr>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <tr>
              <td
                colSpan={tableColumns.length}
                className='px-4 py-10 text-center text-sm text-neutral-500'
              >
                로딩 중...
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td
                colSpan={tableColumns.length}
                className='px-4 py-10 text-center text-sm text-red-500'
              >
                {errorMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              const isSelected = selectedIds.has(row.index);
              return (
                <TableRow
                  key={rowKey(row.original)}
                  onClick={() => onRowClick?.(row.original)}
                  className={clsx(
                    'last:border-b-0 cursor-pointer',
                    isSelected ? 'bg-neutral-100/60' : 'hover:bg-neutral-200/70'
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isCheckbox = cell.column.id === '__select__';
                    return (
                      <TableCell
                        key={cell.id}
                        className={clsx(
                          isCheckbox && 'w-10 px-3 pt-2.5 pb-1.5',
                          !isCheckbox && 'min-w-0 overflow-hidden'
                        )}
                        onClick={
                          isCheckbox ? (e) => e.stopPropagation() : undefined
                        }
                      >
                        <div className='min-w-0 overflow-hidden'>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
