import { X, FileText } from 'lucide-react';
import { useAtom } from 'jotai';
import { selectedSourceAtom } from '@/store/chat';

const SourcePanel = () => {
  const [selectedSource, setSelectedSource] = useAtom(selectedSourceAtom);

  if (!selectedSource) return null;

  return (
    <div className='w-[420px] flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col h-full'>
      {/* 헤더 */}
      <div className='flex items-center justify-between px-5 py-4 border-b border-neutral-200'>
        <div className='flex items-center gap-2 min-w-0'>
          <FileText className='w-4 h-4 flex-shrink-0 text-neutral-500' />
          <h3 className='text-[14px] font-medium text-neutral-800 truncate'>
            {selectedSource.index != null && (
              <span className='text-blue-600 mr-1.5'>[자료 {selectedSource.index}]</span>
            )}
            {selectedSource.title}
          </h3>
        </div>
        <button
          onClick={() => setSelectedSource(null)}
          className='p-1 rounded-md hover:bg-neutral-100 transition-colors flex-shrink-0'
        >
          <X className='w-4 h-4 text-neutral-500' />
        </button>
      </div>

      {/* 점수 */}
      {selectedSource.score != null && (
        <div className='px-5 py-2.5 border-b border-neutral-100'>
          <span className='text-[12px] text-neutral-400'>관련도 점수: </span>
          <span className='text-[12px] font-medium text-neutral-600'>
            {selectedSource.score.toFixed(2)}
          </span>
        </div>
      )}

      {/* 원문 내용 */}
      <div className='flex-1 overflow-y-auto px-5 py-4'>
        <p className='text-[11px] uppercase tracking-wider text-neutral-400 mb-3'>원문 내용</p>
        <div className='text-[14px] leading-relaxed text-neutral-700 whitespace-pre-wrap'>
          {selectedSource.content || selectedSource.contentPreview || '원문 내용이 없습니다.'}
        </div>
      </div>
    </div>
  );
};

export default SourcePanel;
