export type PromptStatus = '활성' | '비활성';

export interface Prompt {
  assignmentId: number;
  promptId: number;
  agentName: string;
  promptType: string;
  promptName: string;
  promptDescription: string | null;
  promptContent: string;
  promptVersion: string;
  status: PromptStatus;
}

export interface CreatePromptForm {
  agentName: string;
  promptType: string;
  promptName: string;
  promptDescription: string | null;
  promptVersion: string;
  promptContent: string;
  isActive: boolean;
}

export interface EditPromptForm extends CreatePromptForm {
  promptId: number | string;
}

export interface PromptSearchFilter {
  searchCategory: string;
  searchKeyword: string;
}

// ----- API 응답용 -----
export interface IPromptItemResponse {
  assignmentId: number;
  promptId: number;
  agentName: string;
  promptType: string;
  promptName: string;
  promptDescription: string | null;
  promptContent: string;
  promptVersion: string;
  isActive: boolean;
}

export interface IPromptListResponse {
  items: IPromptItemResponse[];
  totalCount: number;
  nextOffset?: number;
}

export interface IGetPromptListParams {
  orgId: number | string | null;
  offset: number;
  limit: number;
  searchCategory?: string;
  searchKeyword?: string;
  order?: 'asc' | 'desc';
  sort?: string;
}

// ----- API 요청용 -----
export interface ICreatePromptRequest {
  orgId: number;
  agentName: string;
  name: string;
  type: string;
  description?: string | null;
  content?: string | null;
  version: string;
  isActive?: boolean;
}

export interface IUpdatePromptRequest {
  orgId: number;
  agentName: string;
  name: string;
  type?: string;
  description?: string | null;
  content: string;
  version: string;
  isActive: boolean;
}

export interface IUpdateIsActiveRequest {
  orgId: number;
  isActive: boolean;
}
