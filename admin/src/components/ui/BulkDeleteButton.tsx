import { Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface BulkDeleteButtonProps {
  selectedCount: number;
  onDelete: () => void;
  /** false면 버튼을 렌더하지 않음 (레이아웃 공간도 차지하지 않음) */
  visible?: boolean;
}

const BulkDeleteButton = ({
  selectedCount,
  onDelete,
  visible = true,
}: BulkDeleteButtonProps) => {
  if (!visible) return null;

  return (
    <button
      type='button'
      onClick={onDelete}
      disabled={selectedCount === 0}
      className={clsx(
        'w-9 h-9 flex items-center justify-center rounded-lg border transition-colors',
        selectedCount > 0
          ? 'border-red-200 text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer'
          : 'border-neutral-200 text-neutral-300 cursor-not-allowed'
      )}
      title={selectedCount > 0 ? `${selectedCount}개 삭제` : '삭제'}
    >
      <Trash2 className='w-4 h-4' />
    </button>
  );
};

export default BulkDeleteButton;
