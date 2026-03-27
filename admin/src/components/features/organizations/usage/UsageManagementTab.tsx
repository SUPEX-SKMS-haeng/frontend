import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  Bot,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Settings2,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { getQuotaUsageAtom, updateQuotaAtom } from '@/hooks/useQuotaData';
import {
  quotaCurrentPageAtom,
  quotaSortStateAtom,
  quotaUsageParamsAtom,
} from '@/store/quotaUI';
import type { QuotaAgent } from '@/types/quota';

interface UsageManagementTabProps {
  organizationId: string | number | undefined;
  organizationName: string;
}

interface QuotaState {
  dailyThreshold: number | null;
  monthlyThreshold: number | null;
}

interface UsageCardProps {
  icon: ReactNode;
  title: string;
  threshold: number | null;
  used: number | null;
  remaining: number | null;
  percent: number;
  isEditMode: boolean;
  editValue: number | null;
  inputLabel: string;
  onInputChange?: (value: string) => void;
  format: (value: number | null) => string;
}

const UsageCard = ({
  icon,
  title,
  threshold,
  used,
  remaining,
  percent,
  isEditMode,
  editValue,
  inputLabel,
  onInputChange,
  format,
}: UsageCardProps) => {
  return (
    <div className='min-h-[280px] rounded-xl border border-neutral-200 bg-white p-6'>
      <div className='mb-5 flex items-center gap-2'>
        {icon}
        <h4 className='text-sm font-semibold text-neutral-900'>{title}</h4>
      </div>

      <div className='space-y-3 text-sm'>
        <div className='flex items-center justify-between'>
          <span className='text-neutral-500'>전체 할당량</span>
          <span className='font-medium text-neutral-900'>{format(threshold)}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-neutral-500'>현재 사용량</span>
          <span className='font-medium text-neutral-900'>{format(used)}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-neutral-500'>잔여 토큰</span>
          <span className='font-semibold text-green-600'>{format(remaining)}</span>
        </div>
      </div>

      <div className='mt-6'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-neutral-100'>
          <div
            className='h-full bg-neutral-800 transition-all'
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className='relative mt-3 h-5'>
          <span
            className='absolute -translate-x-1/2 text-xs text-neutral-500'
            style={{ left: `${percent}%` }}
          >
            {percent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className='mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <span className='inline-flex h-5 w-5 items-center justify-center rounded bg-neutral-200 text-neutral-600'>
              <Settings2 className='h-3 w-3' />
            </span>
            <label className='text-sm font-medium text-neutral-600'>
              {inputLabel}
            </label>
          </div>
          {isEditMode ? (
            <input
              type='number'
              min={0}
              value={editValue ?? 0}
              onChange={(e) => onInputChange?.(e.target.value)}
              className='h-8 w-40 rounded-lg border border-neutral-300 bg-white px-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-800/10'
            />
          ) : (
            <div className='flex h-8 w-40 items-center rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-700'>
              {format(threshold)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UsageManagementTab = ({
  organizationId,
  organizationName: _organizationName,
}: UsageManagementTabProps) => {
  const { data: quotaUsage, isLoading, isError } = useAtomValue(getQuotaUsageAtom);
  const [updateMutation] = useAtom(updateQuotaAtom);
  const [params, setParams] = useAtom(quotaUsageParamsAtom);
  const [currentPage, setCurrentPage] = useAtom(quotaCurrentPageAtom);
  const [sortState, setSortState] = useAtom(quotaSortStateAtom);

  const [savedQuota, setSavedQuota] = useState<QuotaState>({
    dailyThreshold: 0,
    monthlyThreshold: 0,
  });
  const [draftQuota, setDraftQuota] = useState<QuotaState>({
    dailyThreshold: 0,
    monthlyThreshold: 0,
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const [savedAgentConfigs, setSavedAgentConfigs] = useState<QuotaAgent[]>([]);
  const [draftAgentConfigs, setDraftAgentConfigs] = useState<QuotaAgent[]>([]);

  const currentQuota = isEditMode ? draftQuota : savedQuota;
  const currentAgentConfigs = isEditMode ? draftAgentConfigs : savedAgentConfigs;

  useEffect(() => {
    if (isEditMode || quotaUsage == null) return;

    const nextQuota: QuotaState = {
      dailyThreshold: quotaUsage.dailyLimit,
      monthlyThreshold: quotaUsage.monthlyLimit,
    };
    const nextAgents = quotaUsage.agentList ?? [];

    setSavedQuota(nextQuota);
    setDraftQuota(nextQuota);
    setSavedAgentConfigs(nextAgents);
    setDraftAgentConfigs(nextAgents.map((agent) => ({ ...agent })));
  }, [quotaUsage, isEditMode]);

  const usage = {
    usedDaily: quotaUsage?.dailyUsed ?? null,
    usedMonthly: quotaUsage?.monthlyUsed ?? null,
    dailyRemaining: quotaUsage?.dailyRemaining ?? null,
    monthlyRemaining: quotaUsage?.monthlyRemaining ?? null,
  };

  const dailyPercent = useMemo(() => {
    if (currentQuota.dailyThreshold == null || currentQuota.dailyThreshold <= 0) {
      return 0;
    }
    if (usage.usedDaily == null) return 0;
    return Math.min(100, (usage.usedDaily / currentQuota.dailyThreshold) * 100);
  }, [currentQuota.dailyThreshold, usage.usedDaily]);

  const monthlyPercent = useMemo(() => {
    if (currentQuota.monthlyThreshold == null || currentQuota.monthlyThreshold <= 0) {
      return 0;
    }
    if (usage.usedMonthly == null) return 0;
    return Math.min(100, (usage.usedMonthly / currentQuota.monthlyThreshold) * 100);
  }, [currentQuota.monthlyThreshold, usage.usedMonthly]);

  const dailyRemaining =
    usage.dailyRemaining ??
    (currentQuota.dailyThreshold != null && usage.usedDaily != null
      ? Math.max(0, currentQuota.dailyThreshold - usage.usedDaily)
      : null);
  const monthlyRemaining =
    usage.monthlyRemaining ??
    (currentQuota.monthlyThreshold != null && usage.usedMonthly != null
      ? Math.max(0, currentQuota.monthlyThreshold - usage.usedMonthly)
      : null);

  const handleQuotaChange = (
    key: 'dailyThreshold' | 'monthlyThreshold',
    value: string
  ) => {
    const parsed = Number(value.replace(/,/g, ''));
    setDraftQuota((prev) => ({ ...prev, [key]: Number.isNaN(parsed) ? 0 : parsed }));
  };

  const handleAgentTokenChange = (agentId: number, value: string) => {
    const parsed = Number(value.replace(/,/g, ''));
    setDraftAgentConfigs((prev) =>
      prev.map((item) =>
        item.agentId === agentId
          ? { ...item, outputMaxTokens: Number.isNaN(parsed) ? 0 : parsed }
          : item
      )
    );
  };

  const handleAgentSort = (field: 'agentName' | 'outputMaxTokens') => {
    const apiSortBy = field === 'agentName' ? 'agent_name' : 'output_max_tokens';
    const nextOrder =
      sortState.field === field && sortState.order === 'asc' ? 'desc' : 'asc';

    setSortState({ field, order: nextOrder });
    setParams((prev) => ({
      ...prev,
      sortBy: apiSortBy,
      order: nextOrder,
      offset: 0,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
    setCurrentPage(page);
  };

  useEffect(() => {
    setIsEditMode(false);
    setCurrentPage(1);
    setSortState({ field: 'agentName', order: 'asc' });
    setParams((prev) => ({
      ...prev,
      offset: 0,
      sortBy: 'agent_name',
      order: 'asc',
    }));
  }, [organizationId, setCurrentPage, setParams, setSortState]);

  const formatNumber = (value: number | null) =>
    value == null ? '-' : value.toLocaleString('ko-KR');

  const hasQuotaChanges =
    draftQuota.dailyThreshold !== savedQuota.dailyThreshold ||
    draftQuota.monthlyThreshold !== savedQuota.monthlyThreshold;

  const hasAgentChanges = draftAgentConfigs.some(
    (agent, idx) =>
      agent.agentName !== savedAgentConfigs[idx]?.agentName ||
      agent.outputMaxTokens !== savedAgentConfigs[idx]?.outputMaxTokens
  );
  const hasAnyChanges = hasQuotaChanges || hasAgentChanges;

  const agentTotalPages = Math.max(
    1,
    Math.ceil((quotaUsage?.totalCount ?? 0) / params.limit)
  );

  const handleSaveAll = async () => {
    if (organizationId == null) return;

    const changedAgentUpdates = draftAgentConfigs
      .filter(
        (agent, idx) =>
          agent.outputMaxTokens !== savedAgentConfigs[idx]?.outputMaxTokens
      )
      .map((agent) => ({
        agentId: agent.agentId,
        outputMaxTokens: agent.outputMaxTokens,
      }));

    try {
      await updateMutation.mutateAsync({
        orgId: organizationId,
        payload: {
          monthlyLimit: draftQuota.monthlyThreshold,
          dailyLimit: draftQuota.dailyThreshold,
          agentUpdates:
            changedAgentUpdates.length > 0 ? changedAgentUpdates : undefined,
        },
      });

      setSavedQuota({
        dailyThreshold: draftQuota.dailyThreshold,
        monthlyThreshold: draftQuota.monthlyThreshold,
      });
      setSavedAgentConfigs(draftAgentConfigs.map((agent) => ({ ...agent })));
      setIsEditMode(false);
      alert('사용량 설정이 저장되었습니다.');
    } catch (error) {
      console.error('사용량 저장 실패:', error);
      alert('사용량 저장에 실패했습니다.');
    }
  };

  const handleEditStart = () => {
    setDraftQuota({ ...savedQuota });
    setDraftAgentConfigs(savedAgentConfigs.map((agent) => ({ ...agent })));
    setIsEditMode(true);
  };

  const handleEditCancel = () => {
    setDraftQuota({ ...savedQuota });
    setDraftAgentConfigs(savedAgentConfigs.map((agent) => ({ ...agent })));
    setIsEditMode(false);
  };

  if (isLoading && quotaUsage == null) {
    return (
      <div className='h-full flex items-center justify-center text-sm text-neutral-500'>
        사용량 정보를 불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className='h-full flex items-center justify-center text-sm text-red-500'>
        사용량 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <UsageCard
          icon={<CalendarDays className='h-4 w-4 text-purple-600' />}
          title='월별 사용량'
          threshold={currentQuota.monthlyThreshold}
          used={usage.usedMonthly}
          remaining={monthlyRemaining}
          percent={monthlyPercent}
          isEditMode={isEditMode}
          editValue={draftQuota.monthlyThreshold}
          inputLabel='월간 Token Limit'
          onInputChange={(value) => handleQuotaChange('monthlyThreshold', value)}
          format={formatNumber}
        />
        <UsageCard
          icon={<Calendar className='h-4 w-4 text-blue-600' />}
          title='일별 사용량'
          threshold={currentQuota.dailyThreshold}
          used={usage.usedDaily}
          remaining={dailyRemaining}
          percent={dailyPercent}
          isEditMode={isEditMode}
          editValue={draftQuota.dailyThreshold}
          inputLabel='일간 Token Limit'
          onInputChange={(value) => handleQuotaChange('dailyThreshold', value)}
          format={formatNumber}
        />
      </div>

      <div className='rounded-xl border border-neutral-200 bg-white p-5'>
        <div className='mb-4 flex items-center gap-2'>
          <Bot className='h-4 w-4 text-neutral-700' />
          <h3 className='text-sm font-semibold text-neutral-900'>
            Agent 별 Output Max Tokens
          </h3>
        </div>

        <div className='overflow-hidden rounded-lg border border-neutral-200'>
          <table className='w-full text-sm'>
            <thead className='border-b border-neutral-200 bg-neutral-50'>
              <tr>
                <th className='px-4 py-3 text-left font-semibold text-neutral-600'>
                  <button
                    type='button'
                    disabled={isEditMode}
                    onClick={() => handleAgentSort('agentName')}
                    className={`inline-flex items-center gap-1.5 ${
                      isEditMode
                        ? 'cursor-not-allowed text-neutral-400'
                        : 'hover:text-neutral-800'
                    }`}
                  >
                    <span>Agent</span>
                    {sortState.field === 'agentName' ? (
                      sortState.order === 'asc' ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )
                    ) : (
                      <span className='flex flex-col leading-none text-neutral-300'>
                        <ChevronUp className='h-3 w-3 -mb-1' />
                        <ChevronDown className='h-3 w-3' />
                      </span>
                    )}
                  </button>
                </th>
                <th className='px-4 py-3 text-left font-semibold text-neutral-600'>
                  <button
                    type='button'
                    disabled={isEditMode}
                    onClick={() => handleAgentSort('outputMaxTokens')}
                    className={`inline-flex items-center gap-1.5 ${
                      isEditMode
                        ? 'cursor-not-allowed text-neutral-400'
                        : 'hover:text-neutral-800'
                    }`}
                  >
                    <span>Output Max Tokens</span>
                    {sortState.field === 'outputMaxTokens' ? (
                      sortState.order === 'asc' ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )
                    ) : (
                      <span className='flex flex-col leading-none text-neutral-300'>
                        <ChevronUp className='h-3 w-3 -mb-1' />
                        <ChevronDown className='h-3 w-3' />
                      </span>
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentAgentConfigs.map((agent) => (
                <tr
                  key={`${agent.agentId}-${agent.agentName}`}
                  className='border-b border-neutral-100 last:border-b-0'
                >
                  <td className='px-4 py-2 text-neutral-800'>{agent.agentName}</td>
                  <td className='px-4 py-2'>
                    {isEditMode ? (
                      <input
                        type='number'
                        min={0}
                        value={agent.outputMaxTokens}
                        onChange={(e) =>
                          handleAgentTokenChange(agent.agentId, e.target.value)
                        }
                        className='h-8 w-40 rounded-lg border border-neutral-300 px-3 text-sm text-neutral-900 transition-colors focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-800/10'
                      />
                    ) : (
                      <div className='flex h-8 w-40 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-700'>
                        {formatNumber(agent.outputMaxTokens)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {currentAgentConfigs.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className='px-4 py-8 text-center text-sm text-neutral-500'
                  >
                    조회된 agent가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isEditMode && (
          <div className='mt-4 flex items-center justify-end'>
            <Pagination
              currentPage={currentPage}
              totalPages={agentTotalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      </div>

      {!isEditMode ? (
        <div className='-mt-1 flex justify-end'>
          <button
            type='button'
            onClick={handleEditStart}
            disabled={updateMutation.isPending}
            className='h-9 rounded-lg bg-neutral-800 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-900'
          >
            편집
          </button>
        </div>
      ) : (
        <div className='-mt-1 flex justify-end gap-2'>
          <button
            type='button'
            onClick={handleEditCancel}
            disabled={updateMutation.isPending}
            className='h-9 rounded-lg border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50'
          >
            취소
          </button>
          <button
            type='button'
            onClick={handleSaveAll}
            disabled={!hasAnyChanges || updateMutation.isPending}
            className={`h-9 rounded-lg px-5 text-sm font-medium transition-colors ${
              hasAnyChanges && !updateMutation.isPending
                ? 'bg-neutral-800 text-white hover:bg-neutral-900'
                : 'cursor-not-allowed bg-neutral-100 text-neutral-400'
            }`}
          >
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UsageManagementTab;
