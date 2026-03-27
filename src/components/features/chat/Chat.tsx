import { useEffect } from 'react';
import ChatBubbles from '@/components/features/chat/ChatBubbles';
import { useParams } from 'react-router-dom';
import { currentChatIdAtom } from '@/store/chat/chat';
import { useAtomValue } from 'jotai';
import { useChatDataHandler } from '@/hooks/chat/useChatDataHandler';
import { useChatScrollHandler } from '@/hooks/chat/chatScrollHandler';
import ChatInput from '@/components/features/chat/ChatInput';
import ChatMain from '@/components/features/chat/ChatMain';

const Chat = () => {
  const params = useParams();
  const historyId = useAtomValue(currentChatIdAtom);

  const { handleScroll, scrollContentRef } = useChatScrollHandler();
  const { setChatDataByHistory } = useChatDataHandler();

  useEffect(() => {
    const currentChatId = params?.chatId ? params.chatId : '-1';
    // 중복 로딩 방지
    if (currentChatId !== '-1' && currentChatId !== historyId) {
      setChatDataByHistory(currentChatId);
    }
  }, [params]);

  return (
    <main className='flex flex-col flex-1 min-h-0 bg-white'>
      {!params?.chatId ? (
        <ChatMain />
      ) : (
        <div className='flex flex-col h-full overflow-hidden'>
          <div
            id='chat-scroll-content'
            className='flex-1 overflow-y-auto'
            onScroll={handleScroll}
            ref={scrollContentRef}
          >
            <ChatBubbles />
          </div>
          <ChatInput />
        </div>
      )}
    </main>
  );
};

export default Chat;
