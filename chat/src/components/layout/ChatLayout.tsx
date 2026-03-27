import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { ToastContainer } from '@/components/common';
import { useToast } from '@/hooks/useToast';

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toasts, removeToast } = useToast();

  return (
    <div className='flex h-screen w-screen overflow-hidden bg-neutral-50'>
      {/* 좌측 사이드바 */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* 메인 영역 */}
      <div className='flex flex-col flex-1 min-w-0 h-full bg-white'>
        {/* 상단 바 */}
        <TopBar />

        {/* 채팅 메인 */}
        {children}
      </div>

      {/* 토스트 메시지 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ChatLayout;
