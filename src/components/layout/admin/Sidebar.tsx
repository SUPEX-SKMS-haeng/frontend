import { Zap, PanelLeftClose } from 'lucide-react';
import Menus from '@/components/layout/admin/Menus';
import UserProfile from '@/components/layout/admin/UserProfile';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  // 접힌 상태
  if (!isOpen) {
    return (
      <aside className='flex flex-col h-full w-[64px] bg-white border-r border-neutral-200/60 transition-all duration-300'>
        <div className='flex-shrink-0 px-3 py-5'>
          <button
            type='button'
            aria-label='사이드바 열기'
            onClick={onToggle}
            className='w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center hover:from-neutral-800 hover:to-neutral-700 transition-all shadow-sm'
          >
            <Zap className='w-5 h-5 text-white' />
          </button>
        </div>
      </aside>
    );
  }

  // 펼친 상태
  return (
    <aside className='flex flex-col h-full w-[300px] bg-neutral-50/30 border-r border-neutral-200/40 transition-all duration-300'>
      {/* 상단: 로고 */}
      <div className='flex-shrink-0 px-5 py-5'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center shadow-sm'>
            <Zap className='w-5 h-5 text-white' />
          </div>
          <span className='text-[18px] font-semibold text-neutral-900 tracking-tight'>
            LLM Gateway
          </span>
          <button
            type='button'
            aria-label='사이드바 닫기'
            onClick={onToggle}
            className='ml-auto p-2 rounded-lg hover:bg-neutral-100 transition-colors'
          >
            <PanelLeftClose className='w-4 h-4 text-neutral-500' />
          </button>
        </div>
      </div>

      {/* 메뉴 영역 */}
      <Menus />

      {/* 하단: 유저 프로필 */}
      <UserProfile />
    </aside>
  );
};

export default Sidebar;
