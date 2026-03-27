import ActionBar, { actionBarButtonClasses } from '@/components/ui/ActionBar';

interface DeploymentActionBarProps {
  totalCount: number;
  selectedCount: number;
  onCreateClick: () => void;
  showCreateButton?: boolean;
}

const DeploymentActionBar = ({
  totalCount,
  selectedCount,
  onCreateClick,
  showCreateButton = true,
}: DeploymentActionBarProps) => {
  return (
    <ActionBar totalCount={totalCount} selectedCount={selectedCount}>
      {showCreateButton && (
        <button
          type='button'
          onClick={onCreateClick}
          className={actionBarButtonClasses.primary}
        >
          모델 등록
        </button>
      )}
    </ActionBar>
  );
};

export default DeploymentActionBar;
