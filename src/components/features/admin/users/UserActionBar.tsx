import ActionBar, { actionBarButtonClasses } from '@/components/ui/ActionBar';

interface UserActionBarProps {
  totalCount: number;
  selectedCount: number;
  onCreateClick: () => void;
  showCreateButton?: boolean;
}

const UserActionBar = ({
  totalCount,
  selectedCount,
  onCreateClick,
  showCreateButton = true,
}: UserActionBarProps) => {
  return (
    <ActionBar totalCount={totalCount} selectedCount={selectedCount}>
      {showCreateButton && (
        <button
          type='button'
          onClick={onCreateClick}
          className={actionBarButtonClasses.primary}
        >
          사용자 등록
        </button>
      )}
    </ActionBar>
  );
};

export default UserActionBar;
