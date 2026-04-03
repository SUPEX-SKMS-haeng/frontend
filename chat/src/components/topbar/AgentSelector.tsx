import { useState, useRef, useEffect, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { getAgentListAtom } from '@/hooks/useAgentData';
import { selectedAgentAtom } from '@/store/chat';

const AgentSelector = () => {
  const { data: agents, isLoading, isFetching } = useAtomValue(getAgentListAtom);
  const [selectedAgent, setSelectedAgent] = useAtom(selectedAgentAtom);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasNoAgents = useMemo(() => {
    return !isLoading && !isFetching && (!agents || agents.length === 0);
  }, [agents, isLoading, isFetching]);

  useEffect(() => {
    if (!agents || agents.length === 0) return;
    const currentExists = agents.some(
      (a) => a.name === selectedAgent?.name && a.version === selectedAgent?.version
    );
    if (!currentExists) {
      setSelectedAgent(agents[0]);
    }
  }, [agents]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      {isLoading || isFetching ? (
        <div className='flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-neutral-700 bg-neutral-50 border border-neutral-200/60'>
          <Loader2 className='w-4 h-4 flex-shrink-0 text-neutral-500 animate-spin' />
          <span>에이전트 로딩 중...</span>
        </div>
      ) : hasNoAgents ? (
        <div className='flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-neutral-500'>
          에이전트 없음
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-neutral-700 cursor-pointer hover:bg-white/60 transition-all'
        >
          <span>
            {selectedAgent?.name}/{selectedAgent?.version}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      )}

      {isOpen && !hasNoAgents && (
        <div className='absolute left-0 top-full mt-2 z-50 w-64 py-1 rounded-xl bg-white border border-neutral-200 shadow-lg'>
          {agents?.map((agent) => {
            const isSelected =
              selectedAgent?.name === agent.name && selectedAgent?.version === agent.version;
            return (
              <button
                key={`${agent.name}-${agent.version}`}
                onClick={() => {
                  setSelectedAgent(agent);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors ${
                  isSelected ? 'bg-neutral-50' : ''
                }`}
              >
                <div className='w-4 h-4 flex-shrink-0'>
                  {isSelected && <Check className='w-4 h-4 text-neutral-700' />}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-[13px] font-medium text-neutral-900'>
                    {agent.name}/{agent.version}
                  </div>
                  {agent.description && (
                    <div className='text-[11px] text-neutral-500 truncate'>{agent.description}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgentSelector;
