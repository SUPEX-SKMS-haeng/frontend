import type { Deployment } from '@/types/admin/deployment';

export type AssignmentStatus = '활성' | '비활성';

export type Assignment = Pick<
  Deployment,
  | 'provider'
  | 'model'
  | 'version'
  | 'deploymentName'
  | 'endpoint'
  | 'accessKey'
  | 'status'
> & {
  assignmentId?: number;
  id: string | number;
  createdAt?: string;
};

export interface AssignmentCandidate {
  id: string | number;
  provider: string;
  model: string;
  version: string;
}

// ----- API 응답용 -----
export interface ILLMAssignment {
  assignmentId: number;
  deploymentId: number;
  provider: string;
  modelName: string;
  modelVersion: string;
  deploymentName: string;
  endpoint: string | null;
  accessKey: string | null;
  isActive: boolean;
}

export interface ILLMAssignmentByOrgResponse {
  orgId: number;
  assignmentList: ILLMAssignment[];
  totalCount: number;
  nextOffset: number;
}
