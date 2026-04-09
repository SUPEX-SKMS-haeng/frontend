import { ReactNode, useMemo } from 'react';
import { Loader2, AlertCircle, FileText, Clock, BookOpen } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { IMessage, ISource } from '@/types/message';
import { selectedSourceAtom } from '@/store/chat';
import { ChatCopy } from './ChatBubbleActions';

const getConfidenceDot = (source: ISource) => {
  const raw = source.rerankerScore;
  const score = raw != null ? Math.min(raw / 4, 1) : source.absoluteRelevance;
  if (score == null) return null;
  if (score >= 0.75) return 'bg-emerald-500';
  if (score >= 0.38) return 'bg-amber-400';
  return 'bg-neutral-400';
};

// TODO: 실제 로직으로 교체 필요 - 에러 발생 여부에 따라 결정
const hasModelError = false;

interface ChatBubbleProps {
  message: IMessage;
  isMessageGenerating: boolean;
}

const ChatBubble = ({ message, isMessageGenerating = false }: ChatBubbleProps) => {
  const setSelectedSource = useSetAtom(selectedSourceAtom);

  // 답변 텍스트에서 직접 인용된 자료 번호 추출
  const citedIndices = useMemo(() => {
    if (!message.content || !message.sources?.length) return new Set<number>();
    const matches = message.content.matchAll(/\[자료\s*(\d+)\]/g);
    return new Set(Array.from(matches, (m) => parseInt(m[1], 10)));
  }, [message.content, message.sources]);

  const renderContentWithSources = (content: string, sources?: ISource[]): ReactNode => {
    if (!sources || sources.length === 0) return content;

    const parts = content.split(/(\[자료\s*\d+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/^\[자료\s*(\d+)\]$/);
      if (match) {
        const sourceIndex = parseInt(match[1], 10);
        const source = sources.find((s) => s.index === sourceIndex);
        if (source) {
          return (
            <button
              key={idx}
              onClick={() => setSelectedSource(source)}
              className='inline-flex items-center px-1 py-0.5 mx-0.5 rounded text-[12px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer align-baseline'
            >
              [자료 {sourceIndex}]
            </button>
          );
        }
      }
      return <span key={idx}>{part}</span>;
    });
  };
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
            <div className='text-neutral-900 whitespace-pre-wrap'>
              {renderContentWithSources(message.content, message.sources)}
            </div>
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

      {/** 출처 표기 영역: 직접 인용 / 배경 참조 구분 */}
      {message.role === 'assistant' &&
        message.sources &&
        message.sources.length > 0 &&
        (() => {
          const cited = message.sources.filter((s) => s.index != null && citedIndices.has(s.index));
          const background = message.sources.filter(
            (s) => s.index == null || !citedIndices.has(s.index)
          );
          return (
            <div className='mt-3 max-w-[85%] flex flex-col gap-2'>
              {cited.length > 0 && (
                <div>
                  <p className='text-[12px] text-neutral-400 mb-1.5 flex items-center gap-1'>
                    <FileText className='w-3 h-3' />
                    직접 인용
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {cited.map((source, idx) => {
                      const dotColor = getConfidenceDot(source);
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSource(source)}
                          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[13px] text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer text-left'
                        >
                          {dotColor && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
                            />
                          )}
                          <FileText className='w-3.5 h-3.5 flex-shrink-0 text-blue-400' />
                          <span className='text-blue-600 font-medium text-[12px]'>
                            [{source.index}]
                          </span>
                          <span className='truncate max-w-[200px]'>{source.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {background.length > 0 && (
                <div>
                  <p className='text-[12px] text-neutral-400 mb-1.5 flex items-center gap-1'>
                    <BookOpen className='w-3 h-3' />
                    배경 참조
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {background.map((source, idx) => {
                      const dotColor = getConfidenceDot(source);
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSource(source)}
                          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[13px] text-neutral-500 hover:bg-neutral-100 transition-colors cursor-pointer text-left'
                        >
                          {dotColor && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
                            />
                          )}
                          <BookOpen className='w-3.5 h-3.5 flex-shrink-0 text-neutral-300' />
                          {source.index != null && (
                            <span className='text-neutral-400 font-medium text-[12px]'>
                              [{source.index}]
                            </span>
                          )}
                          <span className='truncate max-w-[200px]'>{source.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
