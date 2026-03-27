// SearchBar가 지원하는 도메인 타입
export type SearchType =
  | 'users'
  | 'organizations'
  | 'members'
  | 'deployments'
  | 'assignments'
  | 'prompts';

// 검색 카테고리 옵션 (Select 옵션용)
export interface SearchCategoryOption {
  value: string;
  label: string;
}

// SearchBar 공용 필터 — 모든 도메인의 searchFilter atom이 이 형태를 공유
export interface SearchBarFilter {
  searchCategory: string;
  searchKeyword: string;
}
