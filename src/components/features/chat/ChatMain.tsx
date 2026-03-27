import { useEffect } from 'react';
import ChatBubbles from '@/components/features/chat/ChatBubbles';
import { currentChatIdAtom } from '@/store/chat/chat';
import { useChatDataHandler } from '@/hooks/chat/useChatDataHandler';
import { useAtom } from 'jotai';
import ChatInput from '@/components/features/chat/ChatInput';

const ChatMain = () => {
  const [, setCurrentChatId] = useAtom(currentChatIdAtom);
  const { initChatData } = useChatDataHandler();

  useEffect(() => {
    setCurrentChatId('-1');
    initChatData();
  }, []);

  return (
    <main className='flex flex-col flex-1 min-h-0 bg-white'>
      <ChatBubbles />
      <ChatInput />
    </main>
  );
};

export default ChatMain;
