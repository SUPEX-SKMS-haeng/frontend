import { Loader2, AlertCircle } from 'lucide-react';
import type { IMessage } from '@/types/chat/message';

// TODO: 실제 로직으로 교체 필요 - 에러 발생 여부에 따라 결정
const hasModelError = false;

interface ChatBubbleProps {
  message: IMessage;
  isMessageGenerating: boolean;
}

const ChatBubble = ({
  message,
  isMessageGenerating: _isMessageGenerating = false,
}: ChatBubbleProps) => {
  if (
    !message.content &&
    message.type !== 'progress' &&
    message.type !== 'error'
  ) {
    return null;
  }

  return (
    <>
      {message.role === 'user' ? (
        <div className='flex justify-end'>
          <div className='max-w-[75%] px-5 py-3 rounded-2xl bg-neutral-900 text-white text-[15px] leading-relaxed shadow-sm'>
            {message.content}
          </div>
        </div>
      ) : message.role === 'assistant' ? (
        message.type === 'progress' ? (
          <div className='flex items-center gap-3 text-[14px] text-neutral-500'>
            <Loader2 className='w-4 h-4 animate-spin text-neutral-400' />
            <span>응답을 생성 중입니다..</span>
          </div>
        ) : message.type === 'error' || hasModelError ? (
          <div className='flex items-center gap-2 text-[14px] text-neutral-400 leading-relaxed'>
            <AlertCircle className='w-4 h-4 flex-shrink-0' />
            <span>모델이 일시적으로 응답하지 않습니다. 다시 시도해주세요.</span>
          </div>
        ) : (
          <div className='max-w-[85%] text-[15px] leading-relaxed'>
            <div className='text-neutral-900 whitespace-pre-wrap'>
              {message.content}
            </div>
          </div>
        )
      ) : message.role === 'system' ? (
        <div className='max-w-[85%] text-[15px] leading-relaxed'>
          <div className='text-neutral-900 whitespace-pre-wrap'>
            {message.content}
          </div>
        </div>
      ) : null}

      {/** 출처 표기 영역 */}
      {/* {message.role === 'assistant' &&
        message.citations &&
        message.citations.length > 0 && (
          <ChatCitations
            messageUuid={message.uuid}
            citations={message.citations}
          />
        )} */}

      {/** sub function 영역: copy, feedback 등 */}
      {/* {(message.role === 'assistant' || message.role === 'system') &&
        !isMessageGenerating &&
        message.type !== 'cancelled' &&
        message.type !== 'progress' &&
        message.type !== 'error' &&
        !hasModelError && (
          <div>
            <ChatCopy message={message.content} />
          </div>
        )} */}
    </>
  );
};

export default ChatBubble;
