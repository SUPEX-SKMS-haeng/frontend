export interface QuotaAgent {
  agentId: number;
  agentName: string;
  outputMaxTokens: number;
}

export interface QuotaUsage {
  orgId: number;
  monthlyLimit: number | null;
  monthlyUsed: number | null;
  monthlyRemaining: number | null;
  dailyLimit: number | null;
  dailyUsed: number | null;
  dailyRemaining: number | null;
  agentList: QuotaAgent[];
  totalCount: number;
  nextOffset: number;
}

// ----- API 응답용 -----
export interface IQuotaAgentResponse {
  agentId: number | null;
  agentName: string | null;
  outputMaxTokens: number | null;
}

export interface IQuotaUsageResponse {
  orgId: number | null;
  monthlyLimit: number | null;
  monthlyUsed: number | null;
  monthlyRemaining: number | null;
  dailyLimit: number | null;
  dailyUsed: number | null;
  dailyRemaining: number | null;
  agentList: IQuotaAgentResponse[];
  totalCount: number;
  nextOffset: number;
}

export interface IUpdateQuotaRequest {
  monthlyLimit?: number | null;
  dailyLimit?: number | null;
  agentUpdates?: {
    agentId: number;
    outputMaxTokens: number;
  }[];
}

export interface IQuotaUpdateResponse {
  orgId: number;
  monthlyLimit: number;
  dailyLimit: number;
  createDt: string | null;
  updateDt: string | null;
  agentList: IQuotaAgentResponse[];
}
