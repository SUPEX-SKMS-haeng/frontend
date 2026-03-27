import { useState, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import type { MemberCandidate, Member } from '@/types/member';
import type { SearchBarFilter } from '@/types/search';
import {
  getMemberCandidatesAtom,
  getAllMembersByOrgAtom,
} from '@/hooks/useMemberData';
import { candidateListParamsAtom } from '@/store/memberUI';
import SearchBar from '@/components/ui/SearchBar';
import { Modal } from '@/components/ui/Modal';

const CANDIDATE_LIMIT = 50;

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diff: { added: number[]; removed: number[] }) => void;
  organizationId?: string | number;
}

const AddMemberModal = ({ isOpen, onClose, onSave }: AddMemberModalProps) => {
  const { data } = useAtomValue(getMemberCandidatesAtom);
  const allUserCandidates: MemberCandidate[] = data?.candidates ?? [];
  const totalCandidates: number = data?.total ?? 0;
  const setCandidateListParams = useSetAtom(candidateListParamsAtom);

  // 모달이 열려있을 때만 전체 멤버 데이터를 가져옵니다.
  const { data: allMembersData } = useAtomValue(getAllMembersByOrgAtom);
  const allMembers: Member[] = allMembersData?.members ?? [];

  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());
  const [rightList, setRightList] = useState<MemberCandidate[]>([]);

  // 저장 버튼 활성화를 위한 초기 우측 멤버 ID 셋
  const [initialRightIds, setInitialRightIds] = useState<Set<string>>(
    new Set()
  );

  // allMembers 대신 allMembersData를 의존성으로 두어, 로딩 중 매 렌더마다 새 [] 참조로 effect가 무한 실행되는 것을 방지합니다.
  useEffect(() => {
    if (!isOpen) return;
    const members = allMembersData?.members ?? [];
    setCandidateListParams((prev) => ({
      ...prev,
      offset: 0,
      searchCategory: '',
      searchKeyword: '',
    }));
    setLeftChecked(new Set());
    setRightChecked(new Set());

    const initialRight: MemberCandidate[] = members
      .filter((m) => m.loginId && m.userId)
      .map((m) => ({
        loginId: m.loginId,
        userId: m.userId!,
        name: m.name,
        company: m.company,
      }));
    setRightList(initialRight);
    setInitialRightIds(new Set(initialRight.map((m) => m.loginId)));
  }, [isOpen, allMembersData, setCandidateListParams]);

  const rightIds = useMemo(
    () => new Set(rightList.map((c) => c.loginId)),
    [rightList]
  );

  const leftList = useMemo(() => {
    return allUserCandidates.filter(
      (candidate: MemberCandidate) => !rightIds.has(candidate.loginId)
    );
  }, [allUserCandidates, rightIds]);

  const hasMoreCandidates = totalCandidates > CANDIDATE_LIMIT;

  // 초기 상태와 현재 상태 비교를 통한 변경 감지
  const isChanged = useMemo(() => {
    if (rightIds.size !== initialRightIds.size) return true;
    for (const id of rightIds) {
      if (!initialRightIds.has(id)) return true;
    }
    return false;
  }, [rightIds, initialRightIds]);

  if (!isOpen) return null;

  const toggleLeftCheck = (id: string) => {
    const next = new Set(leftChecked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLeftChecked(next);
  };

  const toggleRightCheck = (id: string) => {
    const next = new Set(rightChecked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRightChecked(next);
  };

  const handleAdd = () => {
    if (leftChecked.size === 0) return;
    const toAdd = leftList.filter((c: MemberCandidate) =>
      leftChecked.has(c.loginId)
    );
    setRightList((prev) => [...prev, ...toAdd]);
    setLeftChecked(new Set());
  };

  const handleRemove = () => {
    if (rightChecked.size === 0) return;
    setRightList((prev) => prev.filter((c) => !rightChecked.has(c.loginId)));
    setRightChecked(new Set());
  };

  const handleSearch = ({ searchCategory, searchKeyword }: SearchBarFilter) => {
    setCandidateListParams((prev) => ({
      ...prev,
      offset: 0,
      searchCategory,
      searchKeyword,
    }));
    setLeftChecked(new Set());
  };

  // 우측 패널의 최종 목록을 기반으로 diff를 계산해 부모에 전달
  const handleSave = () => {
    if (!isChanged) return;

    const currentIdSet = new Set(allMembers.map((m) => m.userId));
    const desiredIdSet = new Set(rightList.map((c) => c.userId));

    const added = rightList
      .filter((c) => c.userId && !currentIdSet.has(c.userId))
      .map((c) => c.userId!);

    const removed = allMembers
      .filter((m) => m.userId && !desiredIdSet.has(m.userId))
      .map((m) => m.userId!);

    onSave({ added, removed });
  };

  const formatCandidate = (c: MemberCandidate) =>
    `${c.name} | ${c.loginId} | ${c.company}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='3xl'>
      <Modal.Header title='멤버 추가/제거' onClose={onClose} />

      <Modal.Body className='flex gap-3 px-6 py-4'>
        {/* 좌측 패널 */}
        <div className='flex-1 border border-neutral-200 rounded-lg flex flex-col h-80'>
          <div className='px-3 py-2.5 border-b border-neutral-200 shrink-0'>
            <SearchBar type='users' layout='compact' onSearch={handleSearch} />
          </div>

          <div className='flex-1 overflow-y-auto'>
            {leftList.length === 0 ? (
              <div className='h-full flex items-center justify-center text-xs text-neutral-400'>
                검색 결과가 없습니다.
              </div>
            ) : (
              <>
                {leftList.map((candidate: MemberCandidate) => (
                  <label
                    key={`${candidate.loginId}-${candidate.name}`}
                    className={clsx(
                      'px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors',
                      leftChecked.has(candidate.loginId)
                        ? 'bg-neutral-100/60'
                        : 'hover:bg-neutral-50'
                    )}
                  >
                    <input
                      type='checkbox'
                      checked={leftChecked.has(candidate.loginId)}
                      onChange={() => toggleLeftCheck(candidate.loginId)}
                      className='w-3.5 h-3.5 rounded border-neutral-300 cursor-pointer accent-neutral-800 shrink-0'
                    />
                    <span className='text-xs text-neutral-700 truncate'>
                      {formatCandidate(candidate)}
                    </span>
                  </label>
                ))}
                {hasMoreCandidates && (
                  <div className='px-3 py-2 text-xs text-neutral-400 text-center select-none'>
                    … 결과가 더 있습니다. 검색어로 범위를 좁혀주세요.
                  </div>
                )}
              </>
            )}
          </div>

          <div className='px-3 py-2 border-t border-neutral-200 shrink-0 flex justify-end'>
            <button
              type='button'
              onClick={handleAdd}
              disabled={leftChecked.size === 0}
              className={clsx(
                'text-xs font-medium transition-colors',
                leftChecked.size > 0
                  ? 'text-neutral-700 hover:text-neutral-900 cursor-pointer'
                  : 'text-neutral-300 cursor-not-allowed'
              )}
            >
              + 추가
            </button>
          </div>
        </div>

        {/* 중앙 화살표 */}
        <div className='w-8 shrink-0 flex items-center justify-center'>
          <ChevronRight className='w-5 h-5 text-neutral-400' />
        </div>

        {/* 우측 패널 */}
        <div className='flex-1 border border-neutral-200 rounded-lg flex flex-col h-80'>
          <div className='flex-1 overflow-y-auto'>
            {rightList.length === 0 ? (
              <div className='h-full flex items-center justify-center text-xs text-neutral-400'>
                추가된 멤버가 없습니다.
              </div>
            ) : (
              rightList.map((candidate) => (
                <label
                  key={`${candidate.loginId}-${candidate.name}`}
                  className={clsx(
                    'px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors',
                    rightChecked.has(candidate.loginId)
                      ? 'bg-neutral-100/60'
                      : 'hover:bg-neutral-50'
                  )}
                >
                  <input
                    type='checkbox'
                    checked={rightChecked.has(candidate.loginId)}
                    onChange={() => toggleRightCheck(candidate.loginId)}
                    className='w-3.5 h-3.5 rounded border-neutral-300 cursor-pointer accent-neutral-800 shrink-0'
                  />
                  <span className='text-xs text-neutral-700 truncate'>
                    {formatCandidate(candidate)}
                  </span>
                </label>
              ))
            )}
          </div>

          <div className='px-3 py-2 border-t border-neutral-200 shrink-0 flex justify-end'>
            <button
              type='button'
              onClick={handleRemove}
              disabled={rightChecked.size === 0}
              className={clsx(
                'text-xs font-medium transition-colors',
                rightChecked.size > 0
                  ? 'text-red-400 hover:text-red-600 cursor-pointer'
                  : 'text-neutral-300 cursor-not-allowed'
              )}
            >
              - 제거
            </button>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button
          type='button'
          onClick={handleSave}
          disabled={!isChanged}
          className={clsx(
            'h-9 px-5 rounded-lg text-sm font-medium transition-colors',
            isChanged
              ? 'bg-neutral-800 hover:bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          )}
        >
          저장
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddMemberModal;
