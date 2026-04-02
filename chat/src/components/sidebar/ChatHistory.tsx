import { useState, useEffect } from 'react';
import { ChevronDown, Folder } from 'lucide-react';
import { useAtom } from 'jotai';
import { agentHistoryApi, agentHistoryDetailApi, IAgentHistory } from '@/api/agent';
import { chatDataAtom, currentChatIdAtom } from '@/store/chat';
import { useNavigate } from 'react-router-dom';
import type { IMessage } from '@/types/message';

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

      const messages: IMessage[] = [
        { role: 'user', content: detail.query, type: 'user' },
      ];
      if (detail.answer) {
        messages.push({ role: 'assistant', content: detail.answer, type: 'assistant' });
      }

      const chatId = item.traceId;
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
            <div className='px-3 py-2 text-[13px] text-neutral-400'>
              대화 기록이 없습니다
            </div>
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
                {item.agentName}/{item.agentVersion} · {new Date(item.createDt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
