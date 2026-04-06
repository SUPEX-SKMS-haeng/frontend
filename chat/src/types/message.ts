export interface IThought {
  step: string;
  message: string;
}

export interface ICitation {
  chatId?: number;
  messageUuid?: string;
  id: string;
  title: string;
  originalUrl?: string;
  page?: number;
  content?: string;
  docPermission?: string;
}

export interface IFeedback {
  messageUuid: string;
  ratingId: string;
  ratingScore: number;
  ratingComment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MessageType = 'user' | 'assistant' | 'progress' | 'cancelled' | 'error';
export type MessageRoleType = 'user' | 'assistant' | 'system';

export interface ISource {
  title: string;
  score?: number;
  contentPreview?: string;
}

export interface IMessage {
  role: MessageRoleType;
  content: string;
  // timestamp: string;
  // isCancelled?: boolean;
  // uuid: string;
  type?: MessageType;
  // feedback?: IFeedback;
  // thoughts?: IThought[];
  // citations?: ICitation[];
  sources?: ISource[];
  elapsedSeconds?: number;
}

export interface IMessageRequest {
  role: MessageRoleType;
  content: string;
}

export interface IMessageInfo {
  orgId: number;
  scopeType?: string;
  scopeValue?: string;
  provider: string;
  model: string;
}

/** json type message response  */
export interface IMessageJsonResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: IChoice[];
  usage: IUsage;
  systemFingerprint: string;
}
export interface IChoice {
  index: number;
  message: IMessage;
  finishReason: string;
}
export interface IUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** streaming message response  */
export interface IMessageResponse {
  role: MessageRoleType;
  content: string;
  type?: MessageType;
  timestamp?: string;
  messageId?: string;
  userId?: string;
  message?: string;
  step?: string;
}

export interface IMessageCancelResponse {
  message: string;
  cancelled: boolean;
}

export interface IMessageFeedbackResponse {
  message?: string;
  ratings?: any;
  rating?: any;
}
