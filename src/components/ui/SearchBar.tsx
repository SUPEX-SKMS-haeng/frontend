import { useState } from 'react';
import type {
  SearchType,
  SearchCategoryOption,
  SearchBarFilter,
} from '@/types/admin/search';
import { Select } from '@/components/ui/Select';

// 타입별 표시 설정 (카테고리 옵션 / 레이블 / placeholder)
// 동작(검색 시 무엇을 할지)은 onSearch 콜백으로 외부에서 주입
interface SearchConfig {
  categoryOptions: SearchCategoryOption[];
  label?: string;
  placeholder?: string;
}

const SEARCH_CONFIG: Record<SearchType, SearchConfig> = {
  users: {
    categoryOptions: [
      { value: '', label: '전체' },
      { value: 'username', label: '이름' },
      { value: 'company', label: '회사' },
    ],
    label: '상세 검색',
  },
  organizations: {
    categoryOptions: [
      { value: '', label: '전체' },
      { value: 'name', label: '이름' },
      { value: 'description', label: '설명' },
    ],
    label: '상세 검색',
  },
  members: {
    categoryOptions: [
      { value: '', label: '전체' },
      { value: 'username', label: '이름' },
      { value: 'company', label: '회사' },
    ],
  },
  deployments: {
    categoryOptions: [
      { value: '', label: '전체' },
      { value: 'provider', label: 'Provider' },
      { value: 'model_name', label: 'Model' },
      { value: 'deployment_name', label: 'Deployment Name' },
    ],
    label: '상세 검색',
  },
  assignments: {
    categoryOptions: [
      { value: '', label: '전체' },
      { value: 'provider', label: 'Provider' },
      { value: 'model_name', label: 'Model' },
      { value: 'deployment_name', label: 'Deployment Name' },
    ],
  },
  prompts: {
    categoryOptions: [
      { value: '', label: '전체' },
      { value: 'agent_name', label: 'Agent' },
      { value: 'prompt_type', label: 'Type' },
      { value: 'prompt_name', label: '이름' },
    ],
  },
};

// Props
export interface SearchBarProps {
  /** 도메인 타입. 카테고리 옵션·레이블·레이아웃을 결정합니다. */
  type: SearchType;
  /**
   * 조회 버튼 클릭 또는 Enter 시 현재 입력값을 SearchBarFilter 형태로 전달합니다.
   * 검색 후 어떤 상태를 업데이트할지는 호출자가 결정합니다.
   */
  onSearch: (filter: SearchBarFilter) => void;
  /** 레이아웃 강제 지정. 미지정 시 'default'로 결정됩니다. */
  layout?: 'default' | 'compact';
}

// 컴포넌트 — 렌더링과 로컬 입력 상태만 담당
const SearchBar = ({ type, onSearch, layout }: SearchBarProps) => {
  const {
    categoryOptions,
    label,
    placeholder = '검색어를 입력해주세요.',
  } = SEARCH_CONFIG[type];

  const [filter, setFilter] = useState<SearchBarFilter>({
    searchCategory: '',
    searchKeyword: '',
  });

  const resolvedLayout = layout ?? 'default';
  const isDefault = resolvedLayout === 'default';

  const wrapperClass = isDefault
    ? 'flex items-end gap-6 w-full'
    : 'flex items-center gap-2 w-full';
  const buttonClass = isDefault
    ? 'h-9 px-6 bg-neutral-800 hover:bg-neutral-900 text-white text-sm font-medium rounded-lg transition-colors shrink-0'
    : 'h-8 px-3 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-medium rounded-lg transition-colors shrink-0';

  const handleSearch = () => onSearch(filter);

  const selectInputGroup = (
    <div className='flex flex-1 items-center gap-2 min-w-0'>
      <Select
        size={isDefault ? 'md' : 'sm'}
        value={filter.searchCategory}
        onChange={(e) =>
          setFilter((prev) => ({ ...prev, searchCategory: e.target.value }))
        }
        className='w-32 shrink-0'
      >
        {categoryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <input
        type='text'
        value={filter.searchKeyword}
        onChange={(e) =>
          setFilter((prev) => ({ ...prev, searchKeyword: e.target.value }))
        }
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={placeholder}
        className={
          isDefault
            ? 'h-9 flex-1 min-w-0 px-3 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
            : 'h-8 flex-1 min-w-0 px-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500 transition-colors'
        }
      />
    </div>
  );

  return (
    <div className={wrapperClass}>
      {isDefault ? (
        <div className='flex flex-col gap-1.5 flex-1 min-w-0'>
          {label && (
            <label className='text-xs font-semibold text-neutral-600'>
              {label}
            </label>
          )}
          {selectInputGroup}
        </div>
      ) : (
        selectInputGroup
      )}
      <button type='button' onClick={handleSearch} className={buttonClass}>
        조회
      </button>
    </div>
  );
};

export default SearchBar;
