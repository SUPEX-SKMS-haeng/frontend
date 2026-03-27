import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';

// 더미 데이터
const dummyChats = [
  // { id: '1', title: 'LLM Gateway 아키텍처 설계', selected: true },
  // { id: '2', title: 'API 엔드포인트 최적화 방법', selected: false },
  // { id: '3', title: '모델 성능 벤치마크 분석', selected: false },
];

const ChatHistory = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='flex flex-col'>
      {/* 섹션 헤더 */}
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

      {/* 채팅 목록 */}
      {isOpen && (
        <div className='space-y-1 px-3'>
          {dummyChats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative w-full flex items-center text-left px-3 py-2.5 rounded-lg text-[14px] cursor-pointer transition-colors ${
                chat.selected
                  ? 'text-neutral-900 bg-neutral-100 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
              onMouseEnter={() => setHoveredId(chat.id)}
              onMouseLeave={() => {
                setHoveredId(null);
                if (menuOpenId !== chat.id) setMenuOpenId(null);
              }}
            >
              <span className='truncate flex-1'>{chat.title}</span>

              {/* ... 메뉴 영역 - 항상 공간 확보 */}
              <div className='flex-shrink-0 w-6 h-6 flex items-center justify-center'>
                {hoveredId === chat.id && (
                  <div className='relative' ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
                      }}
                      className='p-1 rounded-md hover:bg-neutral-200 transition-colors'
                    >
                      <MoreHorizontal className='w-4 h-4 text-neutral-500' />
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {menuOpenId === chat.id && (
                      <div className='absolute right-0 top-full mt-1 z-50 w-36 py-1 rounded-lg bg-white border border-neutral-200 shadow-lg'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`"${chat.title}" 이름 변경`);
                            setMenuOpenId(null);
                          }}
                          className='w-full flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors'
                        >
                          <Pencil className='w-3.5 h-3.5' />
                          <span>이름 변경</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(`"${chat.title}"을(를) 삭제하시겠습니까?`)
                            ) {
                              alert('삭제되었습니다.');
                            }
                            setMenuOpenId(null);
                          }}
                          className='w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                          <span>삭제</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
