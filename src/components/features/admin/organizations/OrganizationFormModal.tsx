import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Modal } from '@/components/ui/Modal';
import type {
  Organization,
  CreateOrganizationForm,
  EditOrganizationForm,
} from '@/types/admin/organization';

type OrganizationFormModalProps =
  | {
      mode: 'create';
      isOpen: boolean;
      onClose: () => void;
      onSave: (data: CreateOrganizationForm) => void;
    }
  | {
      mode: 'edit';
      isOpen: boolean;
      organization: Organization | null;
      onClose: () => void;
      onSave: (data: EditOrganizationForm) => void;
    };

const initialCreateForm: CreateOrganizationForm = {
  name: '',
  description: '',
  isActive: true,
};

const OrganizationFormModal = (props: OrganizationFormModalProps) => {
  const { mode, isOpen, onClose, onSave } = props;
  const editingOrganization = mode === 'edit' ? props.organization : null;

  const [form, setForm] = useState<
    CreateOrganizationForm | EditOrganizationForm
  >(() => {
    if (editingOrganization) {
      return {
        id: editingOrganization.id,
        name: editingOrganization.name,
        description: editingOrganization.description,
        isActive: editingOrganization.status === '활성',
      };
    }
    return initialCreateForm;
  });

  const [initialFormState, setInitialFormState] = useState<
    CreateOrganizationForm | EditOrganizationForm
  >(form);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setForm(initialCreateForm);
        setInitialFormState(initialCreateForm);
      } else if (mode === 'edit' && editingOrganization) {
        const editFormState = {
          id: editingOrganization.id,
          name: editingOrganization.name,
          description: editingOrganization.description,
          isActive: editingOrganization.status === '활성',
        };
        setForm(editFormState);
        setInitialFormState(editFormState);
      }
    }
  }, [isOpen, mode, editingOrganization]);

  if (!isOpen) return null;
  if (mode === 'edit' && !editingOrganization) return null;

  const isFormChanged =
    JSON.stringify(form) !== JSON.stringify(initialFormState);

  const updateField = <
    K extends keyof (CreateOrganizationForm | EditOrganizationForm),
  >(
    key: K,
    value: (CreateOrganizationForm | EditOrganizationForm)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!isFormChanged) return; // 변경사항 없으면 무시

    if (!form.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    onSave(form as CreateOrganizationForm & EditOrganizationForm);
  };

  const title = mode === 'create' ? '그룹 생성' : '그룹 수정';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <Modal.Header title={title} onClose={onClose} />

      <Modal.Body className='space-y-5'>
        <FormRow label='이름' required>
          <input
            type='text'
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder='그룹 이름'
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
          />
        </FormRow>

        <FormRow label='설명'>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder='설명 (선택)'
            rows={3}
            className='w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors resize-none'
          />
        </FormRow>

        <FormRow label='상태'>
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
            <span className='ml-2 text-sm text-neutral-600'>
              {form.isActive ? '활성' : '비활성'}
            </span>
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

interface FormRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormRow = ({ label, required, children }: FormRowProps) => (
  <div className='flex items-start'>
    <label className='w-[4.5rem] shrink-0 pt-2.5 text-sm font-semibold text-neutral-700'>
      {label}
      {required && <span className='text-red-500 ml-0.5'>*</span>}
    </label>
    <div className='flex-1'>{children}</div>
  </div>
);

export default OrganizationFormModal;
