import { Plus, Zap, PanelLeftClose, ShieldCheck } from 'lucide-react';
import ChatHistory from '@/components/layout/chat/ChatHistory';
import UserProfile from '@/components/layout/chat/UserProfile';
import { useChatDataHandler } from '@/hooks/chat/useChatDataHandler';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { initChatData } = useChatDataHandler();
  const navigate = useNavigate();
  const adminSettingsUrl =
    import.meta.env.VITE_ADMIN_SETTINGS_URL ?? 'http://localhost:3001/login';

  const handleNewChat = () => {
    initChatData();
    navigate('/chat');
  };

  // 접힌 상태
  if (!isOpen) {
    return (
      <aside className='flex flex-col h-full w-[64px] bg-white border-r border-neutral-200/60 transition-all duration-300'>
        <div className='flex-shrink-0 px-3 py-5'>
          <div
            onClick={onToggle}
            className='w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center cursor-pointer hover:from-neutral-800 hover:to-neutral-700 transition-all shadow-sm'
          >
            <Zap className='w-5 h-5 text-white' />
          </div>
        </div>
        <div className='px-3 pb-4'>
          <div
            onClick={handleNewChat}
            className='w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all'
          >
            <Plus className='w-5 h-5 text-neutral-600' />
          </div>
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
          <div
            onClick={onToggle}
            className='ml-auto p-2 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors'
          >
            <PanelLeftClose className='w-4 h-4 text-neutral-500' />
          </div>
        </div>
      </div>

      {/* 새 채팅 버튼 */}
      <div className='px-5 pb-4'>
        <div
          onClick={handleNewChat}
          className='w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white text-[14px] font-medium cursor-pointer hover:from-neutral-800 hover:to-neutral-700 transition-all shadow-sm'
        >
          <Plus className='w-4 h-4' />
          <span>새 채팅</span>
        </div>
      </div>

      {/* 중앙: 채팅 히스토리 */}
      <div className='flex-1 overflow-y-auto'>
        <ChatHistory />
      </div>

      {/* 관리자 설정 - 사용자 계정 위로 */}
      <div className='flex-shrink-0 px-5 py-3 border-b border-neutral-200/30'>
        <div
          onClick={() => {
            window.open(adminSettingsUrl, '_blank', 'noopener,noreferrer');
          }}
          className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold text-neutral-800 bg-neutral-100/50 cursor-pointer hover:bg-neutral-200/50 hover:text-neutral-900 transition-all'
        >
          <ShieldCheck className='w-4 h-4 text-neutral-700' />
          <span>관리자 설정</span>
        </div>
      </div>

      {/* 하단: 유저 프로필 */}
      <UserProfile />
    </aside>
  );
};

export default Sidebar;
