export type DeploymentStatus = '활성' | '비활성';

export interface Deployment {
  id: number;
  provider: string;
  model: string;
  version: string;
  deploymentName: string;
  endpoint: string;
  accessKey: string;
  status: DeploymentStatus;
  createdAt: string;
}

export interface CreateDeploymentForm {
  provider: string;
  model: string;
  version: string;
  deploymentName: string;
  endpoint: string;
  accessKey: string;
  isActive: boolean;
}

export interface EditDeploymentForm extends CreateDeploymentForm {
  id: number;
}

// ----- API 응답용 -----
export interface ILLMDeploymentItemResponse {
  id: number | null;
  provider: string | null;
  modelName: string | null;
  modelVersion: string | null;
  deploymentName: string | null;
  endpoint: string | null;
  accessKey: string | null;
  isActive: boolean | null;
  createDt: string | null;
  updateDt: string | null;
}

export interface ILLMDeploymentListResponse {
  deploymentList: ILLMDeploymentItemResponse[];
  totalCount: number;
  nextOffset: number;
}
