/**
 * UserFormModal
 *
 * 사용자 등록(생성)과 수정을 하나의 컴포넌트로 처리합니다.
 * mode에 따라 필드 편집 가능 여부와 필수 항목이 달라집니다.
 *
 * - create: ID(loginId), 이름, 회사, 권한, 활성화 모두 편집 가능. ID·이름·회사·권한 필수.
 * - edit: ID·회사는 읽기 전용. 이름·권한·활성화만 편집 가능. 이름·권한 필수.
 */

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { User, SystemRole, CreateUserForm, EditUserForm } from '@/types/user';
import { companyOptions } from '@/data/mockUsers';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

/* ─── 공통 상수 ─── */

const roleOptions: { value: SystemRole; label: string }[] = [
  { value: 'Common', label: 'Common' },
  { value: 'Admin', label: 'Admin' },
  { value: 'SuperAdmin', label: 'Superadmin' },
];

/* ─── Props (create | edit 모드에 따라 구분) ─── */
type UserFormModalProps =
  | {
      mode: 'create';
      isOpen: boolean;
      onClose: () => void;
      onSave: (data: CreateUserForm) => void;
    }
  | {
      mode: 'edit';
      isOpen: boolean;
      user: User | null;
      onClose: () => void;
      onSave: (data: EditUserForm) => void;
    };

const initialCreateForm: CreateUserForm = {
  loginId: '',
  name: '',
  company: companyOptions[0],
  role: 'Common',
  isActive: true,
};

const UserFormModal = (props: UserFormModalProps) => {
  const { mode, isOpen, onClose, onSave } = props;
  const editingUser = mode === 'edit' ? props.user : null;

  // create/edit 공통 필드만 사용하는 폼 상태 (조건부 마운트 시 edit 모드는 초기값을 바로 사용하여 깜빡임 방지)
  const [form, setForm] = useState<CreateUserForm | EditUserForm>(() => {
    if (editingUser) {
      return {
        loginId: editingUser.loginId,
        name: editingUser.name,
        company: editingUser.company,
        role: editingUser.role,
        isActive: editingUser.status === '활성',
      };
    }
    return initialCreateForm;
  });

  // 변경 감지용 초기 상태
  const [initialFormState, setInitialFormState] = useState<
    CreateUserForm | EditUserForm
  >(form);

  // 모달 오픈 시 폼 초기화
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setForm(initialCreateForm);
        setInitialFormState(initialCreateForm);
      } else if (mode === 'edit' && editingUser) {
        const editFormState = {
          loginId: editingUser.loginId,
          name: editingUser.name,
          company: editingUser.company,
          role: editingUser.role,
          isActive: editingUser.status === '활성',
        };
        setForm(editFormState);
        setInitialFormState(editFormState);
      }
    }
  }, [isOpen, mode, editingUser]);

  if (!isOpen) return null;
  if (mode === 'edit' && !editingUser) return null;

  const isFormChanged =
    JSON.stringify(form) !== JSON.stringify(initialFormState);

  const updateField = <K extends keyof (CreateUserForm | EditUserForm)>(
    key: K,
    value: (CreateUserForm | EditUserForm)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!isFormChanged) return; // 변경사항 없으면 무시

    if (mode === 'create') {
      const f = form as CreateUserForm;
      if (!f.loginId.trim() || !f.name.trim() || !f.company || !f.role) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
      }
      onSave(f);
    } else {
      const f = form as EditUserForm;
      if (!f.name.trim()) {
        alert('이름을 입력해주세요.');
        return;
      }
      if (!f.role) {
        alert('권한을 선택해주세요.');
        return;
      }
      onSave(f);
    }
  };

  const title = mode === 'create' ? '사용자 등록' : '사용자 수정';
  const isEdit = mode === 'edit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <Modal.Header title={title} onClose={onClose} />

      <Modal.Body className='space-y-5'>
        {/* ID: create는 입력, edit는 읽기 전용 */}
        {isEdit ? (
          <FormRow label='ID'>
            <input
              type='text'
              value={(form as EditUserForm).loginId}
              disabled
              className='h-10 w-full px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 cursor-not-allowed'
            />
          </FormRow>
        ) : (
          <FormRow label='ID' required>
            <input
              type='text'
              value={(form as CreateUserForm).loginId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, loginId: e.target.value }))
              }
              placeholder='아이디'
              className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
            />
          </FormRow>
        )}

        {/* 이름: 둘 다 필수, 편집 가능 */}
        <FormRow label='이름' required>
          <input
            type='text'
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder='이름'
            className='h-10 w-full px-3 rounded-lg border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
          />
        </FormRow>

        {/* 회사: create는 셀렉트, edit는 읽기 전용 */}
        {isEdit ? (
          <FormRow label='회사'>
            <input
              type='text'
              value={form.company}
              disabled
              className='h-10 w-full px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 cursor-not-allowed'
            />
          </FormRow>
        ) : (
          <FormRow label='회사' required>
            <Select
              size='lg'
              value={form.company}
              onChange={(e) => updateField('company', e.target.value)}
              className='w-full'
            >
              {companyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </FormRow>
        )}

        {/* 권한: create/edit 공통 표시, Admin은 비활성화 */}
        <FormRow label='권한' required>
          <div className='flex items-center gap-6 h-10'>
            {roleOptions.map((opt) => {
              const isAdminDisabled = opt.value === 'Admin';
              return (
                <label
                  key={opt.value}
                  className={clsx(
                    'flex items-center gap-2',
                    isAdminDisabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer'
                  )}
                >
                  <input
                    type='radio'
                    name='role'
                    value={opt.value}
                    checked={form.role === opt.value}
                    onChange={() => updateField('role', opt.value)}
                    disabled={isAdminDisabled}
                    className='w-4 h-4 accent-neutral-800'
                  />
                  <span className='text-sm text-neutral-700'>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </FormRow>

        {/* 활성화: 둘 다 토글 (선택 사항) */}
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

/* ─── 폼 행 레이아웃 헬퍼 (라벨 + 필수 표시 + 입력 영역) ─── */
interface FormRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormRow = ({ label, required, children }: FormRowProps) => (
  <div className='flex items-start'>
    <label className='w-20 shrink-0 pt-2.5 text-sm font-semibold text-neutral-700'>
      {label}
      {required && <span className='text-red-500 ml-0.5'>*</span>}
    </label>
    <div className='flex-1'>{children}</div>
  </div>
);

export default UserFormModal;
