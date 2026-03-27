import { ShieldCheck } from 'lucide-react';
import type { User } from '@/types/admin/user';
import { Modal } from '@/components/ui/Modal';

interface UserDetailModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showEditDelete?: boolean;
}

const UserDetailModal = ({
  isOpen,
  user,
  onClose,
  onEdit,
  onDelete,
  showEditDelete = true,
}: UserDetailModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <Modal.Header title='사용자' onClose={onClose} />

      <Modal.Body className='space-y-4'>
        <DetailRow label='ID' value={user.loginId} />
        <div className='flex items-start'>
          <label className='w-20 shrink-0 pt-0.5 text-sm font-semibold text-neutral-700'>
            이름
          </label>
          <div className='flex-1 flex items-center gap-1.5 text-sm text-neutral-900'>
            {user.name}
            {user.role === 'SuperAdmin' && (
              <span title=':superadmin:' className='inline-flex items-center'>
                <ShieldCheck className='w-4 h-4 text-violet-500 shrink-0' />
              </span>
            )}
          </div>
        </div>
        <DetailRow label='회사' value={user.company} />
        <DetailRow label='상태' value={user.status} />
        <DetailRow label='접속일시' value={user.lastAccessAt || '-'} />
      </Modal.Body>

      {showEditDelete && (
        <Modal.Footer>
          <button
            type='button'
            onClick={onEdit}
            className='h-9 px-5 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors'
          >
            수정
          </button>
          <button
            type='button'
            onClick={onDelete}
            className='h-9 px-5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium text-white transition-colors'
          >
            삭제
          </button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

/* ─── 상세 행 레이아웃 헬퍼 ─── */
interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className='flex items-start'>
    <label className='w-20 shrink-0 pt-0.5 text-sm font-semibold text-neutral-700'>
      {label}
    </label>
    <div className='flex-1 text-sm text-neutral-900'>{value}</div>
  </div>
);

export default UserDetailModal;
