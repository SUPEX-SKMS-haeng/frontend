import { IMessageRequest } from '@/types/message';
import { axiosInstance } from '@shared/lib/axios';
import { toSnakeCase } from '@shared/utils/caseConverter';

const URL_PREFIX = `/agent`;

export interface IAgentHistory {
  id: number;
  traceId: string;
  query: string;
  answer: string | null;
  agentName: string;
  agentVersion: string;
  createDt: string;
}

/** 히스토리 조회 */
export const agentHistoryApi = async (offset = 0, limit = 20): Promise<IAgentHistory[]> => {
  const response = await axiosInstance.get(`${URL_PREFIX}/history`, {
    params: { offset, limit },
  });
  return response.data.data;
};

/** 히스토리 단건 조회 */
export const agentHistoryDetailApi = async (traceId: string): Promise<IAgentHistory> => {
  const response = await axiosInstance.get(`${URL_PREFIX}/history/${traceId}`);
  return response.data.data;
};

export interface IAgentRequest {
  query: string;
  chatHistory?: IMessageRequest[];
  agentName?: string;
  version?: string;
  provider?: string;
  model?: string;
  orgId?: string | number;
}

/** 비스트리밍 호출 */
export const agentInvokeApi = async (request: IAgentRequest) => {
  const response = await axiosInstance.post(`${URL_PREFIX}/invoke`, request);
  return response.data;
};

/** 스트리밍 호출 — Gateway SSE 포맷 (choices[0].delta.content) */
export async function agentStreamApi(
  request: IAgentRequest,
  parseCallback?: (streamValue: any) => Promise<void>,
  signal?: AbortSignal
): Promise<any> {
  const body = toSnakeCase(request);

  const response = await fetch(`/api/v1${URL_PREFIX}/stream`, {
    signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
  });

  const responseBody = response.body;
  if (!(responseBody instanceof ReadableStream)) {
    throw new Error('Failed to send message');
  }
  const reader = responseBody.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (!reader || done) {
      parseCallback?.('done');
      break;
    }
    const newString = decoder.decode(value, { stream: true });
    if (!response.ok || response.status > 200) {
      try {
        const error = JSON.parse(newString);
        throw new Error(error);
      } catch (e) {
        if (e instanceof Error) throw e;
        throw new Error('Failed to send message');
      }
    } else {
      await parseCallback?.(newString);
    }
  }

  return response;
}

/** 후처리 스트리밍 호출 */
export async function agentPostProcessStreamApi(
  request: IAgentRequest,
  parseCallback?: (streamValue: any) => Promise<void>,
  signal?: AbortSignal
): Promise<any> {
  const body = toSnakeCase(request);

  const response = await fetch(`/api/v1${URL_PREFIX}/stream/post-process`, {
    signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
  });

  const responseBody = response.body;
  if (!(responseBody instanceof ReadableStream)) {
    throw new Error('Failed to send message');
  }
  const reader = responseBody.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (!reader || done) {
      parseCallback?.('done');
      break;
    }
    const newString = decoder.decode(value, { stream: true });
    if (!response.ok || response.status > 200) {
      try {
        const error = JSON.parse(newString);
        throw new Error(error);
      } catch (e) {
        if (e instanceof Error) throw e;
        throw new Error('Failed to send message');
      }
    } else {
      await parseCallback?.(newString);
    }
  }

  return response;
}
