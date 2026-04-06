import { Loader2, AlertCircle, FileText, Clock } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { IMessage } from '@/types/message';
import { selectedSourceAtom } from '@/store/chat';
import { ChatCopy } from './ChatBubbleActions';

// TODO: 실제 로직으로 교체 필요 - 에러 발생 여부에 따라 결정
const hasModelError = false;

interface ChatBubbleProps {
  message: IMessage;
  isMessageGenerating: boolean;
}

const ChatBubble = ({ message, isMessageGenerating = false }: ChatBubbleProps) => {
  const setSelectedSource = useSetAtom(selectedSourceAtom);
  if (!message.content && message.type !== 'progress' && message.type !== 'error') {
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
            <div className='text-neutral-900 whitespace-pre-wrap'>{message.content}</div>
            {message.elapsedSeconds != null && (
              <div className='flex items-center gap-1 mt-2 text-[12px] text-neutral-400'>
                <Clock className='w-3 h-3' />
                <span>{message.elapsedSeconds}초</span>
              </div>
            )}
          </div>
        )
      ) : message.role === 'system' ? (
        <div className='max-w-[85%] text-[15px] leading-relaxed'>
          <div className='text-neutral-900 whitespace-pre-wrap'>{message.content}</div>
        </div>
      ) : null}

      {/** 출처 표기 영역 */}
      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
        <div className='mt-3 max-w-[85%]'>
          <p className='text-[12px] text-neutral-400 mb-1.5'>참고 문서</p>
          <div className='flex flex-wrap gap-2'>
            {message.sources.map((source, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSource(source)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-[13px] text-neutral-600 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left'
              >
                <FileText className='w-3.5 h-3.5 flex-shrink-0 text-neutral-400' />
                {source.index != null && (
                  <span className='text-blue-500 font-medium text-[12px]'>[{source.index}]</span>
                )}
                <span className='truncate max-w-[200px]'>{source.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
