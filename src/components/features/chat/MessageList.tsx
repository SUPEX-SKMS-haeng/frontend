import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'loading';
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className='flex-1 overflow-y-auto bg-white'>
      <div className='max-w-3xl mx-auto py-16 px-10 space-y-8'>
        {messages.map((message) => {
          if (message.type === 'user') {
            return (
              <div key={message.id} className='flex justify-end'>
                <div className='max-w-[75%] px-5 py-3 rounded-2xl bg-neutral-900 text-white text-[15px] leading-relaxed shadow-sm'>
                  {message.content}
                </div>
              </div>
            );
          }

          if (message.type === 'assistant') {
            return (
              <div key={message.id} className='flex justify-start'>
                <div className='max-w-[85%] px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-[15px] leading-relaxed'>
                  <div className='text-neutral-900 whitespace-pre-wrap'>
                    {message.content}
                  </div>
                </div>
              </div>
            );
          }

          if (message.type === 'loading') {
            return (
              <div
                key={message.id}
                className='flex items-center gap-3 text-[14px] text-neutral-600'
              >
                <Loader2 className='w-4 h-4 animate-spin text-neutral-400' />
                <span>응답을 생성 중입니다..</span>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

export default MessageList;
