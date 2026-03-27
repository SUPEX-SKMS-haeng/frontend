import type {
  IMessageInfo,
  IMessageJsonResponse,
  IMessageRequest,
} from '@/types/chat/message';
import { axiosInstance } from '@/lib/axios';
import { toSnakeCase } from '@/utils/caseConverter';

const URL_PREFIX = `/chat`;

export const chatSimpleApi = async (
  messages: IMessageRequest[],
  info: IMessageInfo,
  _parseCallback?: (streamValue: any) => Promise<void>,
  _signal?: AbortSignal
) => {
  const response = await axiosInstance.post(`${URL_PREFIX}/simple`, {
    messages,
    orgId: info.orgId,
    scopeType: info.scopeType,
    scopeValue: info.scopeValue,
    provider: info.provider,
    model: info.model,
    stream: false,
  });
  return response.data as IMessageJsonResponse;
};

export async function chatStreamApi(
  messages: IMessageRequest[],
  info: IMessageInfo,
  parseCallback?: (streamValue: any) => Promise<void>,
  signal?: AbortSignal
): Promise<any> {
  const body = toSnakeCase({
    messages,
    orgId: info.orgId,
    scopeType: info.scopeType,
    scopeValue: info.scopeValue,
    provider: info.provider,
    model: info.model,
    stream: true,
  });

  const response = await fetch(`/api/v1${URL_PREFIX}/simple`, {
    signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'text/event-stream',
    },
    body: JSON.stringify(body),
  });

  const responseBody = response.body;
  if (!(responseBody instanceof ReadableStream)) {
    throw new Error('Failed to send message');
  }
  const reader = responseBody?.getReader();
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

export const chatCancelApi = async (chatId: string) => {
  const response = await axiosInstance.post(`/chat/${chatId}/cancel`);
  return response;
};
