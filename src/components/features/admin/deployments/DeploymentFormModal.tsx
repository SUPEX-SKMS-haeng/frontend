import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '@/components/ui/Modal';
import type {
  Deployment,
  CreateDeploymentForm,
  EditDeploymentForm,
} from '@/types/admin/deployment';
import { Select } from '@/components/ui/Select';
import { providerOptions } from '@/data/mockDeployments';

type DeploymentFormModalProps =
  | {
      mode: 'create';
      isOpen: boolean;
      onClose: () => void;
      onSave: (data: CreateDeploymentForm) => void;
    }
  | {
      mode: 'edit';
      isOpen: boolean;
      deployment: Deployment | null;
      onClose: () => void;
      onSave: (data: EditDeploymentForm) => void;
    };

const initialCreateForm: CreateDeploymentForm = {
  provider: providerOptions[0],
  model: '',
  version: '',
  deploymentName: '',
  endpoint: '',
  accessKey: '',
  isActive: true,
};

const DeploymentFormModal = (props: DeploymentFormModalProps) => {
  const { mode, isOpen, onClose, onSave } = props;
  const editingDeployment = mode === 'edit' ? props.deployment : null;

  const [form, setForm] = useState<CreateDeploymentForm | EditDeploymentForm>(
    () => {
      if (editingDeployment) {
        return {
          id: editingDeployment.id,
          provider: editingDeployment.provider,
          model: editingDeployment.model,
          version: editingDeployment.version,
          deploymentName: editingDeployment.deploymentName,
          endpoint: editingDeployment.endpoint,
          accessKey: editingDeployment.accessKey,
          isActive: editingDeployment.status === '활성',
        };
      }
      return initialCreateForm;
    }
  );

  // 변경 감지용 초기 상태 및 마스킹 상태
  const [initialFormState, setInitialFormState] = useState<
    CreateDeploymentForm | EditDeploymentForm
  >(form);
  const [showAccessKey, setShowAccessKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setForm(initialCreateForm);
        setInitialFormState(initialCreateForm);
      } else if (mode === 'edit' && editingDeployment) {
        const editFormState = {
          id: editingDeployment.id,
          provider: editingDeployment.provider,
          model: editingDeployment.model,
          version: editingDeployment.version,
          deploymentName: editingDeployment.deploymentName,
          endpoint: editingDeployment.endpoint,
          accessKey: editingDeployment.accessKey,
          isActive: editingDeployment.status === '활성',
        };
        setForm(editFormState);
        setInitialFormState(editFormState);
      }
      setShowAccessKey(false);
    }
  }, [isOpen, mode, editingDeployment]);

  if (!isOpen) return null;
  if (mode === 'edit' && !editingDeployment) return null;

  const updateField = <
    K extends keyof (CreateDeploymentForm | EditDeploymentForm),
  >(
    key: K,
    value: (CreateDeploymentForm | EditDeploymentForm)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormChanged =
    JSON.stringify(form) !== JSON.stringify(initialFormState);

  const handleSave = () => {
    if (!isFormChanged) return; // 변경사항 없으면 스킵

    const f = form as EditDeploymentForm; // 타입 체킹을 위해 공통 분모 허용
    if (!f.provider.trim() && mode === 'create') {
      alert('Provider(제공자)를 입력해주세요.');
      return;
    }
    if (!f.model.trim()) {
      alert('모델 유형을 입력해주세요.');
      return;
    }
    if (!f.version.trim()) {
      alert('버전을 입력해주세요.');
      return;
    }
    if (!f.deploymentName.trim()) {
      alert('배포명을 입력해주세요.');
      return;
    }
    if (!f.endpoint?.trim()) {
      alert('Endpoint를 입력해주세요.');
      return;
    }
    if (!f.accessKey?.trim()) {
      alert('Access Key를 입력해주세요.');
      return;
    }

    if (mode === 'create') {
      onSave(form as CreateDeploymentForm);
    } else {
      onSave(form as EditDeploymentForm);
    }
  };

  const title = mode === 'create' ? '모델 추가' : '모델 수정';
  const isEdit = mode === 'edit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <Modal.Header title={title} onClose={onClose} />

      <Modal.Body className='space-y-4'>
        <FormRow label='Provider' required={!isEdit}>
          {isEdit ? (
            <input
              type='text'
              value={form.provider}
              disabled
              className='h-10 w-full px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 cursor-not-allowed'
            />
          ) : (
            <Select
              size='lg'
              value={form.provider}
              onChange={(e) => updateField('provider', e.target.value)}
              className='w-full'
            >
              {providerOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          )}
        </FormRow>

        <FormRow label='Model' required={!isEdit}>
          <input
            type='text'
            value={form.model}
            onChange={(e) => updateField('model', e.target.value)}
            disabled={isEdit}
            placeholder='Model (예: gpt-4o)'
            className={clsx(
              'h-10 w-full px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500',
              isEdit
                ? 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed'
                : 'border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
            )}
          />
        </FormRow>

        <FormRow label='Version' required={!isEdit}>
          <input
            type='text'
            value={form.version}
            onChange={(e) => updateField('version', e.target.value)}
            disabled={isEdit}
            placeholder='Version (예: 2024-05-13)'
            className={clsx(
              'h-10 w-full px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500',
              isEdit
                ? 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed'
                : 'border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
            )}
          />
        </FormRow>

        <FormRow label='Deployment Name' required>
          <input
            type='text'
            value={form.deploymentName}
            onChange={(e) => updateField('deploymentName', e.target.value)}
            placeholder='Deployment Name (예: gpt-4o-default)'
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
          />
        </FormRow>

        <FormRow label='Endpoint' required>
          <input
            type='text'
            value={form.endpoint}
            onChange={(e) => updateField('endpoint', e.target.value)}
            placeholder='Endpoint (예: https://api.openai.com/v1)'
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
          />
        </FormRow>

        <FormRow label='Access Key' required>
          <div className='relative'>
            <input
              type={showAccessKey ? 'text' : 'password'}
              value={form.accessKey}
              onChange={(e) => updateField('accessKey', e.target.value)}
              placeholder='Access Key'
              className='h-10 w-full px-3 pr-10 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
            />
            <button
              type='button'
              onClick={() => setShowAccessKey(!showAccessKey)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none'
            >
              {showAccessKey ? (
                <EyeOff className='w-4 h-4' />
              ) : (
                <Eye className='w-4 h-4' />
              )}
            </button>
          </div>
        </FormRow>

        <FormRow label='활성화'>
          <div className='flex items-center h-10'>
            <button
              type='button'
              onClick={() => updateField('isActive', !form.isActive)}
              className={clsx(
                'relative w-10 h-5 rounded-full transition-colors duration-200',
                form.isActive ? 'bg-neutral-800' : 'bg-neutral-300'
              )}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',
                  form.isActive && 'translate-x-5'
                )}
              />
            </button>
          </div>
        </FormRow>
      </Modal.Body>

      <Modal.Footer>
        <button
          type='button'
          onClick={onClose}
          className='h-9 px-5 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors'
        >
          취소
        </button>
        <button
          type='button'
          onClick={handleSave}
          disabled={!isFormChanged}
          className={clsx(
            'h-9 px-5 rounded-lg text-sm font-medium transition-colors',
            isFormChanged
              ? 'bg-neutral-800 hover:bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          )}
        >
          저장
        </button>
      </Modal.Footer>
    </Modal>
  );
};

/* ─── 폼 행 레이아웃 헬퍼 ─── */
interface FormRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormRow = ({ label, required, children }: FormRowProps) => (
  <div className='flex items-start'>
    <label className='w-32 shrink-0 pt-2.5 text-sm font-semibold text-neutral-700'>
      {label}
      {required && <span className='text-red-500 ml-0.5'>*</span>}
    </label>
    <div className='flex-1'>{children}</div>
  </div>
);

export default DeploymentFormModal;
