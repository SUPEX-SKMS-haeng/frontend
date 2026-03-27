import { useTranslation } from 'react-i18next';
import ActionBar, { actionBarButtonClasses } from '@/components/ui/ActionBar';

interface PromptActionBarProps {
  totalCount: number;
  selectedCount: number;
  onCreateClick: () => void;
  showCreateButton?: boolean;
}

const PromptActionBar = ({
  totalCount,
  selectedCount,
  onCreateClick,
  showCreateButton = true,
}: PromptActionBarProps) => {
  const { t } = useTranslation();
  return (
    <ActionBar
      totalCount={totalCount}
      selectedCount={selectedCount}
      showTotalPrefix={false}
    >
      {showCreateButton && (
        <button
          type='button'
          onClick={onCreateClick}
          className={actionBarButtonClasses.primary}
        >
          {t('prompt.button.create')}
        </button>
      )}
    </ActionBar>
  );
};

export default PromptActionBar;
