import { useChatScrollHandler } from '@/hooks/chat/chatScrollHandler';
import { chatFamilyAtom, currentChatIdAtom } from '@/store/chat/chat';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import ChatBubble from '@/components/features/chat/ChatBubble';

const ChatBubbles = () => {
  const currentChatId = useAtomValue(currentChatIdAtom);
  const chatData = useAtomValue(chatFamilyAtom(currentChatId));

  const { messagesStartRef, messagesEndRef, scrollToBottom } =
    useChatScrollHandler();

  useEffect(() => {
    console.log('chatData.messages', chatData.messages);
    if (chatData.messages && chatData.messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [chatData.messages]);

  return (
    <div className='flex-1 overflow-y-auto bg-white'>
      <div className='max-w-3xl mx-auto py-16 px-10 space-y-8'>
        <div ref={messagesStartRef} />
        {chatData.messages.map((message, index) => {
          return (
            <ChatBubble
              key={index}
              message={message}
              isMessageGenerating={
                chatData.isGenerating && index === chatData.messages.length - 1
              }
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatBubbles;
