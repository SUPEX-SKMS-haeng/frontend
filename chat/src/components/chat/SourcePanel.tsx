import { useState, useEffect } from 'react';
import { X, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useAtom } from 'jotai';
import { selectedSourceAtom } from '@/store/chat';
import RelevanceScoreBadge from './RelevanceScoreBadge';

const SourcePanel = () => {
  const [selectedSource, setSelectedSource] = useAtom(selectedSourceAtom);
  const [contentExpanded, setContentExpanded] = useState(false);

  useEffect(() => {
    setContentExpanded(false);
  }, [selectedSource]);

  if (!selectedSource) return null;

  const isLowConfidence = selectedSource.confidenceLevel === 'low';
  const showContent = !isLowConfidence || contentExpanded;

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

      {/* 관련도 배지 */}
      <div className='px-5 py-3 border-b border-neutral-100'>
        <RelevanceScoreBadge source={selectedSource} />

        {/* 메타 정보 */}
        <div className='mt-2.5 flex flex-col gap-1'>
          {selectedSource.tagsTopic && (
            <div className='flex items-center gap-1 flex-wrap'>
              {selectedSource.tagsTopic.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className='text-[11px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded'
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          {(selectedSource.author || selectedSource.issue) && (
            <div className='text-[11px] text-neutral-400'>
              {selectedSource.author && <span>{selectedSource.author}</span>}
              {selectedSource.author && selectedSource.issue && <span> · </span>}
              {selectedSource.issue && <span>{selectedSource.issue}</span>}
            </div>
          )}
          {selectedSource.pageNumber != null && (
            <div className='text-[11px] text-neutral-400'>p.{selectedSource.pageNumber}</div>
          )}
        </div>
      </div>

      {/* 원문 내용 */}
      <div className='flex-1 overflow-y-auto px-5 py-4'>
        <div className='flex items-center justify-between mb-3'>
          <p className='text-[11px] uppercase tracking-wider text-neutral-400'>원문 내용</p>
          {isLowConfidence && (
            <button
              onClick={() => setContentExpanded((prev) => !prev)}
              className='flex items-center gap-0.5 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors'
            >
              {contentExpanded ? (
                <>
                  접기
                  <ChevronUp className='w-3 h-3' />
                </>
              ) : (
                <>
                  펼치기
                  <ChevronDown className='w-3 h-3' />
                </>
              )}
            </button>
          )}
        </div>
        {showContent ? (
          <div className='text-[14px] leading-relaxed text-neutral-700 whitespace-pre-wrap'>
            {selectedSource.content || selectedSource.contentPreview || '원문 내용이 없습니다.'}
          </div>
        ) : (
          <div className='text-[13px] text-neutral-400 italic'>
            참고용 소스입니다. 펼치기를 눌러 내용을 확인하세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcePanel;
