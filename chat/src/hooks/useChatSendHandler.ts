import {
  abortDataAtom,
  chatDataAtom,
  chatFamilyAtom,
  currentChatIdAtom,
  selectedAgentAtom,
  selectedModelAtom,
} from '@/store/chat';
import type {
  IMessage,
  IMessageInfo,
  IMessageJsonResponse,
  IMessageRequest,
  IMessageResponse,
  IThought,
} from '@/types/message';
import { useAtom, useAtomValue } from 'jotai';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { chatCancelApi, chatSimpleApi, chatStreamApi } from '@/api/chat';
import { agentStreamApi, IAgentRequest } from '@/api/agent';
import { useChatDataHandler } from '@/hooks/useChatDataHandler';
import { useToast } from './useToast';
import { v7 as uuidv7 } from 'uuid';
import { selectedGroupAtom } from '@shared/store/auth';
import { toCamelCase } from '@shared/utils/caseConverter';

// TODO: API 연동 완료 후 false로 변경
const USE_MOCK_RESPONSE = false;

export const useChatSendHandler = (chatId: string) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const [chatData] = useAtom(chatFamilyAtom(chatId)); // 현재 채팅 데이터
  const [, setChatData] = useAtom(chatDataAtom);
  const [, setCurrentChatId] = useAtom(currentChatIdAtom);
  const [abortData, setAbortData] = useAtom(abortDataAtom);
  const selectedGroup = useAtomValue(selectedGroupAtom);
  const selectedAgent = useAtomValue(selectedAgentAtom);
  const selectedModel = useAtomValue(selectedModelAtom);

  const messagesRef = useRef<IMessage[]>([]);
  const userUuid = useRef<string>(undefined);
  const botUuid = useRef<string>(undefined);
  const abortControllerRef = useRef<AbortController>(undefined);
  const lastUpdateTimeRef = useRef<number>(0); // 마지막 업데이트 시간

  const { manageActiveChatIds } = useChatDataHandler();
  const { showToast } = useToast();

  /** 사용자 채팅 입력 메시지로 채팅 메시지 생성 */
  const createUserMessage = (message: string) => {
    const newUserMessage: IMessage = {
      role: 'user',
      type: 'user',
      content: message,
      // timestamp: new Date().toISOString(),
      // isCancelled: false,
    };
    messagesRef.current = [...messagesRef.current, newUserMessage];
  };

  const getMessagesRequest = () => {
    const messagesRequest: IMessageRequest[] = messagesRef.current.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    return messagesRequest;
  };

  const getMessageInfo = () => {
    const messageInfo: IMessageInfo = {
      orgId: selectedGroup?.orgId ?? 0,
      // scopeType: 'user',
      // scopeValue: 'user',
      provider: selectedModel?.provider ?? 'openai',
      model: selectedModel?.modelName ?? 'gpt-5-mini',
    };
    return messageInfo;
  };

  /** assistant 메시지의 data 세팅 */
  const setAiMessageData = async (dataJson: IMessageResponse) => {
    const bufferStr = String.fromCharCode(9632);
    // const lastUserUuid = userUuid.current;
    const type = dataJson.type;
    const lastMessageData = messagesRef.current[messagesRef.current.length - 1] || null;

    let newMessage =
      lastMessageData.type === 'progress' || !lastMessageData?.content
        ? ''
        : lastMessageData.content.replace(bufferStr, '');

    newMessage += dataJson?.content?.replace(/\\\\/g, '\\');

    if (!newMessage) return;

    // 스트리밍 중에는 REF 태그를 그대로 유지 (원본)
    const messageData: IMessage = {
      ...lastMessageData,
      // uuid: dataJson.messageId,
      role: 'assistant',
      type,
      content: newMessage, // 원본 그대로
      // timestamp: dataJson.timestamp,
      // citations: [], // 스트리밍 중에는 비어있음
    };
    messagesRef.current = [
      ...messagesRef.current.slice(0, messagesRef.current.length - 1),
      messageData,
    ];
    console.log(messagesRef.current);
  };

  /** progress 메시지의 data 세팅 */
  const setThoughtData = (dataJson: IMessageResponse) => {
    // const lastMessageData =
    //   messagesRef.current[messagesRef.current.length - 1] || null;
    // if (!lastMessageData) return;
    // const thought: IThought = {
    //   step: dataJson?.step || '',
    //   message: dataJson?.message || '',
    // };
    // lastMessageData.thoughts = lastMessageData.thoughts
    //   ? [...lastMessageData.thoughts]
    //   : [thought];
    // messagesRef.current = [
    //   ...messagesRef.current.slice(0, messagesRef.current.length - 1),
    //   lastMessageData,
    // ];
    // console.log(messagesRef.current);
  };

  /** citation 메시지의 data 세팅 */
  // sko 미사용
  const setCitationData = (citation: any) => {
    // const lastMessageData =
    //   messagesRef.current[messagesRef.current.length - 1] || null;
    // if (!lastMessageData) return;
    // const citationData = parseCitation(citation);
    // if (!lastMessageData?.citations || !lastMessageData?.citations.length) {
    //   lastMessageData.citations = citationData;
    // }
    // // lastMessageData.parentUuid = userUuid.current;
    // messagesRef.current = [
    //   ...messagesRef.current.slice(0, messagesRef.current.length - 1),
    //   lastMessageData,
    // ];
  };

  const setCancelledData = (dataJson: IMessageResponse) => {
    const lastMessageData = messagesRef.current[messagesRef.current.length - 1] || null;
    if (!lastMessageData) return;

    const messageData: IMessage = {
      ...lastMessageData,
      role: 'assistant',
      type: dataJson.type,
      content: dataJson.message || dataJson.content || '',
      // timestamp: dataJson.timestamp,
      // isCancelled: true,
    };
    messagesRef.current = [
      ...messagesRef.current.slice(0, messagesRef.current.length - 1),
      messageData,
    ];
  };

  const checkIsAborted = (targetChatId: string) => {
    const isAbort = abortData?.[targetChatId]?.isAbort;
    console.log('checkIsAborted :: isAbort ? ', isAbort);
    if (isAbort && targetChatId) {
      console.log('abortData.abortController?.abort()');
      abortData?.[targetChatId]?.abortController?.abort();
    }
    return isAbort;
  };

  const resetAbortData = (targetChatId: string) => {
    abortControllerRef.current = new AbortController();
    setAbortData({
      id: targetChatId,
      data: {
        abortController: abortControllerRef.current,
        isAbort: false,
      },
    });
    abortData[targetChatId!] = {
      abortController: abortControllerRef.current,
      isAbort: false,
    };
  };

  // JSON 버퍼 관리 (클래스 레벨)
  let jsonBuffer = '';

  const parseMessage = async (streamValue: any, targetChatId: string) => {
    console.log(streamValue);
    if (streamValue === 'done') {
      console.log('** CHAT EVENT STREAM DONE **');
      // 버퍼 초기화
      jsonBuffer = '';
      return;
    }

    // 버퍼에 추가
    jsonBuffer += streamValue;
    const lines = jsonBuffer.split('\n');

    // 마지막 줄은 완전하지 않을 수 있으므로 버퍼에 보관
    jsonBuffer = lines.pop() || '';

    for (const dataLine of lines) {
      if (!dataLine.trim().startsWith('data: ')) continue;
      const jsonString = dataLine.replace(/^data: /, '').trim();
      if (jsonString === '[DONE]') continue;

      try {
        const rawJson = JSON.parse(jsonString);
        const dataJson = toCamelCase(rawJson);
        console.log('dataJson :: ', dataJson);
        const choice = dataJson.choices?.length > 0 && dataJson.choices[0];
        if (choice) {
          const messageData: IMessageResponse = {
            role: 'assistant',
            type: 'assistant',
            content: choice?.delta?.content ?? '',
          };
          await setAiMessageData(messageData);
        } else if (dataJson.type === 'answer' && dataJson.content) {
          // post_process_stream 포맷 처리
          const messageData: IMessageResponse = {
            role: 'assistant',
            type: 'assistant',
            content: dataJson.content,
          };
          await setAiMessageData(messageData);
        } else if (dataJson.type === 'sources' && dataJson.sources) {
          // agent sources 이벤트 처리 — snake_case → camelCase 변환 후 메시지에 추가
          const mappedSources = dataJson.sources.map((s: Record<string, unknown>) => ({
            index: s.index,
            title: s.title,
            score: s.score,
            content: s.content,
            contentPreview: s.content_preview ?? s.contentPreview,
            documentPath: s.document_path ?? s.documentPath,
            pageNumber: s.page_number ?? s.pageNumber,
            tagsTopic: s.tags_topic ?? s.tagsTopic,
            author: s.author,
            issue: s.issue,
            bm25Score: s.bm25_score ?? s.bm25Score,
            bm25Rank: s.bm25_rank ?? s.bm25Rank,
            vectorScore: s.vector_score ?? s.vectorScore,
            vectorRank: s.vector_rank ?? s.vectorRank,
            rerankerScore: s.reranker_score ?? s.rerankerScore,
            rrfScore: s.rrf_score_raw ?? s.rrfScore,
            absoluteRelevance: s.absolute_relevance ?? s.absoluteRelevance,
            confidenceLevel: s.confidence_level ?? s.confidenceLevel,
          }));
          const lastMessageData = messagesRef.current[messagesRef.current.length - 1] || null;
          if (lastMessageData) {
            messagesRef.current = [
              ...messagesRef.current.slice(0, messagesRef.current.length - 1),
              { ...lastMessageData, sources: mappedSources },
            ];
          }
        } else if (dataJson.type === 'metadata' && dataJson.metadata) {
          // metadata 이벤트 처리 — elapsedSeconds를 현재 assistant 메시지에 추가
          const lastMessageData = messagesRef.current[messagesRef.current.length - 1] || null;
          if (lastMessageData && dataJson.metadata.elapsedSeconds != null) {
            messagesRef.current = [
              ...messagesRef.current.slice(0, messagesRef.current.length - 1),
              { ...lastMessageData, elapsedSeconds: dataJson.metadata.elapsedSeconds },
            ];
          }
        } else if (!dataJson.type && dataJson.content) {
          // 백엔드 에러 메시지 포맷 {"content": "오류..."} — 에러로 표시
          const messageData: IMessageResponse = {
            role: 'assistant',
            type: 'error',
            content: dataJson.content,
          };
          await setAiMessageData(messageData);
        }
        // switch (dataJson.type) {
        // case 'user_message':
        //   userUuid.current = dataJson.messageId;
        //   break;
        // case 'progress':
        //   await setThoughtData(dataJson);
        //   break;
        // case 'ai':
        //   await setAiMessageData(dataJson);
        //   break;
        // case 'citation':
        //   await setCitationData(dataJson.data);
        //   break;
        //   case 'cancelled':
        //     await setCancelledData(dataJson);
        //     break;
        //   case 'error':
        //     throw new Error(
        //       `X ${t('chat.errorOccurred')}: ${dataJson.message}`
        //     );
        //   default:
        //     break;
        // }
        if (checkIsAborted(targetChatId)) break;

        // messages 아톰데이터 실시간 업데이트 (throttle: 150ms)
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 150) {
          setChatData({
            id: targetChatId,
            data: {
              messages: messagesRef.current,
            },
          });
          lastUpdateTimeRef.current = now;
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        console.warn('JSON parse error:', error);
        console.warn('Invalid JSON string:', jsonString);
        console.warn('Buffer content:', jsonBuffer);
        // 잘린 JSON은 버퍼에 다시 추가해서 다음 데이터와 연결
        jsonBuffer = jsonString + '\n' + jsonBuffer;
        break; // 현재 라인은 처리하지 않고 다음 데이터를 기다림
      }
    }
  };

  /** 로딩 상태 중단 */
  const haltLoadingMessage = () => {
    // const lastMessage = messagesRef.current[messagesRef.current.length - 1];
    // // cancel message는 건드리지 않음
    // if (lastMessage?.role === 'system' && lastMessage?.isCancelled) {
    //   console.log('haltLoadingMessage: cancel message exists, skipping');
    //   return;
    // }
    // if (lastMessage?.type !== 'progress') return;
    // messagesRef.current = messagesRef.current.map((message, index) => {
    //   if (index === messagesRef.current.length - 1) {
    //     return { ...message, type: 'ai_response_complete' };
    //   }
    //   return message;
    // });
  };

  /** 메시지 중단 */
  const haltMessage = async () => {
    // console.log('haltMessage - messagesRef.current :: ', messagesRef.current);
    // // ✅ cancelMessage에서 이미 처리했는지 확인
    // const cancelMessageData: IMessage = {
    //   role: 'system',
    //   content: `\u26A0\uFE0F ${t('chat.cancelMessage')}`,
    //   timestamp: new Date().toISOString(),
    //   isCancelled: true,
    // };
    // const lastMessage = messagesRef.current[messagesRef.current.length - 1];
    // if (!lastMessage) return;
    // // progress 중이면, cancel message로 대체
    // if (lastMessage.type === 'progress') {
    //   messagesRef.current = [
    //     ...messagesRef.current.slice(0, messagesRef.current.length - 1),
    //     cancelMessageData,
    //   ];
    // } else {
    //   // 아니면, cancel message를 마지막에 추가
    //   messagesRef.current = [...messagesRef.current, cancelMessageData];
    // }
  };

  /** 에러 메시지인 경우 현재까지 받은 데이터 기준으로 저장 */
  const setErrorMessages = async (error: any) => {
    const errMessage = error.message;
    const lastMessageData = messagesRef.current[messagesRef.current.length - 1] || null;
    // if (lastMessageData.isCancelled) return;

    const messageData: IMessage = {
      ...lastMessageData,
      type: 'error',
      content: errMessage,
      // timestamp: new Date().toISOString(),
    };
    messagesRef.current = [
      ...messagesRef.current.slice(0, messagesRef.current.length - 1),
      messageData,
    ];
  };

  /** 에이전트에 채팅 응답 요청 */
  const generateMessage = async (
    // message: string,
    targetChatId: string,
    messages: IMessageRequest[],
    messageInfo: IMessageInfo,
    useStream: boolean
  ) => {
    let chatSimpleApiResponse: IMessageJsonResponse | undefined;

    try {
      const newAiMessage: IMessage = {
        // assistant 신규 메시지를 생성 - 빈메시지
        role: 'assistant',
        type: 'progress',
        content: '',
      };
      // botUuid.current = newAiMessage.uuid; // 신규 메시지의 ai의 uuid 저장
      // resetAbortData(targetChatId);
      messagesRef.current = [...messagesRef.current, newAiMessage]; // 기존 데이터와 로딩 중 ai 메시지를 합쳐서 전체 메시지의 최신상태 유지

      setChatData({
        id: targetChatId,
        data: {
          chatId: targetChatId,
          title: chatData.title || '',
          isGenerating: true,
          messages: messagesRef.current,
        },
      });

      if (USE_MOCK_RESPONSE) {
        await new Promise((r) => setTimeout(r, 800));
        const mockMessage: IMessage = {
          role: 'assistant',
          type: 'assistant',
          content: '테스트 답변입니다. 정상적으로 응답이 생성되었습니다.',
        };
        messagesRef.current = [
          ...messagesRef.current.slice(0, messagesRef.current.length - 1),
          mockMessage,
        ];
      } else {
        const partialParseMessage = async (streamValue: any) => {
          await parseMessage(streamValue, targetChatId);
        };

        await agentStreamApi(
          {
            query: messages[messages.length - 1]?.content ?? '',
            chatHistory: messages.slice(0, -1),
            agentName: selectedAgent?.name ?? 'mentor',
            version: selectedAgent?.version ?? 'v1',
            provider: messageInfo.provider,
            model: messageInfo.model,
            orgId: messageInfo.orgId,
            sessionId: targetChatId,
          },
          partialParseMessage,
          abortControllerRef.current?.signal
        );
      }
    } catch (error: any) {
      console.error(error);
      if (error.message !== 'end') {
        if (error?.name === 'AbortError') {
          await haltMessage();
        } else {
          await setErrorMessages(error);
        }
      } else {
        await setErrorMessages(error);
      }
    } finally {
      // throttle 타이머 초기화 (다음 스트리밍을 위해)
      lastUpdateTimeRef.current = 0;
      haltLoadingMessage();
      console.log('isGenerating :: false');

      // 사이드바 히스토리 즉시 갱신
      window.dispatchEvent(new Event('agent-history-refresh'));

      if (chatSimpleApiResponse) {
        setAiMessageData({
          role: chatSimpleApiResponse.choices[0].message.role,
          content: chatSimpleApiResponse.choices[0].message.content,
        });
      }

      setChatData({
        id: targetChatId,
        data: {
          isGenerating: false,
          chatId: targetChatId,
          messages: messagesRef.current,
          title: chatData.title,
        },
      });
    }
  };

  /** 채팅 메시지 입력 시 채팅방 이동 및 채팅 응답 요청 함수 호출 */
  const sendMessage = async (message: string) => {
    // 현재 채팅이 진행중이면 전송 불가
    if (chatId !== '-1' && chatData?.isGenerating) return;

    let targetChatId = chatId;
    // 새 채팅일 경우, 채팅방 생성 요청
    if (chatId === '-1') {
      // const res = await createHistoryMutate.mutateAsync({
      //   title: message.slice(0, 30),
      // });
      targetChatId = uuidv7(); //res.id; // 임시로 chatId를 FE에서 생성하여 사용
      console.log('chatData :: ', chatData);
      setChatData({
        id: targetChatId,
        data: {
          chatId: targetChatId,
          title: message.slice(0, 30), //res.title, // BE에서는 FE가 req 넘긴값을 그대로 전달하고 있음.
          messages: [],
          isGenerating: false,
        },
      });
      setCurrentChatId(targetChatId);
      navigate(`/chat/${targetChatId}`, { replace: true, state: null });
      // 히스토리 리스트 새로고침
      // getHistoryListQuery.refetch();
      // 새로운 채팅인 경우, 활성 채팅 목록에 chat id 추가
      await manageActiveChatIds(targetChatId);
    }

    // 새 채팅이 아닌 경우에만 기존 메시지 유지
    if (chatId !== '-1') {
      messagesRef.current = chatData?.messages || [];
    }
    // 새 채팅인 경우 messagesRef.current는 이미 빈 배열로 초기화됨
    // setCurrentChatId(targetChatId);
    createUserMessage(message);

    await generateMessage(
      targetChatId,
      getMessagesRequest(),
      getMessageInfo(),
      true //false
    );
  };

  const cancelMessage = async (targetChatId: string) => {
    const res = await chatCancelApi(targetChatId);
    if (!res?.data?.cancelled) {
      showToast('채팅 취소가 실패되었습니다.');
      return;
    }
    console.log('cancelMessage:: abort()');

    // Abort 실행 전에 플래그 설정
    abortData[targetChatId!].abortController?.abort();
    abortData[targetChatId!].isAbort = true;
  };

  return {
    sendMessage,
    cancelMessage,
  };
};
