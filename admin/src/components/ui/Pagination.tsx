import { clsx } from 'clsx';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  // 표시할 페이지 번호 계산 (최대 10개)
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 4);
    const end = Math.min(totalPages, start + 9);

    if (end - start < 9) {
      start = Math.max(1, end - 9);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <div className='flex items-center gap-1'>
      {/* 처음 */}
      <button
        type='button'
        onClick={() => !isFirst && onPageChange(1)}
        disabled={isFirst}
        className={clsx(
          'w-8 h-8 flex items-center justify-center rounded transition-colors',
          isFirst
            ? 'text-neutral-300 cursor-not-allowed'
            : 'text-neutral-500 hover:bg-neutral-100 cursor-pointer'
        )}
      >
        <ChevronsLeft className='w-4 h-4' />
      </button>

      {/* 이전 */}
      <button
        type='button'
        onClick={() => !isFirst && onPageChange(currentPage - 1)}
        disabled={isFirst}
        className={clsx(
          'w-8 h-8 flex items-center justify-center rounded transition-colors',
          isFirst
            ? 'text-neutral-300 cursor-not-allowed'
            : 'text-neutral-500 hover:bg-neutral-100 cursor-pointer'
        )}
      >
        <ChevronLeft className='w-4 h-4' />
      </button>

      {/* 페이지 번호 */}
      {pages.map((page) => (
        <button
          key={page}
          type='button'
          onClick={() => onPageChange(page)}
          className={clsx(
            'w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors',
            page === currentPage
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-600 hover:bg-neutral-100 cursor-pointer'
          )}
        >
          {page}
        </button>
      ))}

      {/* 다음 */}
      <button
        type='button'
        onClick={() => !isLast && onPageChange(currentPage + 1)}
        disabled={isLast}
        className={clsx(
          'w-8 h-8 flex items-center justify-center rounded transition-colors',
          isLast
            ? 'text-neutral-300 cursor-not-allowed'
            : 'text-neutral-500 hover:bg-neutral-100 cursor-pointer'
        )}
      >
        <ChevronRight className='w-4 h-4' />
      </button>

      {/* 마지막 */}
      <button
        type='button'
        onClick={() => !isLast && onPageChange(totalPages)}
        disabled={isLast}
        className={clsx(
          'w-8 h-8 flex items-center justify-center rounded transition-colors',
          isLast
            ? 'text-neutral-300 cursor-not-allowed'
            : 'text-neutral-500 hover:bg-neutral-100 cursor-pointer'
        )}
      >
        <ChevronsRight className='w-4 h-4' />
      </button>
    </div>
  );
};

export default Pagination;
