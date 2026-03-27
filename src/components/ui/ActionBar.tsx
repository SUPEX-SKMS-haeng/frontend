import { type ReactNode } from 'react';

/** ActionBar 우측 버튼용 공통 스타일 (래퍼에서 버튼에 적용) */
export const actionBarButtonClasses = {
  primary:
    'h-8 px-4 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors',
  secondary:
    'h-8 px-4 text-sm font-medium text-white bg-neutral-800 border border-neutral-800 rounded-lg hover:bg-neutral-900 transition-colors',
  disabled:
    'h-8 px-4 text-sm font-medium text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-lg cursor-not-allowed transition-colors',
} as const;

export interface ActionBarProps {
  totalCount: number;
  selectedCount: number;
  /** true면 좌측 건수에 "총" 접두사 표시 (기본 true) */
  showTotalPrefix?: boolean;
  /** 우측 버튼 영역 */
  children: ReactNode;
}

const ActionBar = ({
  totalCount,
  selectedCount,
  showTotalPrefix = true,
  children,
}: ActionBarProps) => {
  const countLabel = showTotalPrefix ? `총 ${totalCount}건` : `${totalCount}건`;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-1 text-sm text-neutral-600'>
        <span className='font-semibold text-neutral-900'>{countLabel}</span>
        <span className='text-neutral-400'>|</span>
        <span className='font-semibold text-neutral-900'>
          {selectedCount}건
        </span>
      </div>
      <div className='flex items-center gap-2'>{children}</div>
    </div>
  );
};

export default ActionBar;
