import { useState, useRef, useEffect, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { ChevronDown, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { getMyLlmAssignmentsAtom } from '@/hooks/useLlmGatewayData';
import { selectedGroupAtom } from '@shared/store/auth';
import { selectedModelAtom } from '@/store/chat';

const ModelSelector = () => {
  const {
    data: models,
    isLoading,
    isFetching,
  } = useAtomValue(getMyLlmAssignmentsAtom);
  const selectedGroup = useAtomValue(selectedGroupAtom);
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);

  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isGroupSelected = !!selectedGroup?.orgId && selectedGroup.orgId !== -1;

  const hasNoModels = useMemo(() => {
    if (!isGroupSelected) return true;
    return !isLoading && !isFetching && (!models || models.length === 0);
  }, [isGroupSelected, models, isLoading, isFetching]);

  useEffect(() => {
    console.log('models', models);
    if (!models || models.length === 0) {
      setSelectedModel(null);
      return;
    }
    const currentModelExists = models.some(
      (m) => m.assignmentId === selectedModel?.assignmentId
    );
    if (!currentModelExists) {
      setSelectedModel(models[0]);
    }
  }, [models]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <>
        {isLoading || isFetching ? (
          <div className='flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] text-neutral-700 bg-neutral-50 border border-neutral-200/60'>
            <Loader2 className='w-4 h-4 flex-shrink-0 text-neutral-500 animate-spin' />
            <span>모델 목록을 불러오는 중입니다...</span>
          </div>
        ) : hasNoModels ? (
          <div className='flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] text-amber-700 bg-amber-50 border border-amber-200/60'>
            <AlertTriangle className='w-4 h-4 flex-shrink-0 text-amber-500' />
            <span>
              현재 그룹에 할당된 모델이 존재하지 않습니다. 관리자 설정에서
              모델을 지정해주세요.
            </span>
          </div>
        ) : (
          <div
            onClick={() => setIsOpen(!isOpen)}
            className='flex items-center gap-2.5 px-4 py-2 rounded-lg text-[14px] font-medium text-neutral-700 cursor-pointer hover:bg-white/60 transition-all'
          >
            <span>
              {selectedModel?.modelName} {selectedModel?.modelVersion}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        )}

        {isOpen && !hasNoModels && (
          <div className='absolute left-0 top-full mt-2 z-50 w-56 py-1 rounded-xl bg-white border border-neutral-200 shadow-lg'>
            {models?.map((model) => (
              <button
                key={model.assignmentId}
                onClick={() => {
                  setSelectedModel(model);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors ${
                  selectedModel?.assignmentId === model.assignmentId
                    ? 'bg-neutral-50'
                    : ''
                }`}
              >
                <div className='w-4 h-4 flex-shrink-0'>
                  {selectedModel?.assignmentId === model.assignmentId && (
                    <Check className='w-4 h-4 text-neutral-700' />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-[14px] font-medium text-neutral-900'>
                    {model.modelName}
                  </div>
                  <div className='text-[12px] text-neutral-500'>
                    {model.modelVersion}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </>
    </div>
  );
};

export default ModelSelector;
