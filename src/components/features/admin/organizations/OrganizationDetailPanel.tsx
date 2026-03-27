import { useState, useLayoutEffect, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import type { Organization } from '@/types/admin/organization';

import { selectedOrgIdAtom } from '@/store/admin/organizationUI';
import UsageManagementTab from './usage/UsageManagementTab';
import MemberTab from './members/MemberTab';
import AssignmentTab from './assignments/AssignmentTab';
import PromptTab from './prompt/PromptTab';

interface OrganizationDetailPanelProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'members' | 'assignments' | 'prompts' | 'usage';

const tabs: { id: TabId; label: string }[] = [
  { id: 'members', label: '멤버 관리' },
  { id: 'assignments', label: '모델 관리' },
  { id: 'prompts', label: '프롬프트 관리' },
  { id: 'usage', label: '사용량 관리' },
];

const OrganizationDetailPanel = ({
  organization,
  isOpen,
  onClose,
}: OrganizationDetailPanelProps) => {
  const setSelectedOrgId = useSetAtom(selectedOrgIdAtom);
  const [activeTab, setActiveTab] = useState<TabId>('members');

  // 패널 열림/닫힘 시 선택 조직 ID 동기화 (멤버/모델 쿼리가 즉시 올바른 orgId로 실행되도록)
  useLayoutEffect(() => {
    if (isOpen && organization?.id != null) {
      setSelectedOrgId(organization.id);
    } else {
      setSelectedOrgId(null);
    }
    return () => setSelectedOrgId(null);
  }, [isOpen, organization?.id, setSelectedOrgId]);

  // 패널이 닫았다가 다시 열릴 때마다 증가 → SearchBar 리마운트로 검색창 초기화 (탭 닫았다 열면 검색어 비우기)
  const panelOpenCountRef = useRef(0);
  const prevOpenRef = useRef(false);
  if (isOpen && !prevOpenRef.current) {
    panelOpenCountRef.current += 1;
  }
  prevOpenRef.current = isOpen;
  const panelOpenKey = panelOpenCountRef.current;

  return (
    <>
      {/* 딤드 백드롭 */}
      <div
        className={clsx(
          'absolute inset-0 bg-black/10 transition-opacity duration-300 z-10',
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* 슬라이드 패널 */}
      <div
        className={clsx(
          'absolute top-0 right-0 h-full w-[calc(100%-1.5rem)] min-w-[380px] bg-white border-l border-neutral-200 shadow-xl z-20',
          'flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* 패널 헤더 */}
        <div className='flex-shrink-0 px-6 py-5 border-b border-neutral-200'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex flex-col gap-1 min-w-0'>
              <span className='text-xs text-neutral-400 font-medium'>그룹</span>
              <h2 className='text-lg font-bold text-neutral-900 truncate'>
                {organization?.name ?? ''}
              </h2>
            </div>
            <div className='flex items-center gap-2 flex-shrink-0 pt-1'>
              {organization && (
                <span
                  className={clsx(
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    organization.status === '활성'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  )}
                >
                  {organization.status}
                </span>
              )}
              <button
                type='button'
                aria-label='닫기'
                onClick={onClose}
                className='p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className='flex-shrink-0 flex border-b border-neutral-200 px-6'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'py-3 px-1 mr-6 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className='flex-1 overflow-y-auto flex flex-col min-h-0'>
          {activeTab === 'members' && (
            <MemberTab
              organizationId={organization?.id}
              panelOpenKey={panelOpenKey}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentTab
              organizationId={organization?.id}
              panelOpenKey={panelOpenKey}
            />
          )}

          {activeTab === 'prompts' && (
            <PromptTab
              organizationId={organization?.id}
              panelOpenKey={panelOpenKey}
            />
          )}

          {activeTab === 'usage' && (
            <div className='flex flex-col flex-1 p-5 gap-4 min-h-0'>
              <UsageManagementTab
                organizationId={organization?.id}
                organizationName={organization?.name ?? '-'}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrganizationDetailPanel;
