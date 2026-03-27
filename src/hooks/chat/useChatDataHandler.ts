import {
  activeChatIdsAtom,
  chatDataAtom,
  chatFamilyAtom,
  currentChatIdAtom,
} from '@/store/chat/chat';
import type { IMessage } from '@/types/chat/message';
import { useAtom, useStore } from 'jotai';
import { useCallback } from 'react';

export const messageResponseToIMessage = (messages?: any[]): IMessage[] => {
  return (
    messages?.map((message) => {
      return {
        role: message.role,
        uuid: message.messageId,
        content: message.content,
        timestamp: message.timestamp,
        isCancelled: message.cancelled,
        thoughts: [],
        citations: [],
      };
    }) || []
  );
};

export const useChatDataHandler = () => {
  const store = useStore();
  const [, setChatData] = useAtom(chatDataAtom);
  const [, setActiveChatIds] = useAtom(activeChatIdsAtom);
  const [, setCurrentChatId] = useAtom(currentChatIdAtom);

  const manageActiveChatIds = async (newChatId: string) => {
    setActiveChatIds((prev) => {
      // 이미 있으면 맨 앞으로 이동 (최근 사용)
      if (prev.includes(newChatId)) {
        return [newChatId, ...prev.filter((id) => id !== newChatId)];
      }
      // 새로운 채팅 추가
      const updated = [newChatId, ...prev];

      // 20개 초과시 가장 오래된 것 제거
      if (updated.length > 20) {
        console.log('manageActiveChatIds :: ', updated);
        const removedId = updated.pop()!;

        // 제거된 채팅의 atom 데이터도 정리
        setChatData({
          id: removedId,
          data: {
            chatId: removedId,
            title: '',
            messages: [],
            isGenerating: false,
          },
        });
        console.log('isGenerating :: false');
        // atomFamily 인스턴스도 제거
        chatFamilyAtom.remove(removedId);
      }

      return updated;
    });
  };

  // 채팅 히스토리에서 채팅 데이터 로드 및 세팅
  const setChatDataByHistory = async (targetChatId: string) => {
    const chatData = store.get(chatFamilyAtom(targetChatId));

    // 채팅 중인 채팅방은 히스토리 로드하지 않음 (스트리밍 데이터 보존)
    if (
      chatData?.isGenerating &&
      (chatData?.chatId === '-1' || chatData?.chatId === targetChatId)
    ) {
      console.log('현재 채팅응답 중인 채팅방 진입, chatId: ', chatData?.chatId);
      await manageActiveChatIds(targetChatId);
      setCurrentChatId(targetChatId);
      return;
    }

    try {
      // const response = await getHistoryMessagesByChatId(targetChatId);
      // chatFamilyAtom 에 데이터 세팅
      setChatData({
        id: targetChatId,
        data: {
          chatId: targetChatId,
          title: chatData?.title || '',
          messages: [], //messageResponseToIMessage(response?.history),
          isGenerating: false,
        },
      });
      // active chat ids atom 에 채팅 아이디 추가
      await manageActiveChatIds(targetChatId);
      setCurrentChatId(targetChatId);
    } catch (e) {
      console.error(e);
    }
  };

  const initChatData = useCallback(() => {
    setCurrentChatId('-1');
    setChatData({
      id: '-1',
      data: {
        chatId: '-1',
        title: '',
        messages: [],
        isGenerating: false,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    setChatDataByHistory,
    manageActiveChatIds,
    initChatData,
  };
};
