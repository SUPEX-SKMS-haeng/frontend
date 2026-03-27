import type { IAbortData, IChat } from '@/types/chat/chat';
import type { LlmAssignment } from '@/types/chat/llmGateway';
import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';

/** 현재 화면에 보이는 채팅 ID  */
export const currentChatIdAtom = atom<string>('-1');
/** 활성화된 (atom 저장된) 채팅 ID 목록 : 최대 5개 */
export const activeChatIdsAtom = atom<string[]>([]);

/** 채팅 데이터 */
/** id : 채팅방 ID */
export const chatAtom = atom<{ [id: string]: IChat }>({});
export const chatDataAtom = atom(
  (get) => get(chatAtom),
  (get, set, update: { id: string; data: Partial<IChat> }) => {
    set(chatAtom, {
      ...get(chatAtom),
      [update.id]: {
        ...get(chatAtom)[update.id],
        ...update.data,
      },
    });
  }
);
/** 채팅 데이터 family */
export const chatFamilyAtom = atomFamily((id: string) =>
  atom(
    (get) =>
      get(chatAtom)[id] || {
        chatId: id,
        title: '',
        messages: [],
        isGenerating: false,
      }
  )
);

/** abort 가능한 메시지 상태 */
/** id : 채팅방 ID */
export const abortAtom = atom<{ [id: string]: IAbortData }>({});
export const abortDataAtom = atom(
  (get) => get(abortAtom),
  (get, set, update: { id?: string; data?: Partial<IAbortData> }) => {
    // 다른 채팅을 중단시키지 않고, 현재 채팅만 업데이트
    set(
      abortAtom,
      update.id
        ? {
            ...get(abortAtom), // 기존 데이터 유지
            [update.id]: {
              isAbort: update.data?.isAbort || false,
              abortController:
                update.data?.abortController || new AbortController(),
            },
          }
        : {}
    );
  }
);
export const abortFamilyAtom = atomFamily((id: string) =>
  atom((get) => get(abortAtom)[id])
);

export const selectedModelAtom = atom<LlmAssignment | null>(null);
