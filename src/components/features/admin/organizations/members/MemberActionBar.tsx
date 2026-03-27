import ActionBar, { actionBarButtonClasses } from '@/components/ui/ActionBar';

interface MemberActionBarProps {
  totalCount: number;
  selectedCount: number;
  isRoleEditMode: boolean;
  onRoleEditStart: () => void;
  onRoleEditCancel: () => void;
  onRoleEditSave: () => void;
  onAddRemoveClick: () => void;
}

const MemberActionBar = ({
  totalCount,
  selectedCount,
  isRoleEditMode,
  onRoleEditStart,
  onRoleEditCancel,
  onRoleEditSave,
  onAddRemoveClick,
}: MemberActionBarProps) => {
  return (
    <ActionBar totalCount={totalCount} selectedCount={selectedCount}>
      {isRoleEditMode ? (
        <>
          <button
            type='button'
            onClick={onRoleEditCancel}
            className={actionBarButtonClasses.primary}
          >
            취소
          </button>
          <button
            type='button'
            onClick={onRoleEditSave}
            className={actionBarButtonClasses.secondary}
          >
            저장
          </button>
        </>
      ) : (
        <>
          <button
            type='button'
            onClick={onRoleEditStart}
            className={actionBarButtonClasses.primary}
          >
            권한 편집
          </button>
          <button
            type='button'
            onClick={onAddRemoveClick}
            className={actionBarButtonClasses.primary}
          >
            추가/제거
          </button>
        </>
      )}
    </ActionBar>
  );
};

export default MemberActionBar;
