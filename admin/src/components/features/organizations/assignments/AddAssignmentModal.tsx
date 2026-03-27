import { useState, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import type { Assignment, AssignmentCandidate } from '@/types/assignment';
import type { SearchBarFilter } from '@/types/search';
import { getAssignmentCandidatesAtom, getAllAssignmentsByOrgAtom } from '@/hooks/useAssignmentData';
import { assignmentCandidateParamsAtom } from '@/store/assignmentUI';
import SearchBar from '@/components/ui/SearchBar';
import { Modal } from '@/components/ui/Modal';

const CANDIDATE_LIMIT = 200;

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diff: { added: number[]; removed: number[] }) => void;
  organizationId?: string | number;
}

const formatCandidate = (c: AssignmentCandidate) =>
  `${c.provider} | ${c.model} | ${c.version}`;

const AddAssignmentModal = ({
  isOpen,
  onClose,
  onSave,
}: AddAssignmentModalProps) => {
  const { data } = useAtomValue(getAssignmentCandidatesAtom);
  const allCandidates = data?.candidates ?? [];
  const totalCandidates: number = data?.total ?? 0;
  const setCandidateParams = useSetAtom(assignmentCandidateParamsAtom);

  // 모달이 열려있을 때만 조직 전체 할당멤버 데이터를 가져옵니다.
  const { data: allAssignmentsData } = useAtomValue(getAllAssignmentsByOrgAtom);
  const allAssignments: Assignment[] = allAssignmentsData?.assignments ?? [];

  const [leftChecked, setLeftChecked] = useState<Set<string | number>>(
    new Set()
  );
  const [rightChecked, setRightChecked] = useState<Set<string | number>>(
    new Set()
  );
  const [rightList, setRightList] = useState<AssignmentCandidate[]>([]);

  // 저장 버튼 활성화를 위한 초기 우측 할당 ID 셋
  const [initialRightIds, setInitialRightIds] = useState<Set<string | number>>(
    new Set()
  );

  useEffect(() => {
    if (!isOpen) return;
    const assignments = allAssignmentsData?.assignments ?? [];
    setCandidateParams((prev) => ({
      ...prev,
      offset: 0,
      searchCategory: '',
      searchKeyword: '',
    }));
    setLeftChecked(new Set());
    setRightChecked(new Set());
    // 현재 조직의 할당된 모델을 우측 초기값으로 설정
    const initialRight: AssignmentCandidate[] = assignments.map(
      (m) => ({
        id: m.id,
        provider: m.provider,
        model: m.model,
        version: m.version,
      })
    );
    setRightList(initialRight);
    setInitialRightIds(new Set(initialRight.map((m) => m.id)));
    
  }, [isOpen, allAssignmentsData, setCandidateParams]);

  const rightIds = useMemo(
    () => new Set(rightList.map((c) => c.id)),
    [rightList]
  );

  // 필터링은 hook(getAssignmentCandidatesAtom)에서 처리 → 우측 목록과 중복 제거만 수행
  const leftList = useMemo(
    () => allCandidates.filter((c) => !rightIds.has(c.id)),
    [allCandidates, rightIds]
  );

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

  const toggleLeftCheck = (id: string | number) => {
    const next = new Set(leftChecked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLeftChecked(next);
  };

  const toggleRightCheck = (id: string | number) => {
    const next = new Set(rightChecked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRightChecked(next);
  };

  const handleAdd = () => {
    if (leftChecked.size === 0) return;
    const toAdd = leftList.filter((c) => leftChecked.has(c.id));
    setRightList((prev) => [...prev, ...toAdd]);
    setLeftChecked(new Set());
  };

  const handleRemove = () => {
    if (rightChecked.size === 0) return;
    setRightList((prev) => prev.filter((c) => !rightChecked.has(c.id)));
    setRightChecked(new Set());
  };

  const handleSearch = (filter: SearchBarFilter) => {
    setCandidateParams({
      searchKeyword: filter.searchKeyword,
      searchCategory: filter.searchCategory,
    });
    setLeftChecked(new Set());
  };

  // 우측 패널의 최종 목록을 Assignment[]로 변환해 부모에 전달
  // 부모(handler)에서 현재 할당과 diff 계산 후 API 호출
  const handleSave = () => {
    if (!isChanged) return; // 변경사항 없으면 무시
    
    const currentIdSet = new Set(allAssignments.map((m) => String(m.id)));
    const desiredIdSet = new Set(rightList.map((c) => String(c.id)));

    const added = rightList
      .filter((c) => c.id && !currentIdSet.has(String(c.id)))
      .map((c) => Number(c.id));

    const removed = allAssignments
      .filter((m) => m.id && !desiredIdSet.has(String(m.id)))
      .map((m) => m.assignmentId)
      .filter((id): id is number => id != null);

    onSave({ added, removed });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='3xl'>
      <Modal.Header title='모델 추가/제거' onClose={onClose} />

      <Modal.Body className='flex gap-3 px-6 py-4'>
        {/* 좌측 패널 */}
        <div className='flex-1 border border-neutral-200 rounded-lg flex flex-col h-80'>
          <div className='px-3 py-2.5 border-b border-neutral-200 shrink-0'>
            <SearchBar
              type='assignments'
              layout='compact'
              onSearch={handleSearch}
            />
          </div>

          <div className='flex-1 overflow-y-auto'>
            {leftList.length === 0 ? (
              <div className='h-full flex items-center justify-center text-xs text-neutral-400'>
                검색 결과가 없습니다.
              </div>
            ) : (
              <>
                {leftList.map((candidate) => (
                  <label
                    key={candidate.id}
                    className={clsx(
                      'px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors',
                      leftChecked.has(candidate.id)
                        ? 'bg-neutral-100/60'
                        : 'hover:bg-neutral-50'
                    )}
                  >
                    <input
                      type='checkbox'
                      checked={leftChecked.has(candidate.id)}
                      onChange={() => toggleLeftCheck(candidate.id)}
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
                추가된 모델이 없습니다.
              </div>
            ) : (
              rightList.map((candidate) => (
                <label
                  key={candidate.id}
                  className={clsx(
                    'px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors',
                    rightChecked.has(candidate.id)
                      ? 'bg-neutral-100/60'
                      : 'hover:bg-neutral-50'
                  )}
                >
                  <input
                    type='checkbox'
                    checked={rightChecked.has(candidate.id)}
                    onChange={() => toggleRightCheck(candidate.id)}
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

export default AddAssignmentModal;
