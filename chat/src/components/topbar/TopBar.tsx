import ModelSelector from './ModelSelector';
import GroupSelector from './GroupSelector';

interface TopBarProps {
  onGroupChange?: () => void;
}

const TopBar = ({ onGroupChange }: TopBarProps) => {
  return (
    <header className='flex-shrink-0 flex items-center justify-between h-14 px-6 bg-neutral-50/30 backdrop-blur-sm border-b border-neutral-200/40'>
      <ModelSelector />
      <GroupSelector onGroupChange={onGroupChange} />
    </header>
  );
};

export default TopBar;
