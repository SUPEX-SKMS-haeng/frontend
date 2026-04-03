import AgentSelector from './AgentSelector';
import ModelSelector from './ModelSelector';
import GroupSelector from './GroupSelector';

interface TopBarProps {
  onGroupChange?: () => void;
}

const TopBar = ({ onGroupChange }: TopBarProps) => {
  return (
    <header className='flex-shrink-0 flex items-center justify-between h-14 px-6 bg-neutral-50/30 backdrop-blur-sm border-b border-neutral-200/40'>
      <div className='flex items-center gap-2'>
        <AgentSelector />
        <div className='w-px h-5 bg-neutral-200/60' />
        <ModelSelector />
      </div>
      <GroupSelector onGroupChange={onGroupChange} />
    </header>
  );
};

export default TopBar;
