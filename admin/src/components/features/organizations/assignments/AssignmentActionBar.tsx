import ActionBar, { actionBarButtonClasses } from '@/components/ui/ActionBar';

interface AssignmentActionBarProps {
  totalCount: number;
  selectedCount: number;
  onAddRemoveClick: () => void;
}

const AssignmentActionBar = ({
  totalCount,
  selectedCount,
  onAddRemoveClick,
}: AssignmentActionBarProps) => {
  return (
    <ActionBar totalCount={totalCount} selectedCount={selectedCount}>
      <button
        type='button'
        onClick={onAddRemoveClick}
        className={actionBarButtonClasses.primary}
      >
        추가/제거
      </button>
    </ActionBar>
  );
};

export default AssignmentActionBar;
