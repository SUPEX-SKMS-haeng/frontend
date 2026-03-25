import { useCallback, useMemo } from 'react';
import { useAtom } from 'jotai';
import { selectedConversationIdAtom, conversationsAtom, messagesMapAtom } from '@/store/chatAtom';
import type { Conversation, Message } from '@/types/chat';

interface ActiveStream {
  delayTimer: ReturnType<typeof setTimeout> | null;
  streamTimer: ReturnType<typeof setInterval> | null;
}

const activeStreams = new Map<string, ActiveStream>();

const clearStreamTimers = (conversationId: string) => {
  const stream = activeStreams.get(conversationId);
  if (!stream) return;
  if (stream.delayTimer) clearTimeout(stream.delayTimer);
  if (stream.streamTimer) clearInterval(stream.streamTimer);
  activeStreams.delete(conversationId);
};

export const useChat = () => {
  const [selectedConversationId, setSelectedConversationId] = useAtom(selectedConversationIdAtom);
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const [messagesMap, setMessagesMap] = useAtom(messagesMapAtom);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const isGenerating = selectedConversation?.status === 'generating';
  const isStreaming = selectedConversation?.status === 'streaming';

  const currentMessages = useMemo(
    () => (selectedConversationId ? messagesMap.get(selectedConversationId) ?? [] : []),
    [messagesMap, selectedConversationId],
  );

  const addMessage = useCallback(
    (conversationId: string, message: Message) => {
      setMessagesMap((prev) => {
        const next = new Map(prev);
        const messages = next.get(conversationId) ?? [];
        next.set(conversationId, [...messages, message]);
        return next;
      });
    },
    [setMessagesMap],
  );

  const updateMessage = useCallback(
    (conversationId: string, messageId: string, updates: Partial<Message>) => {
      setMessagesMap((prev) => {
        const messages = prev.get(conversationId);
        if (!messages) return prev;
        const next = new Map(prev);
        next.set(
          conversationId,
          messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
        );
        return next;
      });
    },
    [setMessagesMap],
  );

  const updateConversationStatus = useCallback(
    (conversationId: string, updates: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, ...updates } : c)),
      );
    },
    [setConversations],
  );

  const simulateMockResponse = useCallback(
    (conversationId: string, content: string, onComplete?: (convId: string, title: string) => void) => {
      clearStreamTimers(conversationId);
      updateConversationStatus(conversationId, { status: 'generating' });

      const fullText = `"${content}"에 대해 답변드리겠습니다.\n\n이것은 **스트리밍 응답**을 시뮬레이션하는 Mock 데이터입니다. 실제 API 연동 시에는 서버에서 전송되는 청크 단위로 텍스트가 업데이트됩니다.`;
      const messageId = `msg-${Date.now() + 1}`;

      const stream: ActiveStream = { delayTimer: null, streamTimer: null };
      activeStreams.set(conversationId, stream);

      stream.delayTimer = setTimeout(() => {
        stream.delayTimer = null;
        updateConversationStatus(conversationId, { status: 'streaming' });

        const assistantMessage: Message = {
          id: messageId,
          conversationId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
        };

        addMessage(conversationId, assistantMessage);

        let charIndex = 0;
        const chunkSize = 3;

        stream.streamTimer = setInterval(() => {
          charIndex += chunkSize;

          if (charIndex >= fullText.length) {
            updateMessage(conversationId, messageId, { content: fullText });
            if (stream.streamTimer) {
              clearInterval(stream.streamTimer);
              stream.streamTimer = null;
            }
            activeStreams.delete(conversationId);
            updateConversationStatus(conversationId, { status: 'idle' });

            if (onComplete) {
              const title = content.length > 20 ? content.slice(0, 20) : content;
              onComplete(conversationId, title);
            }
            return;
          }

          updateMessage(conversationId, messageId, { content: fullText.slice(0, charIndex) });
        }, 30);
      }, 1500);
    },
    [addMessage, updateMessage, updateConversationStatus],
  );

  const createNewChat = useCallback(
    (initialMessage: string) => {
      const newConversationId = `conv-${Date.now()}`;
      const now = new Date().toISOString();

      const newConversation: Conversation = {
        id: newConversationId,
        title: '채팅 중',
        status: 'generating',
        createdAt: now,
        updatedAt: now,
      };

      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversationId(newConversationId);

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: newConversationId,
        role: 'user',
        content: initialMessage,
        createdAt: now,
      };

      addMessage(newConversationId, userMessage);

      simulateMockResponse(newConversationId, initialMessage, (convId, title) => {
        updateConversationStatus(convId, { title, updatedAt: new Date().toISOString() });
      });
    },
    [setConversations, setSelectedConversationId, addMessage, simulateMockResponse, updateConversationStatus],
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (!selectedConversationId) {
        createNewChat(content);
        return;
      }

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversationId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      addMessage(selectedConversationId, userMessage);

      simulateMockResponse(selectedConversationId, content);
    },
    [selectedConversationId, createNewChat, addMessage, simulateMockResponse],
  );

  const stopGeneration = useCallback(() => {
    if (selectedConversationId) {
      clearStreamTimers(selectedConversationId);
      updateConversationStatus(selectedConversationId, { status: 'idle' });
    }
  }, [selectedConversationId, updateConversationStatus]);

  const startNewChat = useCallback(() => {
    setSelectedConversationId(null);
  }, [setSelectedConversationId]);

  const selectConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
    },
    [setSelectedConversationId],
  );

  return {
    conversations,
    selectedConversationId,
    selectedConversation,
    currentMessages,
    isGenerating,
    isStreaming,
    createNewChat,
    sendMessage,
    stopGeneration,
    startNewChat,
    selectConversation,
  };
};
