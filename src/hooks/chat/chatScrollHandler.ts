import { type UIEventHandler, useCallback, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import useWindowSizeCustom from '@/hooks/chat/useWindowSizeHandler';
import {
  chatScrollDataAtom,
  messagesEndRefAtom,
  messagesStartRefAtom,
  scrollContentRefAtom,
} from '@/store/chat/scroll';
import { chatFamilyAtom, currentChatIdAtom } from '@/store/chat/chat';

export const useChatScrollHandler = () => {
  const currentChatId = useAtomValue(currentChatIdAtom);
  const chatData = useAtomValue(chatFamilyAtom(currentChatId));
  const isGenerating = chatData.isGenerating;
  const messagesData = chatData.messages;

  const [chatScrollData, setChatScrollData] = useAtom(chatScrollDataAtom);

  const messagesStartRef = useAtomValue(messagesStartRefAtom);
  const messagesEndRef = useAtomValue(messagesEndRefAtom);
  const scrollContentRef = useAtomValue(scrollContentRefAtom);

  useEffect(() => {
    setChatScrollData({ userScrolled: false });
    if (!isGenerating && chatScrollData.userScrolled) {
      setChatScrollData({ userScrolled: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  useEffect(() => {
    // 메시지가 있을 때 스크롤을 가장 아래로 (생성 중이거나 사용자가 스크롤하지 않은 경우)
    if (
      messagesData &&
      messagesData.length > 0 &&
      !chatScrollData.userScrolled
    ) {
      scrollToBottom();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData]);

  const { width, height } = useWindowSizeCustom();

  useEffect(() => {
    if (scrollContentRef.current) {
      const scrolledHeight =
        Math.floor(scrollContentRef.current.scrollHeight) -
        Math.floor(scrollContentRef.current.scrollTop);
      const bottom =
        scrolledHeight <=
          Math.floor(scrollContentRef.current.clientHeight) + 1 &&
        scrolledHeight >= Math.floor(scrollContentRef.current.clientHeight) - 1;
      setChatScrollData({ isAtBottom: bottom });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback((e) => {
    const target = e.target as HTMLDivElement;

    const scrolledHeight =
      Math.floor(target.scrollHeight) - Math.floor(target.scrollTop);
    const bottom =
      scrolledHeight <= Math.floor(target.clientHeight) + 1 &&
      scrolledHeight >= Math.floor(target.clientHeight) - 1;
    setChatScrollData({ isAtBottom: bottom });

    const top = target.scrollTop === 0;
    setChatScrollData({ isAtTop: top });

    if (!bottom && !chatScrollData.isAutoScrolling) {
      setChatScrollData({ userScrolled: true });
    } else {
      setChatScrollData({ userScrolled: false });
    }

    const isOverflow = target.scrollHeight > target.clientHeight;

    // 한 번에 모든 상태 업데이트
    setChatScrollData({ isOverflowing: isOverflow });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToTop = useCallback(() => {
    if (messagesStartRef.current) {
      messagesStartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = useCallback(() => {
    setChatScrollData({ isAutoScrolling: true });

    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      setChatScrollData({ isAutoScrolling: false });
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    chatScrollData,
    messagesStartRef,
    messagesEndRef,
    scrollContentRef,
    handleScroll,
    scrollToTop,
    scrollToBottom,
  };
};
