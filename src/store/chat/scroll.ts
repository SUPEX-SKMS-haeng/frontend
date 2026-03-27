import { type IChatScroll } from '@/types/chat/chat';
import { atom } from 'jotai';
import type { MutableRefObject } from 'react';

export const messagesStartRefAtom = atom<
  MutableRefObject<HTMLDivElement | null>
>({
  current: null,
});
export const messagesEndRefAtom = atom<MutableRefObject<HTMLDivElement | null>>(
  {
    current: null,
  }
);
export const scrollContentRefAtom = atom<
  MutableRefObject<HTMLDivElement | null>
>({
  current: null,
});

export const chatScrollAtom = atom<IChatScroll>({
  isAtTop: false,
  isAtBottom: true,
  userScrolled: false,
  isOverflowing: false,
  isAutoScrolling: false,
});

export const chatScrollDataAtom = atom(
  (get) => get(chatScrollAtom),
  (get, set, update: Partial<IChatScroll>) => {
    set(chatScrollAtom, { ...get(chatScrollAtom), ...update });
  }
);
