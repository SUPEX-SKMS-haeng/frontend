import { useEffect } from 'react';
import ChatBubbles from './ChatBubbles';
import { currentChatIdAtom } from '@/store/chat';
import { useChatDataHandler } from '@/hooks/useChatDataHandler';
import { useAtom } from 'jotai';
import ChatInput from './ChatInput';

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
