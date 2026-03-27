import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Prompt, CreatePromptForm, EditPromptForm } from '@/types/prompt';
import { Modal } from '@/components/ui/Modal';

type PromptFormModalProps =
  | {
      mode: 'create';
      isOpen: boolean;
      promptTypes: string[];
      onClose: () => void;
      onSave: (data: CreatePromptForm) => void;
    }
  | {
      mode: 'edit';
      isOpen: boolean;
      prompt: Prompt | null;
      promptTypes: string[];
      onClose: () => void;
      onSave: (data: EditPromptForm) => void;
    };

const initialCreateForm: CreatePromptForm = {
  agentName: '',
  promptType: '',
  promptVersion: '',
  promptContent: '',
  promptName: '',
  promptDescription: '',
  isActive: true,
};

const PromptFormModal = (props: PromptFormModalProps) => {
  const { t } = useTranslation();
  const { mode, isOpen, onClose, onSave } = props;
  const promptTypes = props.promptTypes;
  const editingPrompt = mode === 'edit' ? props.prompt : null;
  const [form, setForm] = useState<CreatePromptForm | EditPromptForm>(() => {
    if (editingPrompt) {
      return {
        ...editingPrompt,
        isActive: editingPrompt.status === '활성',
      } as EditPromptForm;
    }
    return initialCreateForm;
  });

  // 변경 감지용 초기 상태
  const [initialFormState, setInitialFormState] = useState<
    CreatePromptForm | EditPromptForm
  >(form);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setForm(initialCreateForm);
        setInitialFormState(initialCreateForm);
      } else if (mode === 'edit' && editingPrompt) {
        const editForm: EditPromptForm = {
          ...editingPrompt,
          isActive: editingPrompt.status === '활성',
        };
        setForm(editForm);
        setInitialFormState(editForm);
      }
    }
  }, [isOpen, mode, editingPrompt]);

  if (!isOpen) return null;
  if (mode === 'edit' && !editingPrompt) return null;

  const isFormChanged =
    JSON.stringify(form) !== JSON.stringify(initialFormState);

  const updateField = <K extends keyof (CreatePromptForm | EditPromptForm)>(
    key: K,
    value: (CreatePromptForm | EditPromptForm)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!isFormChanged) return; // 변경사항 없으면 무시

    if (!form.agentName.trim()) {
      alert(t('prompt.validation.agentRequired'));
      return;
    }
    if (!form.promptType.trim()) {
      alert(t('prompt.validation.typeRequired'));
      return;
    }
    if (!form.promptName.trim()) {
      alert(t('prompt.validation.nameRequired'));
      return;
    }
    if (!form.promptVersion.trim()) {
      alert(t('prompt.validation.versionRequired'));
      return;
    }
    onSave(form as CreatePromptForm & EditPromptForm);
  };

  const title =
    mode === 'create' ? t('prompt.title.create') : t('prompt.title.edit');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='5xl'>
      <Modal.Header title={title} onClose={onClose} />

      {/* 바디 */}
      <Modal.Body className='space-y-5'>
        <FormRow label={t('prompt.label.agent')} required>
          <input
            type='text'
            value={form.agentName ?? ''}
            onChange={(e) => updateField('agentName', e.target.value)}
            placeholder={t('prompt.placeholder.agent')}
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
          />
        </FormRow>

        <FormRow label={t('prompt.label.type')} required>
          <select
            value={form.promptType ?? ''}
            onChange={(e) => updateField('promptType', e.target.value)}
            aria-label={t('prompt.label.type')}
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors bg-white'
          >
            <option value=''>{t('prompt.placeholder.typeSelect')}</option>
            {promptTypes.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow label={t('prompt.label.name')} required>
          <input
            type='text'
            value={form.promptName ?? ''}
            onChange={(e) => updateField('promptName', e.target.value)}
            placeholder={t('prompt.placeholder.name')}
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
          />
        </FormRow>

        <FormRow label={t('prompt.label.description')}>
          <input
            type='text'
            value={form.promptDescription ?? ''}
            onChange={(e) => updateField('promptDescription', e.target.value)}
            placeholder={t('prompt.placeholder.description')}
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
          />
        </FormRow>

        <FormRow label={t('prompt.label.version')} required>
          <input
            type='text'
            value={form.promptVersion ?? ''}
            onChange={(e) => updateField('promptVersion', e.target.value)}
            placeholder={t('prompt.placeholder.version')}
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
          />
        </FormRow>

        <FormRow label={t('common.status.activeLabel')}>
          <div className='flex items-center h-10'>
            <button
              type='button'
              title={t('common.status.activeLabel')}
              onClick={() => updateField('isActive', !form.isActive)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                form.isActive ? 'bg-neutral-800' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  form.isActive ? 'translate-x-5' : ''
                }`}
              />
            </button>
            <span className='ml-2 text-sm text-neutral-600'>
              {form.isActive
                ? t('common.status.active')
                : t('common.status.inactive')}
            </span>
          </div>
        </FormRow>

        <FormRow label={t('prompt.label.content')}>
          <textarea
            value={form.promptContent ?? ''}
            onChange={(e) => updateField('promptContent', e.target.value)}
            placeholder={t('prompt.placeholder.content')}
            rows={8}
            className='w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors resize-none'
          />
        </FormRow>
      </Modal.Body>

      {/* 푸터 */}
      <Modal.Footer>
        <button
          type='button'
          onClick={onClose}
          className='h-9 px-5 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors'
        >
          {t('common.button.cancel')}
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
          {t('common.button.save')}
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

export default PromptFormModal;
