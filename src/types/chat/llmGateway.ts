export interface LlmAssignment {
  assignmentId: number;
  deploymentId: number;
  provider: string;
  modelName: string;
  modelVersion: string;
  deploymentName: string;
  isActive: boolean;
  endpoint: string;
  accessKey: string;
}

export interface LlmAssignmentResponse {
  orgId: number;
  assignmentList: {
    assignmentId: number;
    deploymentId: number;
    provider: string;
    modelName: string;
    modelVersion: string;
    deploymentName: string;
    isActive: boolean;
    endpoint: string;
    accessKey: string;
  }[];
}
