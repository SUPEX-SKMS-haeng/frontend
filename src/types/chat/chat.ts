import type { IMessage } from '@/types/chat/message';

export interface IChat {
  chatId: string;
  title: string;
  messages: IMessage[];
  isGenerating: boolean;
  userInput: string;
}

export interface IAbortData {
  abortController: AbortController;
  isAbort: boolean;
  hasCancelMessage?: boolean; // cancelMessage에서 이미 cancel 메시지를 추가했는지 여부
  cancelledMessages?: IMessage[]; // cancelMessage에서 생성한 최종 메시지 배열
}

export interface IChatScroll {
  isAtTop: boolean;
  isAtBottom: boolean;
  userScrolled: boolean;
  isOverflowing: boolean;
  isAutoScrolling: boolean;
}
