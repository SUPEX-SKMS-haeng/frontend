import { useTranslation } from 'react-i18next';
import type { Prompt } from '@/types/admin/prompt';
import { Modal } from '@/components/ui/Modal';

type PromptDetailModalProps = {
  isOpen: boolean;
  prompt: Prompt | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const PromptDetailModal = ({
  isOpen,
  prompt,
  onClose,
  onEdit,
  onDelete,
}: PromptDetailModalProps) => {
  const { t } = useTranslation();
  if (!isOpen || !prompt) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='5xl'>
      <Modal.Header title={t('prompt.title.detail')} onClose={onClose} />

      {/* 바디 */}
      <Modal.Body className='space-y-4'>
        <DetailRow label={t('prompt.label.agent')} value={prompt.agentName} />
        <DetailRow label={t('prompt.label.type')} value={prompt.promptType} />
        <DetailRow label={t('prompt.label.name')} value={prompt.promptName} />
        <DetailRow
          label={t('prompt.label.description')}
          value={prompt.promptDescription}
        />
        <DetailRow
          label={t('prompt.label.version')}
          value={prompt.promptVersion}
        />
        <DetailRow label={t('common.status.label')} value={prompt.status} />
        <div className='flex items-start'>
          <label className='w-20 shrink-0 pt-0.5 text-sm font-semibold text-neutral-700'>
            {t('prompt.label.content')}
          </label>
          <div className='flex-1 min-w-0'>
            <textarea
              readOnly
              value={prompt.promptContent ?? ''}
              rows={8}
              aria-label={t('prompt.label.content')}
              className='w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 resize-y focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500'
            />
          </div>
        </div>
      </Modal.Body>

      {/* 푸터 */}
      <Modal.Footer>
        <button
          type='button'
          onClick={onEdit}
          className='h-9 px-5 bg-neutral-800 hover:bg-neutral-900 rounded-lg text-sm font-medium text-white transition-colors'
        >
          {t('common.button.edit')}
        </button>
        <button
          type='button'
          onClick={onDelete}
          className='h-9 px-5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium text-white transition-colors'
        >
          {t('common.button.delete')}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className='flex items-start'>
    <label className='w-20 shrink-0 pt-0.5 text-sm font-semibold text-neutral-700'>
      {label}
    </label>
    <div className='flex-1 text-sm text-neutral-900'>{value}</div>
  </div>
);

export default PromptDetailModal;
