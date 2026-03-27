import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ChevronDown, Users, Check, AlertTriangle } from 'lucide-react';
import { selectedGroupAtom, userGroupsAtom } from '@shared/store/auth';
import { useAuth } from '@shared/hooks/useAuth';

interface GroupSelectorProps {
  onGroupChange?: () => void;
}

const GroupSelector = ({ onGroupChange }: GroupSelectorProps) => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useAtom(selectedGroupAtom);
  const [userGroups, setUserGroups] = useAtom(userGroupsAtom);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && userGroups.length > 0 && !selectedGroup?.orgId) {
      setSelectedGroup(userGroups[0]);
    }
  }, [user, userGroups, setSelectedGroup, selectedGroup]);

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
      {userGroups.length === 0 ? (
        <div className='flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] text-amber-700 bg-amber-50 border border-amber-200/60'>
          <AlertTriangle className='w-4 h-4 flex-shrink-0 text-amber-500' />
          <span>할당된 그룹이 없습니다.</span>
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-2.5 px-4 py-2 rounded-lg text-[14px] font-medium text-neutral-700 cursor-pointer hover:bg-white/60 transition-all'
        >
          <Users className='w-4 h-4 text-neutral-500' />
          <span>{selectedGroup.orgName}</span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      )}

      {isOpen && userGroups.length > 0 && (
        <div className='absolute right-0 top-full mt-2 z-50 w-64 py-1 rounded-xl bg-white border border-neutral-200 shadow-lg'>
          {userGroups.map((group) => (
            <button
              key={group.orgId}
              onClick={() => {
                if (selectedGroup?.orgId !== group.orgId) {
                  setSelectedGroup(group);
                  onGroupChange?.();
                }
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors ${
                selectedGroup.orgId === group.orgId ? 'bg-neutral-50' : ''
              }`}
            >
              <div className='w-4 h-4 flex-shrink-0'>
                {selectedGroup.orgId === group.orgId && (
                  <Check className='w-4 h-4 text-neutral-700' />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-[14px] font-medium text-neutral-900'>
                  {group.orgName}
                </div>
                <div className='text-[12px] text-neutral-500'>
                  {group.orgDescription}
                </div>
              </div>
              {group.orgId === selectedGroup.orgId && (
                <span className='text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600'>
                  기본
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupSelector;
