import ActionBar, { actionBarButtonClasses } from '@/components/ui/ActionBar';

interface OrganizationActionBarProps {
  totalCount: number;
  selectedCount: number;
  onCreateClick: () => void;
  onEditClick: () => void;
  canEdit: boolean;
  canCreate: boolean;
}

const OrganizationActionBar = ({
  totalCount,
  selectedCount,
  onCreateClick,
  onEditClick,
  canEdit,
  canCreate,
}: OrganizationActionBarProps) => {
  return (
    <ActionBar totalCount={totalCount} selectedCount={selectedCount}>
      {canCreate && (
        <button
          type='button'
          onClick={onCreateClick}
          className={actionBarButtonClasses.primary}
        >
          생성
        </button>
      )}
      <button
        type='button'
        onClick={onEditClick}
        disabled={!canEdit}
        className={
          canEdit
            ? actionBarButtonClasses.primary
            : actionBarButtonClasses.disabled
        }
      >
        수정
      </button>
    </ActionBar>
  );
};

export default OrganizationActionBar;
