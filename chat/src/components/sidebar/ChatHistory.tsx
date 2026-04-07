import { useState, useEffect } from 'react';
import { ChevronDown, Folder } from 'lucide-react';
import { useAtom } from 'jotai';
import { agentHistoryApi, agentHistoryDetailApi, IAgentHistory } from '@/api/agent';
import { chatDataAtom, currentChatIdAtom } from '@/store/chat';
import { useNavigate } from 'react-router-dom';
import type { IMessage, ISource } from '@/types/message';

const ChatHistory = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [history, setHistory] = useState<IAgentHistory[]>([]);
  const [, setChatData] = useAtom(chatDataAtom);
  const [currentChatId, setCurrentChatId] = useAtom(currentChatIdAtom);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const data = await agentHistoryApi(0, 30);
      setHistory(data);
    } catch (e) {
      console.error('히스토리 조회 실패:', e);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    // 채팅 완료 시 즉시 갱신
    const handleRefresh = () => fetchHistory();
    window.addEventListener('agent-history-refresh', handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('agent-history-refresh', handleRefresh);
    };
  }, []);

  const handleClick = async (item: IAgentHistory) => {
    try {
      const detail = await agentHistoryDetailApi(item.traceId);

      const messages: IMessage[] = [];

      // raw sources 배열을 ISource[]로 변환하는 헬퍼
      const mapSources = (raw?: Record<string, unknown>[] | null): ISource[] | undefined => {
        if (!raw || raw.length === 0) return undefined;
        return raw.map((s) => ({
          index: s.index as number | undefined,
          title: (s.title as string) ?? '',
          score: s.score as number | undefined,
          content: s.content as string | undefined,
          contentPreview: (s.content_preview ?? s.contentPreview) as string | undefined,
          documentPath: (s.document_path ?? s.documentPath) as string | undefined,
          pageNumber: (s.page_number ?? s.pageNumber) as number | undefined,
          tagsTopic: (s.tags_topic ?? s.tagsTopic) as string | undefined,
          author: s.author as string | undefined,
          issue: s.issue as string | undefined,
          bm25Score: (s.bm25_score ?? s.bm25Score) as number | undefined,
          bm25Rank: (s.bm25_rank ?? s.bm25Rank) as number | undefined,
          vectorScore: (s.vector_score ?? s.vectorScore) as number | undefined,
          vectorRank: (s.vector_rank ?? s.vectorRank) as number | undefined,
        }));
      };

      // 세션에 여러 턴이 있으면 전체 로드
      if (detail.turns && detail.turns.length > 0) {
        for (const turn of detail.turns) {
          messages.push({ role: 'user', content: turn.query, type: 'user' });
          if (turn.answer) {
            messages.push({
              role: 'assistant',
              content: turn.answer,
              type: 'assistant',
              elapsedSeconds: turn.elapsedSeconds ?? undefined,
              sources: mapSources(turn.sources),
            });
          }
        }
      } else {
        // 단일 턴 (세션ID 없는 레거시 데이터)
        messages.push({ role: 'user', content: detail.query, type: 'user' });
        if (detail.answer) {
          messages.push({
            role: 'assistant',
            content: detail.answer,
            type: 'assistant',
            sources: mapSources((detail as any).sources),
          });
        }
      }

      const chatId = detail.sessionId || item.traceId;
      setChatData({
        id: chatId,
        data: {
          chatId,
          title: detail.query.slice(0, 30),
          messages,
          isGenerating: false,
        },
      });
      setCurrentChatId(chatId);
      navigate(`/chat/${chatId}`, { replace: true });
    } catch (e) {
      console.error('히스토리 상세 조회 실패:', e);
    }
  };

  return (
    <div className='flex flex-col'>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-50/50 transition-colors rounded-lg mx-2'
      >
        <Folder className='w-3.5 h-3.5' />
        <span>히스토리</span>
        <ChevronDown
          className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className='space-y-1 px-3'>
          {history.length === 0 && (
            <div className='px-3 py-2 text-[13px] text-neutral-400'>대화 기록이 없습니다</div>
          )}
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`w-full flex flex-col text-left px-3 py-2.5 rounded-lg text-[13px] cursor-pointer transition-colors ${
                currentChatId === item.traceId
                  ? 'text-neutral-900 bg-neutral-100 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <span className='truncate font-medium'>
                {item.query.length > 30 ? item.query.slice(0, 30) + '...' : item.query}
              </span>
              <span className='text-[11px] text-neutral-400 mt-0.5'>
                {item.agentName}/{item.agentVersion} ·{' '}
                {new Date(item.createDt).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
