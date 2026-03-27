import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Deployment } from '@/types/admin/deployment';
import { Modal } from '@/components/ui/Modal';

interface DeploymentDetailModalProps {
  isOpen: boolean;
  deployment: Deployment | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showEditDelete?: boolean;
}

const DeploymentDetailModal = ({
  isOpen,
  deployment,
  onClose,
  onEdit,
  onDelete,
  showEditDelete = true, // 추후 권한에 따라 제어
}: DeploymentDetailModalProps) => {
  const [showAccessKey, setShowAccessKey] = useState(false);

  if (!isOpen || !deployment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <Modal.Header title='모델 상세' onClose={onClose} />

      <Modal.Body className='space-y-4'>
        <DetailRow label='Provider' value={deployment.provider} />
        <DetailRow label='Model' value={deployment.model} />
        <DetailRow label='Version' value={deployment.version} />
        <DetailRow label='Deployment Name' value={deployment.deploymentName} />
        <DetailRow label='Endpoint' value={deployment.endpoint} />
        {/* Access Key는 마스킹 토글이 필요해 DetailRow 대신 직접 렌더링 */}
        <div className='flex items-start'>
          <label className='w-24 shrink-0 pt-0.5 text-sm font-semibold text-neutral-700'>
            Access Key
          </label>
          <div className='flex-1 flex items-center gap-2 text-sm text-neutral-900 break-all'>
            <span>{showAccessKey ? deployment.accessKey : '******'}</span>
            <button
              type='button'
              onClick={() => setShowAccessKey(!showAccessKey)}
              className='text-neutral-400 hover:text-neutral-600 focus:outline-none p-1'
            >
              {showAccessKey ? (
                <EyeOff className='w-4 h-4' />
              ) : (
                <Eye className='w-4 h-4' />
              )}
            </button>
          </div>
        </div>
        <DetailRow label='상태' value={deployment.status} />
        <DetailRow label='생성일시' value={deployment.createdAt} />
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
    <label className='w-24 shrink-0 pt-0.5 text-sm font-semibold text-neutral-700'>
      {label}
    </label>
    <div className='flex-1 text-sm text-neutral-900 break-all'>{value}</div>
  </div>
);

export default DeploymentDetailModal;
